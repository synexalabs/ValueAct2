import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';

export const metadata = {
  title: 'Impressum | ValueAct Rechner',
  description: 'Impressum gem. § 5 TMG — ValueAct Rechner',
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <h1 className="text-2xl font-semibold text-trust-950 mb-8">Impressum</h1>

          <div className="prose prose-sm text-gray-600 space-y-6">
            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">Angaben gem. § 5 TMG</h2>
              <p>
                Zaur Guliyev<br />
                Synexa Labs<br />
                {/* TODO: Replace with real address before launch — required by § 5 TMG */}
                Musterstraße 1<br />
                50667 Köln<br />
                Deutschland
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">Kontakt</h2>
              <p>
                E-Mail: kontakt@valuact.io<br />
                Kontaktformular: <a href="/kontakt" className="text-trust-600 hover:underline">valuact.io/kontakt</a>
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">Umsatzsteuer-ID</h2>
              <p>
                <em>
                  Kleinunternehmer gem. § 19 UStG. Es wird keine Umsatzsteuer berechnet.
                </em>
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">Verantwortlich für den Inhalt</h2>
              <p>
                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:<br />
                Zaur Guliyev, Synexa Labs, Deutschland
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">Online-Streitbeilegung (OS)</h2>
              <p>
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-trust-600 hover:underline"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
                <br />
                Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren
                vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">Haftungshinweis</h2>
              <p>
                Die Berechnungen auf dieser Website dienen ausschließlich Informations- und
                Illustrationszwecken. Sie stellen keine versicherungsmathematische Beratung
                dar und ersetzen nicht die Prüfung durch einen zugelassenen Aktuar. Für die
                Richtigkeit der Ergebnisse im Einzelfall wird keine Haftung übernommen.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
