# ValueAct Rechner — bAV-Erweiterung (Betriebliche Altersversorgung)

## KONTEXT

Die App ist ein Online-Rechner für deutsche Aktuare mit IFRS 17 CSM-Rechner, Solvency II SCR-Rechner, DAV-Sterbetafeln und EIOPA-Zinskurve. Die Architektur: Next.js Client → Express Server → FastAPI Python Engine.

Diese Erweiterung fügt einen **bAV-Rechner** hinzu — Bewertung von Pensionsverpflichtungen nach IAS 19 (international) und HGB/BilMoG (deutsch). Das ist ein neues Berechnungsmodul, das die bestehende Infrastruktur (Audit Trail, Formatierung, Auth, Stripe, PDF-Export) mitnutzt.

**Wichtig:** Die Heubeck Richttafeln RT 2018 G sind urheberrechtlich geschützt. Wir implementieren eine Upload-Schnittstelle, keine eingebetteten Heubeck-Daten. Für die kostenlose Basisversion verwenden wir die DAV-Sterbetafeln als Näherung mit deutlichem Hinweis.

Arbeite die Phasen der Reihe nach ab.

---

## PHASE 1: PYTHON-BERECHNUNGSMODUL

### 1.1 Erstelle `actuarial-engine/calculations/bav.py`

Dies ist das Herzstück der bAV-Erweiterung. Implementiere die DBO-Berechnung nach IAS 19 Projected Unit Credit (PUC) Verfahren.

```python
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
    benefit_type: str = "festbetrag"     # festbetrag, gehaltsabhaengig, beitragsorientiert
    annual_pension: float = 12000.0     # Jährliche Rentenleistung (bei Festbetrag)
    pension_factor: float = 0.01        # Prozentsatz des Gehalts pro Dienstjahr (bei gehaltsabhängig)
    vesting_period: int = 0             # Unverfallbarkeitsfrist in Jahren
    has_survivors_benefit: bool = True  # Hinterbliebenenversorgung
    survivors_fraction: float = 0.60    # Prozentsatz der Altersrente als Witwen-/Witwerrente
    has_invalidity_benefit: bool = True
    invalidity_fraction: float = 1.0    # Anteil der projizierten Altersrente


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

        # 2. Rentenbarkeitsfaktor (Barwert einer lebenslangen Rente bei Pensionseintritt)
        from data.mortality_tables import get_mortality_rate
        annuity_factor = 0.0
        for t in range(1, 50):  # max 50 Jahre Rentenbezug
            age_t = retirement_age + t
            if age_t > 120:
                break
            qx = get_mortality_rate(mortality_table, age_t, commitment.get("gender", "M"))
            # Näherung: konstante Sterblichkeit pro Jahr
            survival = 1.0
            for s in range(t):
                qx_s = get_mortality_rate(mortality_table, retirement_age + s, commitment.get("gender", "M"))
                survival *= (1 - qx_s)
            # Rentenzahlung mit Rententrend
            payment = (1 + pension_trend) ** t
            annuity_factor += survival * payment / (1 + discount_rate) ** t

        audit.add_intermediate_result("Rentenbarkeitsfaktor", annuity_factor, "Jahre", "Barwert-Äquivalent")

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
        # Vereinfachung: Zinsaufwand ≈ DBO × Rechnungszins
        interest_cost = dbo * discount_rate

        # 10. Fluktuationsabschlag
        fluct_rate = assumptions.get("fluctuation_rate", 0.03)
        fluctuation_discount = (1 - fluct_rate) ** max(0, years_to_retirement)
        dbo_after_fluctuation = dbo * fluctuation_discount

        audit.add_intermediate_result("Fluktuationsabschlag", 1 - fluctuation_discount, "Quote", "Reduktion durch Fluktuation")
        audit.add_intermediate_result("DBO nach Fluktuation", dbo_after_fluctuation, "EUR", "Bereinigt um Fluktuation")

        # PSVaG-Beitragspflicht
        psvag_rate = 0.003  # Promillesatz (schwankt jährlich, ~3‰ als Durchschnitt)
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
    - Rechnungszins: 7- oder 10-Jahres-Durchschnitt der Deutschen Bundesbank (§ 253 Abs. 2 HGB)
    - Keine Projektion der Gehaltssteigerungen (umstritten, aber häufig ohne Gehaltstrend)
    - Steuerlicher Teilwert als Alternative (§ 6a EStG) — nicht implementiert hier

    Args:
        commitment: Pensionszusage
        assumptions: Annahmen (können hgb_averaging_period enthalten)
        valuation_date: Stichtag

    Returns:
        Dictionary mit HGB-Rückstellung und Details
    """
    averaging_period = assumptions.get("hgb_averaging_period", 7)
    hgb_rate = get_hgb_discount_rate(valuation_date, averaging_period)

    # HGB-Bewertung = IAS 19 Berechnung mit angepasstem Zins und ohne Gehaltstrend
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

    Args:
        commitment: Pensionszusage
        assumptions: Annahmen
        valuation_date: Stichtag

    Returns:
        Dictionary mit beiden Bewertungen und Differenzanalyse
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

    Args:
        commitments: Liste von Pensionszusagen
        assumptions: Gemeinsame Annahmen
        valuation_date: Stichtag
        standard: "ias19", "hgb" oder "comparison"

    Returns:
        Portfolio-Ergebnisse mit Einzelergebnissen und Aggregaten
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
```

