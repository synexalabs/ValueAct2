"""
bAV-Bewertungsmodul — Betriebliche Altersversorgung
Implementiert:
  - IAS 19 Projected Unit Credit (DBO, Dienstzeitaufwand, Zinsaufwand)
  - HGB/BilMoG Bewertung (§ 253 Abs. 1 u. 2 HGB)
  - Vergleichsrechnung IAS 19 vs. HGB

Biometrische Grundlagen:
  - Heubeck RT 2018 G (Benutzer-Upload, lizenzpflichtig)
  - DAV-Sterbetafeln als Näherung für Basisversion

Rechnungszins:
  - IAS 19: Rendite hochwertiger Unternehmensanleihen (iBoxx EUR Corporates AA 10+)
  - HGB: § 253 Abs. 2 HGB — Durchschnittszins der Deutschen Bundesbank (7 bzw. 10 Jahre)
"""

import numpy as np
from typing import Dict, Any, List, Optional
from datetime import datetime, date
from dataclasses import dataclass, asdict
import logging

from utils.audit_logger import AuditContext

logger = logging.getLogger(__name__)


# ============================================================================
# HGB RECHNUNGSZINS — Deutsche Bundesbank Durchschnittszinssätze
# § 253 Abs. 2 HGB: 7-Jahres-Durchschnitt (mit Übergangsregelung 10 Jahre)
# Quelle: Deutsche Bundesbank Zeitreihe BBK01.WX4260
# Aktualisierung: monatlich durch Bundesbank
# ============================================================================

HGB_DISCOUNT_RATES = {
    # Stichtag → 7-Jahres-Durchschnitt (§ 253 Abs. 2 HGB)
    # Restlaufzeit 15 Jahre (typisch für Pensionsrückstellungen)
    "2024-12-31": {"7year": 0.0183, "10year": 0.0149},
    "2024-09-30": {"7year": 0.0177, "10year": 0.0144},
    "2024-06-30": {"7year": 0.0170, "10year": 0.0137},
    "2024-03-31": {"7year": 0.0163, "10year": 0.0131},
    "2023-12-31": {"7year": 0.0157, "10year": 0.0125},
    "2023-06-30": {"7year": 0.0140, "10year": 0.0110},
    "2022-12-31": {"7year": 0.0187, "10year": 0.0144},
}


def get_hgb_discount_rate(
    valuation_date: str = "2024-12-31",
    averaging_period: int = 7,
) -> float:
    """
    Hole den HGB-Rechnungszins gem. § 253 Abs. 2 HGB.

    Args:
        valuation_date: Bewertungsstichtag (ISO-Format YYYY-MM-DD)
        averaging_period: 7 oder 10 Jahre Durchschnitt

    Returns:
        Rechnungszins als Dezimalzahl
    """
    key = "7year" if averaging_period == 7 else "10year"
    # Suche nächstliegenden Stichtag
    dates = sorted(HGB_DISCOUNT_RATES.keys(), reverse=True)
    for d in dates:
        if d <= valuation_date:
            return HGB_DISCOUNT_RATES[d][key]
    return HGB_DISCOUNT_RATES[dates[-1]][key]


# ============================================================================
# IAS 19 RECHNUNGSZINS — AA-Unternehmensanleihen
# ============================================================================

IAS19_DISCOUNT_RATES = {
    # iBoxx EUR Corporates AA 10+ Renditen (Näherung)
    "2024-12-31": 0.0340,
    "2024-06-30": 0.0365,
    "2023-12-31": 0.0350,
    "2023-06-30": 0.0395,
    "2022-12-31": 0.0380,
}


def get_ias19_discount_rate(valuation_date: str = "2024-12-31") -> float:
    """Hole IAS 19-Rechnungszins (AA-Unternehmensanleihen)."""
    dates = sorted(IAS19_DISCOUNT_RATES.keys(), reverse=True)
    for d in dates:
        if d <= valuation_date:
            return IAS19_DISCOUNT_RATES[d]
    return IAS19_DISCOUNT_RATES[dates[-1]]


