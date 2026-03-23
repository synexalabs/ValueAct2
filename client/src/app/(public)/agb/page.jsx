import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export const metadata = {
  title: 'AGB | ValueAct Rechner',
  description: 'Allgemeine Geschäftsbedingungen — ValueAct Rechner',
};

export default function AGBPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="text-2xl font-semibold text-trust-950 mb-2">Allgemeine Geschäftsbedingungen</h1>
          <p className="text-sm text-gray-400 mb-8">Stand: März 2026</p>

          <div className="prose prose-sm text-gray-600 space-y-6">
            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">§ 1 Geltungsbereich</h2>
              <p>Diese AGB gelten für die Nutzung des Online-Rechners ValueAct Rechner (valuact.io/rechner) von Zaur Guliyev / Synexa Labs.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">§ 2 Leistungsbeschreibung</h2>
              <p>ValueAct Rechner stellt Online-Rechner für versicherungsmathematische Berechnungen (IFRS 17, Solvency II) zur Verfügung. Die Berechnungen dienen ausschließlich Informationszwecken und ersetzen keine versicherungsmathematische Beratung.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">§ 3 Vertragsschluss</h2>
              <p>Das kostenlose Tier steht ohne Registrierung zur Verfügung. Für das Professional-Abonnement kommt ein Vertrag durch Registrierung und Zahlungsbestätigung zustande.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">§ 4 Preise und Zahlung</h2>
              <p>Professional: 79 €/Monat (zzgl. MwSt.) oder 69 €/Monat bei Jahreszahlung. Zahlung per Kreditkarte oder SEPA-Lastschrift über Stripe.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">§ 5 Kündigung</h2>
              <p>Das Abonnement kann monatlich zum Ende des Abrechnungszeitraums gekündigt werden. Die Kündigung erfolgt über das Nutzerkonto oder per E-Mail.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">§ 6 Haftungsausschluss</h2>
              <p>Die bereitgestellten Berechnungen sind Schätzungen. Es wird keine Haftung für die Richtigkeit der Ergebnisse im Einzelfall übernommen. Insbesondere ersetzt der Rechner nicht die Begutachtung durch einen zugelassenen Aktuar (DAV, FIA, SAV o.ä.).</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">§ 7 Anwendbares Recht</h2>
              <p>Es gilt deutsches Recht. Gerichtsstand ist der Sitz des Anbieters.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