### 1.2 API-Endpoints hinzufügen — `actuarial-engine/main.py`

Füge am Ende der Datei, vor den Exception-Handlern, hinzu:

```python
@app.post("/api/v1/calculate/bav")
async def calculate_bav(request: dict):
    """
    bAV-Bewertung: DBO nach IAS 19 oder HGB/BilMoG.

    Body:
      commitment: { id, birth_date, entry_date, gender, annual_pension, ... }
      assumptions: { discount_rate?, retirement_age?, pension_trend?, ... }
      valuation_date: "2024-12-31"
      standard: "ias19" | "hgb" | "comparison"
    """
    try:
        from calculations.bav import (
            calculate_dbo_ias19, calculate_dbo_hgb,
            calculate_bav_comparison, calculate_bav_portfolio,
        )

        commitment = request.get("commitment")
        commitments = request.get("commitments")
        assumptions = request.get("assumptions", {})
        valuation_date = request.get("valuation_date", "2024-12-31")
        standard = request.get("standard", "ias19")

        if commitments:
            return calculate_bav_portfolio(commitments, assumptions, valuation_date, standard)
        elif commitment:
            if standard == "comparison":
                return calculate_bav_comparison(commitment, assumptions, valuation_date)
            elif standard == "hgb":
                return calculate_dbo_hgb(commitment, assumptions, valuation_date)
            else:
                return calculate_dbo_ias19(commitment, assumptions, valuation_date)
        else:
            raise HTTPException(status_code=400, detail="commitment oder commitments erforderlich")

    except HTTPException:
        raise
    except Exception as e:
        error_msg = sanitize_error_message(e, "bAV-Berechnung fehlgeschlagen")
        raise HTTPException(status_code=500, detail=error_msg)
```

---

## PHASE 2: SERVER-ROUTE

### 2.1 bAV-Route zum Express-Server hinzufügen

Füge in `server/routes/calculations.js` vor `module.exports` hinzu:

```javascript
// bAV pension valuation route
router.post('/bav', async (req, res) => {
  try {
    const { commitment, commitments, assumptions, valuation_date, standard } = req.body;
    if (!commitment && !commitments) {
      return res.status(400).json({ error: 'commitment oder commitments erforderlich' });
    }

    const response = await axios.post(
      `${PYTHON_ENGINE_URL}/api/v1/calculate/bav`,
      { commitment, commitments, assumptions, valuation_date, standard },
      { timeout: 60000 }
    );

    // Non-blocking history save
    const key = standard === 'comparison' ? 'comparison' : (standard === 'hgb' ? 'hgb_dbo' : 'ias19_dbo');
    const summary = commitments
      ? { total_dbo: response.data.total_dbo, count: response.data.commitment_count }
      : { dbo: response.data.dbo || response.data.ias19?.dbo };
    calculationService.saveResult(req.user.id, `bav_${key}`, { commitment, commitments, assumptions }, summary);

    res.json(response.data);
  } catch (err) {
    logger.error('bAV route error:', err.message);
    res.status(500).json({ error: 'bAV-Berechnung fehlgeschlagen' });
  }
});
```

