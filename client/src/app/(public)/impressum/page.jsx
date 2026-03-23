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
                [Straße und Hausnummer]<br />
                [PLZ] [Ort]<br />
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
                Umsatzsteuer-Identifikationsnummer gem. § 27a UStG: [USt-IdNr.]
                <br />
                <em>
                  Hinweis: Sofern keine USt-IdNr. vorliegt, gilt die Kleinunternehmerregelung
                  gem. § 19 UStG.
                </em>
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-trust-900 mb-2">Verantwortlich für den Inhalt</h2>
              <p>
                Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV:<br />
                Zaur Guliyev<br />
                [Adresse wie oben]
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
