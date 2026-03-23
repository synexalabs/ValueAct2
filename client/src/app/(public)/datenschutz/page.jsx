import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export const metadata = {
  title: 'Datenschutzerklärung | ValueAct Rechner',
  description: 'Datenschutzerklärung gem. DSGVO — ValueAct Rechner',
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="text-2xl font-semibold text-trust-950 mb-2">Datenschutzerklärung</h1>
          <p className="text-sm text-gray-400 mb-8">Stand: März 2026</p>

          <div className="prose prose-sm text-gray-600 space-y-8">
            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">1. Verantwortlicher</h2>
              <p>
                Verantwortlicher i.S.d. Art. 4 Nr. 7 DSGVO:<br />
                Zaur Guliyev, Synexa Labs<br />
                E-Mail: kontakt@valuact.io
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">2. Verarbeitete Daten</h2>
              <p>
                Wir verarbeiten folgende Kategorien personenbezogener Daten:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Zugangsdaten (E-Mail-Adresse, verschlüsseltes Passwort) bei Registrierung</li>
                <li>Nutzungsdaten (IP-Adresse, Zeitstempel, aufgerufene Seiten)</li>
                <li>Berechnungseingaben (für angemeldete Nutzer gespeichert)</li>
                <li>Zahlungsdaten (werden ausschließlich durch Stripe verarbeitet)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">3. Rechtsgrundlagen (Art. 6 DSGVO)</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Art. 6 Abs. 1 lit. b DSGVO — Vertragserfüllung (Nutzerkonto, Abonnement)</li>
                <li>Art. 6 Abs. 1 lit. f DSGVO — Berechtigte Interessen (Betriebssicherheit, Missbrauchsprävention)</li>
                <li>Art. 6 Abs. 1 lit. a DSGVO — Einwilligung (Cookies, sofern eingeholt)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">4. Auftragsverarbeiter</h2>
              <p><strong>Firebase / Google Cloud</strong> (Google LLC, USA) — Datenbankdienste gem. Art. 28 DSGVO. Standardvertragsklauseln nach Art. 46 DSGVO.</p>
              <p className="mt-2"><strong>Stripe</strong> (Stripe, Inc., USA) — Zahlungsabwicklung. Verarbeitung ausschließlich durch Stripe. Datenschutzerklärung: stripe.com/de/privacy.</p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">5. Speicherdauer</h2>
              <p>
                Kontodaten werden bis zur Kündigung des Nutzerkontos gespeichert.
                Berechnungsergebnisse werden max. 2 Jahre gespeichert.
                Logs werden nach 90 Tagen gelöscht.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">6. Ihre Rechte (Art. 15–22 DSGVO)</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Auskunftsrecht (Art. 15 DSGVO)</li>
                <li>Berichtigungsrecht (Art. 16 DSGVO)</li>
                <li>Löschungsrecht (Art. 17 DSGVO)</li>
                <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
              </ul>
              <p className="mt-2">
                Zur Ausübung Ihrer Rechte wenden Sie sich an: kontakt@valuact.io<br />
                Beschwerderecht bei der zuständigen Aufsichtsbehörde (z.B. Landesbeauftragter für Datenschutz).
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">7. Cookies</h2>
              <p>
                Diese Website verwendet technisch notwendige Cookies für die Authentifizierung
                und Sitzungsverwaltung. Tracking-Cookies werden nur mit Ihrer Einwilligung gesetzt.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