Stelle sicher, dass `axios` und `PYTHON_ENGINE_URL` oben importiert sind. Füge hinzu falls fehlend:
```javascript
const axios = require('axios');
const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';
```

---

## PHASE 3: CLIENT-UI

### 3.1 bAV-Rechner Komponente

Erstelle `client/src/components/calculators/BAVCalculator.jsx`:

Baue eine Komponente nach dem Muster von IFRS17Calculator.jsx mit:

**Eingabe-Panel (links):**
- Geburtsdatum — date input, default "1975-01-01"
- Eintrittsdatum — date input, default "2000-01-01"
- Geschlecht — radio: Männlich (default) / Weiblich
- Aktuelle Jahresrente (€) — number, default 12000
- Leistungsart — dropdown: Festbetrag (default), Gehaltsabhängig, Beitragsorientiert
- Wenn "Gehaltsabhängig": Aktuelles Jahresgehalt (€) und Pensionsfaktor (%)
- Bewertungsstichtag — date input, default "2024-12-31"
- Bewertungsstandard — toggle: "IAS 19" / "HGB" / "Vergleich"

**Erweiterte Annahmen (einklappbar):**
- Renteneintrittsalter — default 67
- Rententrend (%) — default 1.5
- Gehaltstrend (%) — default 2.5
- Fluktuation (%) — default 3.0
- Hinterbliebenenversorgung — checkbox default an, mit Prozentsatz 60%
- Invaliditätsleistung — checkbox default an
- Sterbetafel — dropdown: DAV 2004 R (default), DAV 2008 T
- HGB-Durchschnittszeitraum — 7 Jahre / 10 Jahre (nur bei HGB)

**Ergebnis-Panel (rechts):**
- Große Zahl: DBO in EUR
- Bei Vergleich: Zwei Karten nebeneinander (IAS 19 DBO vs HGB DBO) mit Differenz
- Aufschlüsselung: Projizierte Rente, Erdienungsquote, Rentenbarwertfaktor, Hinterbliebenenzuschlag, Diskontfaktor
- Dienstzeitaufwand (Current Service Cost)
- Zinsaufwand (Interest Cost)
- PSVaG-Beitrag
- Disclaimer: "Diese Berechnungen ersetzen kein versicherungsmathematisches Gutachten."

**Pro-Features (gesperrt für Free):**
- Prüfpfad
- PDF-Export
- Portfolio-Upload (mehrere Zusagen als CSV)
- Sensitivitätsanalyse

Client-side Basisversion (Free-Tier): Implementiere eine vereinfachte DBO-Schätzung direkt in JavaScript (wie bei IFRS17Calculator), die eine grobe Näherung berechnet ohne Server-Call. Die Pro-Version ruft den Python-Engine auf.

### 3.2 Seite erstellen

Erstelle `client/src/app/(public)/rechner/bav/page.jsx`:

