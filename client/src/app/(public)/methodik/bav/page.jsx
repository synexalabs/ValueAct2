import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'bAV-Bewertung — IAS 19 und HGB/BilMoG | ValueAct',
  description:
    'Grundlagen der betrieblichen Altersversorgung: IAS 19 Projected Unit Credit, HGB/BilMoG Pensionsrückstellung, § 253 HGB Rechnungszins, PSVaG, BetrAVG.',
  keywords:
    'bAV Bewertung, Pensionsverpflichtung berechnen, IAS 19 DBO Rechner, HGB Pensionsrückstellung, § 253 HGB Rechnungszins, Projected Unit Credit, BetrAVG, PSVaG',
  openGraph: {
    title: 'bAV-Bewertung — IAS 19 und HGB/BilMoG',
    description:
      'Methodenüberblick: Projected Unit Credit nach IAS 19, HGB-Rückstellung nach § 253 Abs. 2 HGB, Durchführungswege und PSVaG.',
    locale: 'de_DE',
  },
};

const sections = [
  {
    title: 'IAS 19 — Projected Unit Credit Verfahren',
    items: [
      {
        name: 'Defined Benefit Obligation (DBO)',
        formula: 'DBO = R_proj × ä × HBL × INV × (T_past / T_total) × v^n',
        note: 'Barwert der bis zum Stichtag erdienten Leistungen, projiziert auf den Pensionseintritt. Gem. IAS 19.67.',
      },
      {
        name: 'Projizierte Jahresrente',
        formula: 'R_proj = R_0 × (1 + trend)^n  (bei Festbetrag: R_proj = R_0)',
        note: 'Projektion bis Renteneintritt. Bei Festbetrag kein Gehaltstrend, bei gehaltsabhängiger Zusage mit Gehaltstrend.',
      },
      {
        name: 'Rentenbarwertfaktor (Barwert-Äquivalent)',
        formula: 'ä = Σ [t·p_x × (1 + trend)^t / (1 + i)^t]  für t = 1 bis max. 50',
        note: 'Berücksichtigt Überlebenswahrscheinlichkeiten aus DAV-Sterbetafeln und Rententrend (§ 16 BetrAVG).',
      },
      {
        name: 'Erdienungsquote',
        formula: 'q = T_past / T_total = (Stichtag − Eintritt) / (Rente − Eintritt)',
        note: 'Anteil der zum Stichtag erdienten Leistung. Gem. IAS 19.70 linear über Dienstzeit verteilt.',
      },
      {
        name: 'Dienstzeitaufwand (Current Service Cost)',
        formula: 'CSC ≈ DBO / T_past',
        note: 'Zunahme der DBO durch ein weiteres Dienstjahr. Wird in der GuV als Personalaufwand erfasst.',
      },
      {
        name: 'Zinsaufwand (Net Interest)',
        formula: 'Zinsaufwand = DBO_Anfang × i_IAS19',
        note: 'Abzinsung der DBO mit dem IAS-19-Rechnungszins (AA-Unternehmensanleihen, iBoxx EUR AA 10+).',
      },
    ],
  },
  {
    title: 'HGB / BilMoG — Pensionsrückstellung',
    items: [
      {
        name: 'Rechnungszins § 253 Abs. 2 HGB',
        formula: 'i_HGB = 7-Jahres-Durchschnitt der Deutsche Bundesbank (Restlaufzeit 15 Jahre)',
        note: 'Monatlich veröffentlicht von der Deutschen Bundesbank (Zeitreihe BBK01.WX4260). Alternativ: 10-Jahres-Durchschnitt (Übergangsregelung bis 2024).',
      },
      {
        name: 'HGB vs. IAS 19',
        formula: 'HGB: kein Gehaltstrend, niedrigerer Rechnungszins → höhere Rückstellung',
        note: 'HGB-Rückstellungen liegen typischerweise deutlich über den IAS-19-DBO, da der Bundesbank-Durchschnittszins tiefer ist als der AA-Marktszins.',
      },
      {
        name: 'Steuerlicher Teilwert (§ 6a EStG)',
        formula: 'Teilwert = max(0, PW − PW_Anwartschaft_zu_Beginn)',
        note: 'Gesondertes Bewertungsverfahren für die Steuerbilanz mit festem Rechnungszins 6 %. Nicht in diesem Rechner implementiert.',
      },
    ],
  },
  {
    title: 'Durchführungswege der bAV',
    items: [
      {
        name: 'Direktzusage (§ 1 Abs. 1 BetrAVG)',
        formula: 'Arbeitgeber bildet Pensionsrückstellung in eigener Bilanz',
        note: 'PSVaG-pflichtig. Häufigste Form bei Großunternehmen. IASB verlangt IAS-19-Bewertung, HGB § 249 ff. für Rückstellung.',
      },
      {
        name: 'Unterstützungskasse',
        formula: 'Durchführung über rechtlich selbständige Versorgungseinrichtung',
        note: 'PSVaG-pflichtig. Kein Rechtsanspruch des Arbeitnehmers gegenüber der Kasse.',
      },
      {
        name: 'Pensionskasse / Pensionsfonds',
        formula: 'Reguliertes Versicherungsunternehmen (VAG), Beitragszusage möglich',
        note: 'BaFin-reguliert. Solvency II für Pensionskassen. PSVaG-Absicherung je nach Form.',
      },
      {
        name: 'Direktversicherung',
        formula: 'Lebensversicherung auf das Leben des Arbeitnehmers',
        note: 'Einfachste Form. PSVaG-pflichtig nur bei unwiderruflichem Bezugsrecht. Bilanzneutral beim Arbeitgeber.',
      },
    ],
  },
  {
    title: 'PSVaG — Insolvenzsicherung',
    items: [
      {
        name: 'PSVaG-Beitrag',
        formula: 'Beitrag ≈ gesicherter Barwert × PSVaG-Beitragssatz (ca. 2–5 ‰)',
        note: 'Jährlich variable Beitragssätze. 2023: 3,0 ‰. Pflicht für Direktzusage, Unterstützungskasse und (meistens) Pensionsfonds.',
      },
    ],
  },
];

