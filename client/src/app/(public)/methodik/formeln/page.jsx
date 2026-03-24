import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';

export const metadata = {
  title: 'Formelsammlung — ValueAct Rechner',
  description: 'Aktuarielle Formeln für IFRS 17 (CSM, FCF, RA), Solvency II (SCR, MCR, BSCR) und DAV-Sterbetafeln.',
};

const sections = [
  {
    title: 'IFRS 17 — Allgemeines Bewertungsmodell (GMM)',
    items: [
      {
        name: 'Erfüllungszahlungsströme (FCF)',
        formula: 'FCF = PV(Leistungen) + PV(Kosten) − PV(Prämien)',
        latex: 'FCF = \\sum_{t=1}^{n} \\frac{B_t + E_t - P_t}{(1 + r_t)^t}',
        note: 'Positive FCF bedeuten einen Netto-Kassenabfluss für den Versicherer. Quelle: IFRS 17.38.',
      },
      {
        name: 'Risikoanpassung (RA)',
        formula: 'RA = VaRα(FCF) − E[FCF]  oder  RA = CoC × Σ SCRt · vt',
        latex: 'RA_{CoC} = CoC \\times \\sum_{t=1}^{n} SCR_t \\cdot \\frac{1}{(1+r)^t}',
        note: 'Kompensation für nicht-finanzielle Risiken per IFRS 17.37. CoC = 6 % (übliche Praxis).',
      },
      {
        name: 'Vertragliche Servicemarge (CSM)',
        formula: 'CSM₀ = max(0, −(FCF + RA))',
        latex: 'CSM_0 = \\max\\bigl(0,\\;-(FCF_0 + RA_0)\\bigr)',
        note: 'Nichtnegativ — belastende Verträge erzeugen eine Verlustkomponente, keine negative CSM.',
      },
      {
        name: 'Verlustkomponente (LC)',
        formula: 'LC = max(0, FCF + RA)',
        latex: 'LC = \\max(0,\\; FCF + RA)',
        note: 'Sofort in der GuV erfasst für belastende Verträge (IFRS 17.47).',
      },
      {
        name: 'CSM-Überleitung (IFRS 17.44)',
        formula: 'CSM_close = CSM_open + Neugeschäft + Zinsen ± Schätzungsänderungen − Auflösung',
        latex: 'CSM_{t+1} = CSM_t \\cdot (1 + r_{lock}) + \\Delta_{est} - \\frac{CU_t}{\\sum CU} \\cdot CSM_t',
        note: 'Lock-in-Rate: Zinssatz zum Zeitpunkt der Ersterfassung je Kohorte.',
      },
      {
        name: 'CSM-Auflösung',
        formula: 'Auflösung_t = CSM_t × (CUt / Σ CU)',
        latex: 'CSM_{rel,t} = CSM_{opening,t} \\times \\frac{CU_t}{\\displaystyle\\sum_{s \\geq t} CU_s}',
        note: 'CU = Deckungseinheiten (coverage units); proportional zur erbrachten Versicherungsleistung.',
      },
    ],
  },
  {
    title: 'Solvency II — Standardformel',
    items: [
      {
        name: 'Basis-SCR (BSCR)',
        formula: 'BSCR = √( Σᵢ Σⱼ ρᵢⱼ · SCRᵢ · SCRⱼ )',
        latex: 'BSCR = \\sqrt{\\sum_i \\sum_j \\rho_{ij} \\cdot SCR_i \\cdot SCR_j}',
        note: 'Korrelationsmatrix gemäß Anhang IV der Delegierten Verordnung (EU) 2015/35.',
      },
      {
        name: 'Solvenzkapitalanforderung (SCR)',
        formula: 'SCR = BSCR + Op_SCR − LAC_DT',
        latex: 'SCR = BSCR + Op_{SCR} - LAC_{DT}',
        note: 'Betriebsrisiko (Op) wird linear addiert, nicht in die Korrelationsmatrix einbezogen (Art. 103 DelVO).',
      },
      {
        name: 'Mindestkapitalanforderung (MCR)',
        formula: 'MCR = max(MCR_floor, min(0,45 × SCR, max(0,25 × SCR, MCR_linear)))',
        latex: 'MCR = \\max\\!\\bigl(MCR_{abs},\\;\\min(0{,}45 \\cdot SCR,\\;\\max(0{,}25 \\cdot SCR,\\;MCR_{lin}))\\bigr)',
        note: 'Korridor: 25 %–45 % des SCR. Absolute Untergrenze für Leben: 3,7 Mio. EUR (Art. 248–250).',
      },
      {
        name: 'Verlustausgleichsfähigkeit latenter Steuern (LAC DT)',
        formula: 'LAC_DT = min(DTA × Steuersatz, 15 % × BSCR)',
        latex: 'LAC_{DT} = \\min\\bigl(DTA \\cdot \\tau,\\;0{,}15 \\cdot BSCR\\bigr)',
        note: 'Begrenzt auf 15 % des BSCR.',
      },
      {
        name: 'MCR Linear (Leben)',
        formula: 'MCR_lin = 0,037 × TP_guar + 0,0025 × TP_other + 0,0015 × KaR',
        latex: 'MCR_{lin} = 0{,}037 \\cdot TP_{guar} + 0{,}0025 \\cdot TP_{other} + 0{,}0015 \\cdot CAR',
        note: 'TP = versicherungstechnische Rückstellungen; CAR = Kapital im Risiko (Art. 250).',
      },
      {
        name: 'Solvenzquote',
        formula: 'Solvenzquote = Anrechnungsfähige Eigenmittel / SCR',
        latex: '\\text{Solvenzquote} = \\frac{\\text{Anrechenbare Eigenmittel}}{SCR}',
        note: 'Aufsichtsrechtliche Mindestanforderung: 100 %. Zielquote typisch ≥ 150 %.',
      },
    ],
  },
  {
    title: 'Sterblichkeit — DAV-Sterbetafeln',
    items: [
      {
        name: 'Sterbewahrscheinlichkeit qₓ',
        formula: 'qₓ = Anzahl Todesfälle im Alter x / Bestand zu Beginn des Jahres',
        latex: 'q_x = \\frac{d_x}{l_x}',
        note: 'DAV 2008 T: Risikolebensversicherung (Erststerblichkeit). DAV 2004 R: Rentenversicherung (Überlebensbonus).',
      },
      {
        name: 'Überlebenswahrscheinlichkeit ₜpₓ',
        formula: 'ₜpₓ = Π_{k=0}^{t−1} (1 − qₓ₊ₖ)',
        latex: '_t p_x = \\prod_{k=0}^{t-1}(1 - q_{x+k})',
        note: 'Grundlage für Barwertberechnungen von Leistungen und Prämien.',
      },
      {
        name: 'Fernere Lebenserwartung eₓ',
        formula: 'eₓ = Σ_{t=1}^{∞} ₜpₓ',
        latex: 'e_x = \\sum_{t=1}^{\\infty} \\,_t p_x',
        note: 'Curtate expectation of life. Für praktische Berechnungen: Summe über t bis ₜpₓ < 0,001.',
      },
      {
        name: 'Gompertz-Sterblichkeitsmodell',
        formula: 'qₓ₊ₜ ≈ q₀ · exp(β · t)',
        latex: 'q_{x+t} \\approx q_0 \\cdot e^{\\beta t}',
        note: 'β ≈ 0,085 (Alterskorrektur). Näherung für Lebenserwartungsprojektion.',
      },
    ],
  },
  {
    title: 'Diskontierung — EIOPA Zinskurve',
    items: [
      {
        name: 'Diskontfaktor v(t)',
        formula: 'v(t) = 1 / (1 + r_t)^t',
        latex: 'v(t) = \\frac{1}{(1 + r_t)^t}',
        note: 'r_t = Spot-Rate für Laufzeit t aus der EIOPA RFR-Kurve.',
      },
      {
        name: 'Ultimate Forward Rate (UFR)',
        formula: 'UFR_EUR = 3,45 % (2024)',
        latex: 'UFR_{EUR} = 3{,}45\\,\\%',
        note: 'UFR wird jährlich von EIOPA festgelegt. Konvergenzpunkt der Smith-Wilson-Extrapolation bei 60 Jahren.',
      },
      {
        name: 'Volatilitätsanpassung (VA)',
        formula: 'r_VA(t) = r_RFR(t) + VA',
        latex: 'r_{VA}(t) = r_{RFR}(t) + VA',
        note: 'VA_DE ≈ 19 bp (repräsentativ). Länderspezifisch, monatlich von EIOPA veröffentlicht.',
      },
    ],
  },
];

export default function FormelnPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-semibold text-trust-950 mb-2">Formelsammlung</h1>
          <p className="text-gray-500 mb-10 max-w-2xl">
            Aktuarielle Kernformeln für IFRS 17 GMM, Solvency II Standardformel, DAV-Sterbetafeln und EIOPA-Zinskurve — mit Herleitung und Normbezug.
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

          <div className="mt-10 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-800">
            <strong>Hinweis:</strong> Diese Formelsammlung dient zu Bildungszwecken. Maßgeblich sind stets die aktuellen Fassungen von IFRS 17, der Solvency-II-Richtlinie (2009/138/EG) sowie der Delegierten Verordnung (EU) 2015/35.
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