# ============================================================================
# BIOMETRISCHE ANNAHMEN
# ============================================================================

@dataclass
class BiometricAssumptions:
    """Biometrische Annahmen für bAV-Bewertung."""
    mortality_table: str = "DAV_2008_T"  # oder "HEUBECK_RT2018G" bei Upload
    retirement_age: int = 67           # Regelaltersgrenze
    invalidity_rate: float = 0.005     # Jährliche Invaliditätswahrscheinlichkeit
    fluctuation_rate: float = 0.03     # Jährliche Fluktuation
    marriage_probability: float = 0.80 # Anteil Verheirateter bei Tod
    pension_trend: float = 0.015       # Jährliche Rentenanpassung (§ 16 BetrAVG)
    salary_trend: float = 0.025        # Jährliche Gehaltssteigerung


# ============================================================================
# PENSIONSZUSAGEN-DATENMODELL
# ============================================================================

@dataclass
class PensionCommitment:
    """Einzelne Pensionszusage für bAV-Bewertung."""
    id: str
    employee_name: Optional[str] = None
    birth_date: str = "1975-01-01"
    entry_date: str = "2000-01-01"
    gender: str = "M"
    current_salary: float = 60000.0
    pension_type: str = "direktzusage"  # direktzusage, unterstuetzungskasse, pensionskasse, pensionsfonds, direktversicherung
    benefit_type: str = "festbetrag"    # festbetrag, gehaltsabhaengig, beitragsorientiert
    annual_pension: float = 12000.0    # Jährliche Rentenleistung (bei Festbetrag)
    pension_factor: float = 0.01       # Prozentsatz des Gehalts pro Dienstjahr (bei gehaltsabhängig)
    vesting_period: int = 0            # Unverfallbarkeitsfrist in Jahren
    has_survivors_benefit: bool = True # Hinterbliebenenversorgung
    survivors_fraction: float = 0.60   # Prozentsatz der Altersrente als Witwen-/Witwerrente
    has_invalidity_benefit: bool = True
    invalidity_fraction: float = 1.0   # Anteil der projizierten Altersrente


def _parse_date(s: str) -> date:
    return datetime.fromisoformat(s).date()


def _years_between(d1: date, d2: date) -> float:
    return (d2 - d1).days / 365.25


# ============================================================================
# IAS 19 — PROJECTED UNIT CREDIT METHODE
# ============================================================================