export default function BAVMethodikPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-semibold text-trust-950 mb-2">bAV-Bewertung — IAS 19 und HGB/BilMoG</h1>
          <p className="text-gray-500 mb-10 max-w-2xl">
            Methodenüberblick zur bilanziellen Bewertung von Pensionsverpflichtungen nach IFRS (IAS 19) und HGB/BilMoG. Durchführungswege, Rechnungszinsen und PSVaG-Absicherung.
          </p>

          <div className="space-y-10">
            {sections.map((sec) => (
              <div key={sec.title}>
                <h2 className="text-lg font-semibold text-trust-950 mb-5 pb-2 border-b border-gray-100">{sec.title}</h2>
                <div className="space-y-4">
                  {sec.items.map((item) => (
                    <div key={item.name} className="bg-white border border-gray-100 rounded-xl p-5">
                      <h3 className="text-sm font-semibold text-trust-900 mb-2">{item.name}</h3>
                      <div className="bg-slate-950 rounded-lg px-4 py-3 mb-3 overflow-x-auto">
                        <code className="text-sm font-mono text-emerald-300 whitespace-pre">{item.formula}</code>
                      </div>
                      {item.note && (
                        <p className="text-xs text-gray-500 leading-relaxed">{item.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-trust-50 border border-trust-100 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-trust-900">Direkt zum bAV-Rechner</p>
              <p className="text-xs text-trust-600 mt-0.5">DBO-Basisschätzung nach IAS 19 und HGB — kostenlos, ohne Registrierung.</p>
            </div>
            <Link href="/rechner/bav"
              className="px-4 py-2 bg-trust-950 text-white rounded-lg text-sm font-medium hover:bg-trust-800 transition-colors whitespace-nowrap">
              Rechner öffnen →
            </Link>
          </div>

          <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-800">
            <strong>Hinweis:</strong> Diese Seite dient zu Bildungszwecken. Maßgeblich sind die aktuellen Fassungen von IAS 19, HGB sowie die BetrAVG. Die Heubeck Richttafeln RT 2018 G sind urheberrechtlich geschützt und werden hier nicht eingebettet — für offizielle Gutachten sind diese erforderlich.
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
