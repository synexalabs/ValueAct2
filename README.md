# ValueAct Rechner

Online IFRS 17 & Solvency II Rechner für deutsche Versicherungsmathematiker.

## Features

- **IFRS 17 CSM-Rechner**: Vertragliche Servicemarge mit GMM/PAA/VFA, korrekte FCF-Vorzeichenkonvention gem. IFRS 17 Abs. 38
- **Solvency II SCR-Rechner**: Standardformel mit allen Risikomodulen und Korrelationsmatrizen
- **DAV-Sterbetafeln**: DAV 2008 T und DAV 2004 R (Männlich/Weiblich/Unisex gem. EU-Richtlinie 2004/113/EG)
- **EIOPA-Zinskurve**: Smith-Wilson-Extrapolation mit UFR
- **Prüfpfad**: Vollständige Nachvollziehbarkeit aller Berechnungsschritte (Pro)
- **PDF-Export**: Berechnungsdetails exportieren (Pro)

## Tech Stack

- **Frontend**: Next.js 16 + Tailwind CSS (German-first UI)
- **Backend**: Express.js (API-Proxy)
- **Engine**: Python FastAPI (versicherungsmathematische Berechnungen)
- **Datenbank**: Firebase Firestore
- **Zahlungen**: Stripe (SEPA + Kreditkarte)

## Development

```bash
# Dependencies installieren
npm run install-all

# Umgebungsvariablen einrichten
cp server/.env.example server/.env
cp client/.env.local.example client/.env.local
# → Variablen eintragen

# Starten
npm run dev
```

Frontend: http://localhost:3000
Backend:  http://localhost:3001
Engine:   http://localhost:8000

## Sicherheit

- JWT_SECRET muss mindestens 32 Zeichen lang sein (Pflicht, kein Fallback)
- TEST_MODE ist dauerhaft deaktiviert
- Freier Tier ist auf 3 Berechnungen/Tag serverseitig begrenzt
- Keine Secrets im Client-Code

## License

Proprietary — Synexa Labs / Zaur Guliyev