def calculate_dbo_ias19(
    commitment: Dict[str, Any],
    assumptions: Dict[str, Any],
    valuation_date: str = "2024-12-31",
) -> Dict[str, Any]:
    """
    Berechne DBO nach IAS 19 Projected Unit Credit Verfahren.

    IAS 19.67-69: Die DBO wird als Barwert der zum Bewertungsstichtag
    erdienten Leistungen berechnet, projiziert auf den Pensionseintritt.

    Formel:
      projected_pension = annual_pension × (1 + pension_trend)^years_to_retirement
      dbo = projected_pension × annuity_factor × (past_service / total_service) × discount_factor

    Args:
        commitment: Pensionszusage als Dictionary
        assumptions: Bewertungsannahmen
        valuation_date: Bewertungsstichtag

    Returns:
        Dictionary mit DBO, Dienstzeitaufwand, Zinsaufwand und Details
    """
    calc_id = f"BAV_IAS19_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    with AuditContext(calc_id, "BAV_IAS19_v1.0.0") as audit:
        vd = _parse_date(valuation_date)
        birth = _parse_date(commitment.get("birth_date", "1975-01-01"))
        entry = _parse_date(commitment.get("entry_date", "2000-01-01"))

        retirement_age = assumptions.get("retirement_age", 67)
        pension_trend = assumptions.get("pension_trend", 0.015)
        salary_trend = assumptions.get("salary_trend", 0.025)
        discount_rate = assumptions.get("discount_rate") or get_ias19_discount_rate(valuation_date)
        mortality_table = assumptions.get("mortality_table", "DAV_2004_R")

        # Schlüsselzeitpunkte
        age_at_valuation = _years_between(birth, vd)
        retirement_date = date(birth.year + retirement_age, birth.month, birth.day)
        years_to_retirement = max(0, _years_between(vd, retirement_date))
        past_service = _years_between(entry, vd)
        total_service = _years_between(entry, retirement_date)

        audit.set_calculation_inputs({
            "valuation_date": valuation_date,
            "age": round(age_at_valuation, 1),
            "years_to_retirement": round(years_to_retirement, 1),
            "past_service": round(past_service, 1),
            "total_service": round(total_service, 1),
            "discount_rate": discount_rate,
        })

        # 1. Projizierte Jahresrente bei Pensionseintritt
        benefit_type = commitment.get("benefit_type", "festbetrag")
        annual_pension = commitment.get("annual_pension", 12000)

        if benefit_type == "gehaltsabhaengig":
            current_salary = commitment.get("current_salary", 60000)
            pension_factor = commitment.get("pension_factor", 0.01)
            projected_salary = current_salary * (1 + salary_trend) ** years_to_retirement
            projected_pension = projected_salary * pension_factor * total_service
        elif benefit_type == "beitragsorientiert":
            # Beitragsorientiert: Pension wächst mit Gehaltstrend
            projected_pension = annual_pension * (1 + salary_trend) ** years_to_retirement
        else:
            # Festbetrag: wächst nur mit Rententrend nach Eintritt
            projected_pension = annual_pension

        audit.add_calculation_step(
            "Projizierte Jahresrente",
            f"Rente bei Pensionseintritt (Alter {retirement_age})",
            formula="R_{proj} = R_0 \\times (1 + trend)^{n}",
            inputs={"annual_pension": annual_pension, "years_to_retirement": years_to_retirement},
        )
        audit.add_intermediate_result("Projizierte Jahresrente", projected_pension, "EUR/Jahr", "Bei Pensionseintritt")

        # 2. Rentenbarwertfaktor (Barwert einer lebenslangen Rente bei Pensionseintritt)
        from data.mortality_tables import get_mortality_rate
        annuity_factor = 0.0
        for t in range(1, 50):  # max 50 Jahre Rentenbezug
            age_t = retirement_age + t
            if age_t > 120:
                break
            # Überlebenswahrscheinlichkeit vom Renteneintritt bis zum Jahr t
            survival = 1.0
            for s in range(t):
                qx_s = get_mortality_rate(mortality_table, retirement_age + s, commitment.get("gender", "M"))
                survival *= (1 - qx_s)
            # Rentenzahlung mit Rententrend diskontiert
            payment = (1 + pension_trend) ** t
            annuity_factor += survival * payment / (1 + discount_rate) ** t

        audit.add_intermediate_result("Rentenbarwertfaktor", annuity_factor, "Jahre", "Barwert-Äquivalent")

        # 3. Hinterbliebenenversorgung (Zuschlag)
        survivors_factor = 1.0
        if commitment.get("has_survivors_benefit", True):
            marriage_prob = assumptions.get("marriage_probability", 0.80)
            survivors_frac = commitment.get("survivors_fraction", 0.60)
            # Vereinfachte Näherung: Zuschlag ≈ marriage_prob × survivors_frac × Rentenbarwertfaktor_Hinterbliebene
            # Hinterbliebene sind typischerweise 3 Jahre jünger
            survivors_annuity = annuity_factor * 0.85  # Näherung
            survivors_factor = 1 + marriage_prob * survivors_frac * (survivors_annuity / annuity_factor)

        audit.add_intermediate_result("Hinterbliebenenzuschlag", survivors_factor, "Faktor", "Multiplikator auf DBO")

        # 4. Invaliditätsleistung (Zuschlag)
        invalidity_factor = 1.0
        if commitment.get("has_invalidity_benefit", True):
            inv_rate = assumptions.get("invalidity_rate", 0.005)
            inv_frac = commitment.get("invalidity_fraction", 1.0)
            # Vereinfachte Näherung
            invalidity_factor = 1 + inv_rate * inv_frac * years_to_retirement * 0.5

        # 5. Erdienungsquote (Past Service / Total Service)
        attribution_ratio = min(1.0, past_service / total_service) if total_service > 0 else 1.0

        audit.add_calculation_step(
            "Erdienungsquote",
            "Past Service / Total Service gem. IAS 19.70",
            formula="q = \\frac{T_{past}}{T_{total}}",
            inputs={"past_service": past_service, "total_service": total_service},
        )
        audit.add_intermediate_result("Erdienungsquote", attribution_ratio, "Quote", "Anteil erdient")

        # 6. Diskontierungsfaktor auf Bewertungsstichtag
        discount_factor = 1 / (1 + discount_rate) ** years_to_retirement

        # 7. DBO-Berechnung
        dbo = (
            projected_pension
            * annuity_factor
            * survivors_factor
            * invalidity_factor
            * attribution_ratio
            * discount_factor
        )

        audit.add_calculation_step(
            "DBO-Berechnung",
            "Projected Unit Credit gem. IAS 19.67",
            formula="DBO = R_{proj} \\times \\ddot{a} \\times HBL \\times INV \\times q \\times v^n",
        )
        audit.add_intermediate_result("DBO", dbo, "EUR", "Defined Benefit Obligation")

        # 8. Dienstzeitaufwand (Current Service Cost)
        if total_service > 0:
            current_service_cost = dbo / past_service * 1.0 if past_service > 0 else dbo / total_service
        else:
            current_service_cost = 0.0

        # 9. Zinsaufwand (Net Interest)
        interest_cost = dbo * discount_rate

        # 10. Fluktuationsabschlag
        fluct_rate = assumptions.get("fluctuation_rate", 0.03)
        fluctuation_discount = (1 - fluct_rate) ** max(0, years_to_retirement)
        dbo_after_fluctuation = dbo * fluctuation_discount

        audit.add_intermediate_result("Fluktuationsabschlag", 1 - fluctuation_discount, "Quote", "Reduktion durch Fluktuation")
        audit.add_intermediate_result("DBO nach Fluktuation", dbo_after_fluctuation, "EUR", "Bereinigt um Fluktuation")

        # PSVaG-Beitragspflicht
        psvag_rate = 0.003  # Promillesatz (~3‰ als Durchschnitt)
        psvag_contribution = dbo_after_fluctuation * psvag_rate

        result = {
            "valuation_standard": "IAS 19",
            "valuation_date": valuation_date,
            "dbo": round(dbo, 2),
            "dbo_after_fluctuation": round(dbo_after_fluctuation, 2),
            "current_service_cost": round(current_service_cost, 2),
            "interest_cost": round(interest_cost, 2),
            "discount_rate": discount_rate,
            "projected_pension": round(projected_pension, 2),
            "annuity_factor": round(annuity_factor, 4),
            "attribution_ratio": round(attribution_ratio, 4),
            "survivors_factor": round(survivors_factor, 4),
            "invalidity_factor": round(invalidity_factor, 4),
            "fluctuation_discount": round(fluctuation_discount, 4),
            "psvag_contribution": round(psvag_contribution, 2),
            "age": round(age_at_valuation, 1),
            "years_to_retirement": round(years_to_retirement, 1),
            "past_service": round(past_service, 1),
            "total_service": round(total_service, 1),
            "audit_trail": audit.get_audit_trail(),
            "methodology_version": "1.0.0",
        }

        return result