```jsx
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import BAVCalculator from '../../../../components/calculators/BAVCalculator';

export const metadata = {
  title: 'bAV-Rechner — Pensionsverpflichtungen nach IAS 19 und HGB | ValueAct',
  description: 'Kostenloser bAV-Rechner für Pensionsverpflichtungen. DBO nach IAS 19 Projected Unit Credit und HGB/BilMoG mit Vergleichsrechnung.',
  keywords: 'bAV, Pensionsverpflichtung, DBO, IAS 19, HGB, BilMoG, Projected Unit Credit, Pensionsrückstellung, betriebliche Altersversorgung',
  openGraph: {
    title: 'bAV-Rechner — Pensionsverpflichtungen berechnen',
    description: 'DBO-Berechnung nach IAS 19 und HGB/BilMoG. Vergleichsrechnung, Dienstzeitaufwand, Zinsaufwand.',
    locale: 'de_DE',
  },
};

export default function BAVPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-trust-950">bAV-Rechner</h1>
            <p className="text-gray-500 text-sm mt-1">Pensionsverpflichtungen nach IAS 19 und HGB/BilMoG</p>
          </div>
          <BAVCalculator />
        </div>
      </main>
      <Footer />
    </div>
  );
}
```

### 3.3 Client-side bAV-Berechnungen

Erstelle `client/src/utils/bavCalculations.js`:

```javascript
/**
 * bAV Calculation Utilities — vereinfachte Client-side Berechnungen für Free-Tier.
 * Volle Bewertung nach IAS 19 PUC läuft auf dem Python-Engine (Pro).
 */

/**
 * Vereinfachte DBO-Schätzung für den kostenlosen Rechner.
 */
export function estimateDBO({
  birthDate, entryDate, annualPension, retirementAge = 67,
  discountRate = 0.035, pensionTrend = 0.015, fluctuationRate = 0.03,
  survivorsFraction = 0.60, hasSurvivors = true,
} = {}) {
  const today = new Date();
  const birth = new Date(birthDate);
  const entry = new Date(entryDate);

  const age = (today - birth) / (365.25 * 86400000);
  const yearsToRetirement = Math.max(0, retirementAge - age);
  const pastService = (today - entry) / (365.25 * 86400000);
  const totalService = (new Date(birth.getFullYear() + retirementAge, birth.getMonth(), birth.getDate()) - entry) / (365.25 * 86400000);
  const attributionRatio = Math.min(1, pastService / totalService);

  // Rentenbarwertfaktor (Näherung mit Gompertz-Sterblichkeit)
  let annuityFactor = 0;
  let survival = 1;
  for (let t = 1; t <= 40; t++) {
    const ageT = retirementAge + t;
    const qx = Math.min(1, 0.0005 * Math.exp(0.085 * (ageT - 30)));
    survival *= (1 - qx);
    if (survival < 0.001) break;
    annuityFactor += survival * Math.pow(1 + pensionTrend, t) / Math.pow(1 + discountRate, t);
  }

  // Hinterbliebene
  const survivorsFactor = hasSurvivors ? 1 + 0.80 * survivorsFraction * 0.85 : 1;

  // Fluktuation
  const fluctDiscount = Math.pow(1 - fluctuationRate, yearsToRetirement);

  // DBO
  const discountFactor = 1 / Math.pow(1 + discountRate, yearsToRetirement);
  const dbo = annualPension * annuityFactor * survivorsFactor * attributionRatio * discountFactor * fluctDiscount;

  const serviceCost = pastService > 0 ? dbo / pastService : 0;
  const interestCost = dbo * discountRate;

  return {
    dbo: Math.round(dbo * 100) / 100,
    currentServiceCost: Math.round(serviceCost * 100) / 100,
    interestCost: Math.round(interestCost * 100) / 100,
    projectedPension: annualPension,
    annuityFactor: Math.round(annuityFactor * 10000) / 10000,
    attributionRatio: Math.round(attributionRatio * 10000) / 10000,
    survivorsFactor: Math.round(survivorsFactor * 10000) / 10000,
    discountRate,
    age: Math.round(age * 10) / 10,
    yearsToRetirement: Math.round(yearsToRetirement * 10) / 10,
    pastService: Math.round(pastService * 10) / 10,
    totalService: Math.round(totalService * 10) / 10,
    fluctuationDiscount: Math.round(fluctDiscount * 10000) / 10000,
    psvagContribution: Math.round(dbo * fluctDiscount * 0.003 * 100) / 100,
    source: 'client',
  };
}

/** HGB-spezifische Zinssätze (§ 253 Abs. 2 HGB) */
export const HGB_RATES = {
  '2024-12-31': { '7year': 0.0183, '10year': 0.0149 },
  '2024-06-30': { '7year': 0.0170, '10year': 0.0137 },
  '2023-12-31': { '7year': 0.0157, '10year': 0.0125 },
};

export function getHGBRate(date = '2024-12-31', period = 7) {
  const key = period === 10 ? '10year' : '7year';
  const dates = Object.keys(HGB_RATES).sort().reverse();
  for (const d of dates) {
    if (d <= date) return HGB_RATES[d][key];
  }
  return HGB_RATES[dates[dates.length - 1]][key];
}
```

