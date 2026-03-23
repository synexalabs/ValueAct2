import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export const metadata = {
  title: 'Methodik | ValueAct Rechner',
  description: 'Methodik und Formeln für IFRS 17 CSM, Solvency II SCR/MCR und DAV-Sterbetafeln. Vollständige Dokumentation.',
};

export default function MethodikPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-2xl font-semibold text-trust-950 mb-2">Methodik</h1>
          <p className="text-gray-500 text-sm mb-10">
            Dokumentation der versicherungsmathematischen Berechnungsgrundlagen.
          </p>

          <div className="space-y-10">
            <section>
              <h2 className="text-lg font-semibold text-trust-950 mb-4">IFRS 17 — Vertragliche Servicemarge (CSM)</h2>
              <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 space-y-3 font-mono">
                <p>FCF = PV(Leistungen) + PV(Kosten) − PV(Prämien)</p>
                <p>CSM = max(0, −(FCF + RA))</p>
                <p>Verlustkomponente = max(0, FCF + RA)</p>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Quelle: IFRS 17 Abs. 38 (IASB, 2017). Positive FCF bedeuten Netto-Auszahlungen des Versicherers.
                CSM repräsentiert den über die Deckungsperiode aufzulösenden Gewinn. Belastende Verträge
                (Verlustkomponente &gt; 0) erfordern eine sofortige Verlusterfassung.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-trust-950 mb-4">Solvency II — SCR Standardformel</h2>
              <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-700 space-y-3 font-mono">
                <p>BSCR = √(Σᵢ Σⱼ Corrᵢⱼ × SCRᵢ × SCRⱼ)</p>
                <p>SCR = BSCR + Op_SCR − LAC_DT</p>
                <p>Op_SCR = min(0,30 × BSCR, max(4% × Prämien, 0,45% × TP))</p>
                <p>MCR = max(MCR_floor, min(0,45 × SCR, max(0,25 × SCR, MCR_linear)))</p>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Quelle: Delegierte Verordnung (EU) 2015/35, Art. 87–135 (BSCR), Art. 204 (Op_SCR),
                Art. 248–250 (MCR). Korrelationsmatrizen gem. Anhang IV.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-trust-950 mb-4">DAV-Sterbetafeln</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="border border-gray-100 rounded-lg p-4">
                  <p className="font-semibold text-trust-900 mb-1">DAV 2008 T — Risikolebensversicherung</p>
                  <p>Basis: Rückversicherungsdaten 2001–2004 aus 47 deutschen Lebensversicherungsunternehmen.
                  Geschlechtsspezifische Tafeln (Männer/Frauen). Unisex-Tafel gem. EU-Richtlinie 2004/113/EG
                  als Mischung 50/50. 1. Ordnung (enthält Sicherheitszuschläge).</p>
                </div>
                <div className="border border-gray-100 rounded-lg p-4">
                  <p className="font-semibold text-trust-900 mb-1">DAV 2004 R — Rentenversicherung</p>
                  <p>Annuitantensterblichkeit (Selektionseffekt gegenüber Gesamtbevölkerung).
                  Niedrigere Sterblichkeit als DAV 2008 T (konservativ für Rentenrückstellungen).
                  Trendanpassungen über Generationentafeln möglich.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-trust-950 mb-4">Technische Architektur</h2>
              <p className="text-sm text-gray-500">
                Basisberechnungen (kostenloses Tier) laufen clientseitig in JavaScript. Pro-Berechnungen
                werden an die Python-Engine (FastAPI) delegiert, die NumPy/Pandas für vektorisierte
                Berechnungen und einen vollständigen Prüfpfad (AuditContext) verwendet. Die Python-Engine
                ist die einzige Quelle der Wahrheit für alle regulatorisch relevanten Ergebnisse.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