def calculate_dbo_hgb(
    commitment: Dict[str, Any],
    assumptions: Dict[str, Any],
    valuation_date: str = "2024-12-31",
) -> Dict[str, Any]:
    """
    Berechne Pensionsrückstellung nach HGB/BilMoG (§ 253 Abs. 1 u. 2 HGB).

    Unterschiede zu IAS 19:
    - Rechnungszins: 7- oder 10-Jahres-Durchschnitt der Deutschen Bundesbank
    - Keine Projektion der Gehaltssteigerungen (ohne Gehaltstrend)
    """
    averaging_period = assumptions.get("hgb_averaging_period", 7)
    hgb_rate = get_hgb_discount_rate(valuation_date, averaging_period)

    hgb_assumptions = {
        **assumptions,
        "discount_rate": hgb_rate,
        "salary_trend": 0.0,  # HGB: typischerweise ohne Gehaltstrend
    }

    result = calculate_dbo_ias19(commitment, hgb_assumptions, valuation_date)
    result["valuation_standard"] = "HGB/BilMoG"
    result["hgb_averaging_period"] = averaging_period
    result["hgb_discount_rate"] = hgb_rate

    return result


def calculate_bav_comparison(
    commitment: Dict[str, Any],
    assumptions: Dict[str, Any],
    valuation_date: str = "2024-12-31",
) -> Dict[str, Any]:
    """
    Vergleichsrechnung IAS 19 vs. HGB für eine Pensionszusage.
    """
    ias19 = calculate_dbo_ias19(commitment, assumptions, valuation_date)
    hgb = calculate_dbo_hgb(commitment, assumptions, valuation_date)

    difference = ias19["dbo"] - hgb["dbo"]

    return {
        "ias19": ias19,
        "hgb": hgb,
        "difference": round(difference, 2),
        "difference_pct": round(difference / hgb["dbo"] * 100, 2) if hgb["dbo"] != 0 else 0,
        "valuation_date": valuation_date,
        "summary": {
            "ias19_dbo": ias19["dbo"],
            "hgb_dbo": hgb["dbo"],
            "ias19_rate": ias19["discount_rate"],
            "hgb_rate": hgb["hgb_discount_rate"],
            "ias19_service_cost": ias19["current_service_cost"],
            "ias19_interest_cost": ias19["interest_cost"],
        }
    }