---

## PHASE 4: NAVIGATION & INTEGRATION

### 4.1 Navbar aktualisieren

In `client/src/components/Navbar.jsx`, füge den bAV-Link zu `navLinks` hinzu:

```javascript
const navLinks = [
  { label: 'Rechner', path: '/rechner' },
  { label: 'Sterbetafeln', path: '/rechner/sterbetafeln' },
  { label: 'Methodik', path: '/methodik' },
  { label: 'Preise', path: '/preise' },
];
```

Der bAV-Rechner ist über `/rechner` → Kachel erreichbar. Die Navbar bleibt schlank.

### 4.2 Rechner-Hub aktualisieren

In `client/src/app/(public)/rechner/page.jsx`, füge eine neue Kachel hinzu nach den bestehenden:

```javascript
{
  href: '/rechner/bav',
  title: 'bAV-Rechner',
  subtitle: 'Pensionsverpflichtungen',
  desc: 'DBO nach IAS 19 Projected Unit Credit und HGB/BilMoG. Vergleichsrechnung, Dienstzeitaufwand, PSVaG.',
  badge: 'Neu',
},
```

Ändere das Grid von `md:grid-cols-3` auf `md:grid-cols-3 lg:grid-cols-5` damit alle 5 Kacheln passen, oder behalte 3 Spalten und lass die Kacheln fließen.

### 4.3 Landing Page aktualisieren

In `client/src/app/(public)/page.jsx`, füge bAV zu den Quick-Access-Links hinzu:

```javascript
{ title: 'bAV-Rechner', desc: 'Pensionsverpflichtungen IAS 19 & HGB', href: '/rechner/bav' },
```

Und füge "bAV / IAS 19" zu den `trustSignals` hinzu.

### 4.4 Preise-Seite aktualisieren

In `client/src/app/(public)/preise/page.jsx`:

Zu `freeFeatures` hinzufügen:
```javascript
'bAV-Rechner (DBO-Basisschätzung)',
```

Zu `proFeatures` hinzufügen:
```javascript
'bAV-Vollbewertung (IAS 19 PUC + HGB)',
'bAV-Vergleichsrechnung IAS 19 vs. HGB',
'bAV-Portfolio (bis 50 Zusagen)',
```

### 4.5 Sitemap aktualisieren

In `client/src/app/sitemap.ts`, hinzufügen:
```typescript
{ url: `${BASE_URL}/rechner/bav`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
```

### 4.6 PDF-Export erweitern

In `client/src/services/pdfReportService.js`, neue Funktion hinzufügen:

```javascript
export function exportBAVReport(results, inputs, assumptions) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  header(doc, 'bAV-Bewertungsbericht');

  let y = 25;
  const std = results.valuation_standard || 'IAS 19';

  y = section(doc, `Pensionsverpflichtung (${std})`, y);
  y = row(doc, 'Defined Benefit Obligation (DBO)', EUR(results.dbo), y, true);
  y = row(doc, 'Dienstzeitaufwand (Service Cost)', EUR(results.current_service_cost || results.currentServiceCost), y);
  y = row(doc, 'Zinsaufwand (Interest Cost)', EUR(results.interest_cost || results.interestCost), y);
  y = row(doc, 'PSVaG-Beitrag (geschätzt)', EUR(results.psvag_contribution || results.psvagContribution), y);
  y += 4;

  y = section(doc, 'Bewertungsparameter', y);
  y = row(doc, 'Rechnungszins', PCT(results.discount_rate || results.discountRate), y);
  y = row(doc, 'Projizierte Jahresrente', EUR(results.projected_pension || results.projectedPension), y);
  y = row(doc, 'Rentenbarwertfaktor', String((results.annuity_factor || results.annuityFactor || 0).toFixed(4)), y);
  y = row(doc, 'Erdienungsquote', String((results.attribution_ratio || results.attributionRatio || 0).toFixed(4)), y);
  y = row(doc, 'Hinterbliebenenzuschlag', String((results.survivors_factor || results.survivorsFactor || 0).toFixed(4)), y);
  y += 4;

  y = section(doc, 'Personendaten', y);
  if (inputs) {
    y = row(doc, 'Geburtsdatum', inputs.birthDate || '—', y);
    y = row(doc, 'Eintrittsdatum', inputs.entryDate || '—', y);
    y = row(doc, 'Alter', `${results.age || '—'} Jahre`, y);
    y = row(doc, 'Jahre bis Rente', `${results.years_to_retirement || results.yearsToRetirement || '—'} Jahre`, y);
  }

  footer(doc);
  doc.save(`ValueAct_bAV_${std.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
```

---

## PHASE 5: TESTS

### 5.1 Python-Tests

Erstelle `actuarial-engine/tests/test_bav.py`:

```python
"""Tests für bAV-Bewertungsmodul."""
import pytest
from calculations.bav import (
    calculate_dbo_ias19, calculate_dbo_hgb,
    calculate_bav_comparison, get_hgb_discount_rate, get_ias19_discount_rate,
)


@pytest.fixture
def standard_commitment():
    return {
        "id": "BAV001",
        "birth_date": "1975-06-15",
        "entry_date": "2000-01-01",
        "gender": "M",
        "annual_pension": 12000,
        "benefit_type": "festbetrag",
        "has_survivors_benefit": True,
        "survivors_fraction": 0.60,
        "has_invalidity_benefit": True,
    }


@pytest.fixture
def bav_assumptions():
    return {
        "retirement_age": 67,
        "pension_trend": 0.015,
        "salary_trend": 0.025,
        "fluctuation_rate": 0.03,
        "mortality_table": "DAV_2004_R",
        "marriage_probability": 0.80,
        "invalidity_rate": 0.005,
    }


class TestIAS19DBO:
    def test_dbo_positive(self, standard_commitment, bav_assumptions):
        result = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        assert result["dbo"] > 0

    def test_dbo_less_than_total_pension(self, standard_commitment, bav_assumptions):
        """DBO should be less than undiscounted total pension payments."""
        result = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        # 12000/year × ~20 years of payments = 240000 max
        assert result["dbo"] < 300000

    def test_service_cost_positive(self, standard_commitment, bav_assumptions):
        result = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        assert result["current_service_cost"] > 0

    def test_interest_cost_positive(self, standard_commitment, bav_assumptions):
        result = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        assert result["interest_cost"] > 0

    def test_higher_rate_lower_dbo(self, standard_commitment, bav_assumptions):
        low = calculate_dbo_ias19(standard_commitment, {**bav_assumptions, "discount_rate": 0.02})
        high = calculate_dbo_ias19(standard_commitment, {**bav_assumptions, "discount_rate": 0.06})
        assert high["dbo"] < low["dbo"]

    def test_attribution_ratio_below_one(self, standard_commitment, bav_assumptions):
        result = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        assert 0 < result["attribution_ratio"] <= 1.0

    def test_annuity_factor_reasonable(self, standard_commitment, bav_assumptions):
        result = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        # Should be roughly 10-20 for a life annuity at age 67
        assert 5 < result["annuity_factor"] < 25

    def test_psvag_contribution(self, standard_commitment, bav_assumptions):
        result = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        assert result["psvag_contribution"] > 0
        assert result["psvag_contribution"] < result["dbo"] * 0.01


class TestHGBDBO:
    def test_hgb_uses_lower_rate(self, standard_commitment, bav_assumptions):
        ias19 = calculate_dbo_ias19(standard_commitment, bav_assumptions)
        hgb = calculate_dbo_hgb(standard_commitment, bav_assumptions)
        # HGB rate (~1.8%) is typically lower than IAS 19 (~3.4%), so HGB DBO is higher
        assert hgb["dbo"] > ias19["dbo"]

    def test_hgb_rate_positive(self):
        rate = get_hgb_discount_rate("2024-12-31", 7)
        assert 0.005 < rate < 0.05

    def test_hgb_10year_lower_than_7year(self):
        r7 = get_hgb_discount_rate("2024-12-31", 7)
        r10 = get_hgb_discount_rate("2024-12-31", 10)
        assert r10 < r7


class TestComparison:
    def test_comparison_has_both(self, standard_commitment, bav_assumptions):
        result = calculate_bav_comparison(standard_commitment, bav_assumptions)
        assert "ias19" in result
        assert "hgb" in result
        assert "difference" in result

    def test_difference_is_ias19_minus_hgb(self, standard_commitment, bav_assumptions):
        result = calculate_bav_comparison(standard_commitment, bav_assumptions)
        expected = result["ias19"]["dbo"] - result["hgb"]["dbo"]
        assert abs(result["difference"] - expected) < 1.0


class TestDiscountRates:
    def test_ias19_rate_positive(self):
        rate = get_ias19_discount_rate("2024-12-31")
        assert 0.01 < rate < 0.08

    def test_hgb_rate_exists_for_recent_dates(self):
        for d in ["2024-12-31", "2024-06-30", "2023-12-31"]:
            rate = get_hgb_discount_rate(d)
            assert rate > 0
```

### 5.2 Client-Tests

Erstelle `client/src/utils/__tests__/bavCalculations.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { estimateDBO, getHGBRate } from '../bavCalculations';

describe('bAV Client Calculations', () => {
  const base = {
    birthDate: '1975-06-15',
    entryDate: '2000-01-01',
    annualPension: 12000,
    retirementAge: 67,
    discountRate: 0.035,
  };

  it('DBO is positive', () => {
    const r = estimateDBO(base);
    expect(r.dbo).toBeGreaterThan(0);
  });

  it('DBO is reasonable magnitude', () => {
    const r = estimateDBO(base);
    expect(r.dbo).toBeGreaterThan(10000);
    expect(r.dbo).toBeLessThan(500000);
  });

  it('higher discount rate lowers DBO', () => {
    const low = estimateDBO({ ...base, discountRate: 0.02 });
    const high = estimateDBO({ ...base, discountRate: 0.06 });
    expect(high.dbo).toBeLessThan(low.dbo);
  });

  it('service cost is positive', () => {
    const r = estimateDBO(base);
    expect(r.currentServiceCost).toBeGreaterThan(0);
  });

  it('attribution ratio between 0 and 1', () => {
    const r = estimateDBO(base);
    expect(r.attributionRatio).toBeGreaterThan(0);
    expect(r.attributionRatio).toBeLessThanOrEqual(1);
  });

  it('HGB rate is positive', () => {
    expect(getHGBRate('2024-12-31', 7)).toBeGreaterThan(0);
  });

  it('HGB 10-year rate lower than 7-year', () => {
    expect(getHGBRate('2024-12-31', 10)).toBeLessThan(getHGBRate('2024-12-31', 7));
  });
});
```

---

## PHASE 6: SEO-SEITE

### 6.1 Erstelle `client/src/app/(public)/methodik/bav/page.jsx`

Eine informative SEO-Seite über bAV-Bewertung (ähnlich der Formelseite):

- H1: "bAV-Bewertung — IAS 19 und HGB/BilMoG"
- Erklärung des Projected Unit Credit Verfahrens mit Formeln
- Unterschiede IAS 19 vs. HGB
- HGB-Rechnungszins nach § 253 Abs. 2 HGB
- Durchführungswege der bAV (Direktzusage, Unterstützungskasse, Pensionskasse, Pensionsfonds, Direktversicherung)
- PSVaG-Insolvenzschutz
- Link zum Rechner

Ziel-Keywords: "bAV Bewertung", "Pensionsverpflichtung berechnen", "IAS 19 DBO Rechner", "HGB Pensionsrückstellung", "§ 253 HGB Rechnungszins"

---

## PHASE 7: AI-CHAT KONTEXT ERWEITERN

In `server/controllers/chatController.js`, erweitere den `systemPrompt`:

```javascript
const systemPrompt = `Du bist ein Experte für Versicherungsmathematik und unterstützt Aktuare bei der täglichen Arbeit.

Deine Kernkompetenz:
- IFRS 17: GMM, PAA, VFA, CSM-Mechanik, Risikoanpassung, Verlustkomponente
- Solvency II: SCR/MCR nach Standardformel, Risikomodule, Delegierte Verordnung (EU) 2015/35
- bAV: IAS 19 Projected Unit Credit, HGB/BilMoG (§ 253 HGB), Heubeck RT 2018 G, PSVaG, BetrAVG
- Deutsche Standards: DAV-Sterbetafeln, BaFin-Anforderungen, VAG, Bundesbank-Rechnungszins
- EIOPA: Risikofreie Zinskurve, Smith-Wilson-Extrapolation, UFR

Antworte auf Deutsch, es sei denn, der Benutzer schreibt auf Englisch.
Verwende die korrekte versicherungsmathematische Fachterminologie.
Gib praxisnahe Antworten mit Bezug zu regulatorischen Anforderungen.`;
```

Erweitere `buildContextBlock()` um bAV-Felder:
```javascript
if (context.dbo != null) lines.push(`DBO: ${fmt(context.dbo)} €`);
if (context.currentServiceCost != null) lines.push(`Dienstzeitaufwand: ${fmt(context.currentServiceCost)} €`);
if (context.interestCost != null) lines.push(`Zinsaufwand: ${fmt(context.interestCost)} €`);
if (context.attributionRatio != null) lines.push(`Erdienungsquote: ${fmt(context.attributionRatio)}`);
```

---

## REIHENFOLGE DER IMPLEMENTIERUNG

1. Phase 1 — Python-Modul `bav.py` (Kern der Berechnung)
2. Phase 5.1 — Python-Tests (sofort nach Modul, um Korrektheit zu sichern)
3. Phase 2 — Server-Route
4. Phase 3 — Client-UI (BAVCalculator.jsx + bavCalculations.js + Seite)
5. Phase 5.2 — Client-Tests
6. Phase 4 — Navigation, Preise, Sitemap, PDF-Export, Landing Page
7. Phase 6 — SEO-Seite
8. Phase 7 — AI-Chat

Nach jeder Phase: `cd actuarial-engine && python -m pytest tests/ -v` und `cd client && npx vitest run` ausführen und Fehler beheben.

---

## WICHTIGE HINWEISE

- **Heubeck RT 2018 G ist lizenzpflichtig.** Keine Heubeck-Daten einbetten. Die DAV-Sterbetafeln dienen als Näherung für die Basisversion. Im UI klar kommunizieren: "Für offizielle Gutachten sind die Heubeck Richttafeln RT 2018 G erforderlich."
- **HGB-Rechnungszinssätze müssen regelmäßig aktualisiert werden.** Die Bundesbank veröffentlicht monatlich neue Werte. TODO: Automatischen Abruf implementieren oder manuelle Aktualisierung dokumentieren.
- **Die bAV-Berechnung ist eine Näherung**, kein vollständiges versicherungsmathematisches Gutachten. Die Hinterbliebenen- und Invaliditätszuschläge sind vereinfacht. Für offizielle Gutachten ist eine detailliertere Modellierung erforderlich.
- **§ 6a EStG (steuerlicher Teilwert)** ist NICHT implementiert. Das ist ein separates Bewertungsverfahren für die Steuerbilanz. Kann als spätere Erweiterung hinzugefügt werden.