def calculate_bav_portfolio(
    commitments: List[Dict[str, Any]],
    assumptions: Dict[str, Any],
    valuation_date: str = "2024-12-31",
    standard: str = "ias19",
) -> Dict[str, Any]:
    """
    Portfoliobewertung für mehrere Pensionszusagen.
    """
    results = []
    total_dbo = 0.0
    total_service_cost = 0.0
    total_interest = 0.0
    total_psvag = 0.0

    for c in commitments:
        if standard == "comparison":
            r = calculate_bav_comparison(c, assumptions, valuation_date)
            total_dbo += r["ias19"]["dbo"]
            results.append(r)
        elif standard == "hgb":
            r = calculate_dbo_hgb(c, assumptions, valuation_date)
            total_dbo += r["dbo"]
            total_service_cost += r["current_service_cost"]
            total_interest += r["interest_cost"]
            total_psvag += r["psvag_contribution"]
            results.append(r)
        else:
            r = calculate_dbo_ias19(c, assumptions, valuation_date)
            total_dbo += r["dbo"]
            total_service_cost += r["current_service_cost"]
            total_interest += r["interest_cost"]
            total_psvag += r["psvag_contribution"]
            results.append(r)

    return {
        "standard": standard,
        "valuation_date": valuation_date,
        "commitment_count": len(commitments),
        "total_dbo": round(total_dbo, 2),
        "total_service_cost": round(total_service_cost, 2),
        "total_interest_cost": round(total_interest, 2),
        "total_psvag": round(total_psvag, 2),
        "commitment_results": results,
        "assumptions": assumptions,
    }
