# CURSOR AI: Transform ValueAct2 → ValueAct Rechner

## PROJECT CONTEXT

You are transforming a broad actuarial platform (ValueAct2) into a focused, monetizable product: **ValueAct Rechner** — an online IFRS 17 & Solvency II calculator for German actuaries.

**Codebase:** https://github.com/synexalabs/ValueAct2
**Stack:** Next.js 16 (App Router) + Express.js + FastAPI (Python) + Firebase + Tailwind CSS
**Target users:** German actuaries (freelance consultants, small insurers, Pensionskassen)
**Language:** German-first UI with English toggle
**Currency:** EUR with German locale formatting (1.234.567,89 €)

The existing codebase has solid actuarial domain logic (DAV mortality tables, EIOPA yield curves, Solvency II correlation matrices) but is bloated with unused features, has critical security bugs, and actuarial formulas that need correction. This document tells you exactly what to cut, fix, and build.

Work through this document in the order presented. Each phase builds on the previous one.

---

## PHASE 1: STRIP DOWN — Remove everything that isn't the calculator

### 1.1 Delete these files and directories entirely

```
# Customer portal — not needed
client/src/app/(customer)/          # entire directory

# Unused pages
client/src/app/(main)/analytics/    # no analytics product yet
client/src/app/(main)/data/         # complex data upload pipeline — remove
client/src/app/(main)/valuations/   # remove
client/src/app/(main)/settings/     # remove (will rebuild simpler version later)

# Unused components
client/src/components/DataManagement/   # entire directory
client/src/components/StorageManager.jsx
client/src/components/Register.jsx      # will rebuild auth later

# Unused utilities
client/src/utils/storageOptimization.js
client/src/utils/storageCompression.js
client/src/hooks/useLocalStorage.js     # will rebuild if needed

# Server — unused features
server/websocket.js
server/services/csvProcessor.js
server/services/fileParser.js
server/routes/dataManagement.js
server/middleware/tenantMiddleware.js    # no multi-tenancy yet
server/middleware/metricsMiddleware.js   # no prometheus yet
server/models/Dataset.js
server/models/FormulaVersion.js
server/test-firebase.js
server/schemas/                         # entire directory

# Actuarial engine — defer these
actuarial-engine/batch/                 # batch processing — not needed for v1
actuarial-engine/reports/               # QRT reports — not needed for v1

# Committed artifacts that shouldn't be in git
actuarial-engine/actuarial_engine.log
tests/__pycache__/

# K8s — overkill for launch
k8s/                                    # entire directory
```

### 1.2 Remove from server/index.js

Remove these route registrations and their imports:
- `dataManagementRoutes` (and the `require('./routes/dataManagement')`)
- WebSocket initialization (`require('./websocket')` and `initializeWebSocket`)
- Remove the `http.createServer` wrapper — just use `app.listen()` directly
- Remove `bull` and `ioredis` from server/package.json dependencies
- Remove `@pinecone-database/pinecone` from server/package.json

The server/index.js should only register: healthRoutes, authRoutes, calculationRoutes, methodologyRoutes, chatRoutes.

### 1.3 Simplify docker-compose.yml

Remove the `redis` service entirely. Remove `redis_data` and `calculation_cache` volumes. Remove `REDIS_URL` from all environment variables. Remove the `depends_on: redis` entries. Keep only: actuarial-engine, server, client.

### 1.4 Update .gitignore

Add to `.gitignore`:
```
*.log
__pycache__/
*.pyc
.env
.env.local
node_modules/
.next/
```

---

## PHASE 2: FIX CRITICAL SECURITY

### 2.1 Fix JWT secret — server/utils/jwt.js

Replace the fallback secret with a startup crash:

```javascript
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET must be set and at least 32 characters');
  process.exit(1);
}
```

### 2.2 Remove TEST_MODE — client/src/contexts/AuthContext.jsx

Delete the `DEMO_USER` constant and the `TEST_MODE` constant entirely. Remove all `if (TEST_MODE)` branches. The auth context should work normally: if no token, user is null, app shows login. Replace the entire file with a clean implementation:

- Remove `const TEST_MODE = true;`
- Remove `const DEMO_USER = { ... };`
- Remove `const [isTestMode] = useState(TEST_MODE);`
- In `checkAuth`, remove the `if (TEST_MODE && !user)` block
- In `logout`, remove the `if (TEST_MODE)` branch — just set user to null
- Remove `isTestMode` from the context value

### 2.3 Fix Gemini prompt injection — server/controllers/chatController.js

Replace the string interpolation prompt with Gemini's proper multi-turn format:

```javascript
const chat = model.startChat({
  history: [],
  generationConfig: { maxOutputTokens: 2048 },
});

// System context goes in the first user message (Gemini doesn't have system role)
const systemContext = `Du bist ein Experte für Versicherungsmathematik...`; // German system prompt

const result = await chat.sendMessage([
  { text: systemContext + '\n\nFrage des Benutzers: ' },
  { text: message }  // user input is separate
]);
```

Better yet, use Gemini's `systemInstruction` field if using the latest SDK:

```javascript
const model = genAI.getGenerativeModel({
  model: "gemini-pro",
  systemInstruction: "Du bist ein Experte für Versicherungsmathematik..."
});
const result = await model.generateContent(message);
```

### 2.4 Create .env.example files

Create `server/.env.example`:
```
# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Auth
JWT_SECRET=minimum-32-character-secret-change-this-in-production
JWT_EXPIRES_IN=24h

# AI
GOOGLE_API_KEY=your-gemini-api-key

# Actuarial Engine
PYTHON_ENGINE_URL=http://localhost:8000

# App
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Stripe (Phase 3)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_MONTHLY=
STRIPE_PRICE_ID_YEARLY=
```

Create `actuarial-engine/.env.example`:
```
ENVIRONMENT=development
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## PHASE 3: FIX ACTUARIAL CORRECTNESS

### 3.1 Wire DAV mortality tables as defaults

**File: `actuarial-engine/utils/actuarial.py`**

In `validate_assumptions()`, replace the mortality table whitelist:
```python
# OLD — US tables only
elif assumptions['mortality_table'] not in ['CSO_2017', 'CSO_2001', 'GAM_1994']:
    errors.append("Invalid mortality_table")

# NEW — German tables as primary, US as secondary
VALID_TABLES = [
    'DAV_2008_T', 'DAV_2008_T_MALE', 'DAV_2008_T_FEMALE', 'DAV_2008_T_UNISEX',
    'DAV_2004_R', 'DAV_2004_R_MALE', 'DAV_2004_R_FEMALE', 'DAV_2004_R_UNISEX',
    'CSO_2017', 'CSO_2001'  # kept for reference/comparison
]
elif assumptions['mortality_table'] not in VALID_TABLES:
    errors.append(f"Ungültige Sterbetafel: {assumptions['mortality_table']}. Verfügbar: {', '.join(VALID_TABLES)}")
```

**File: `actuarial-engine/main.py`**

Replace the `/api/v1/mortality-tables` endpoint to return DAV tables first:

```python
@app.get("/api/v1/mortality-tables")
async def get_mortality_tables():
    from data.dav_mortality_tables import get_available_dav_tables
    dav_tables = get_available_dav_tables()

    tables = dav_tables + [
        {
            "id": "CSO_2017",
            "name": "CSO 2017 (US-Referenz)",
            "description": "US-Sterbetafel – nur als Vergleichsreferenz",
            "gender": "unisex",
            "year": 2017,
            "type": "reference",
            "publisher": "SOA"
        }
    ]
    return {"mortality_tables": tables}
```

**File: `server/services/pythonEngineService.js`**

Change the default mortality table:
```javascript
mortality_table: assumptions.mortalityTable || assumptions.mortality_table || 'DAV_2008_T',
```

### 3.2 Create unisex blended mortality tables

**File: `actuarial-engine/data/dav_mortality_tables.py`**

Add after the existing male/female table definitions:

```python
def _create_unisex_table(male_table: dict, female_table: dict, male_weight: float = 0.5) -> dict:
    """Create unisex blended table using weighted average of male and female rates."""
    female_weight = 1.0 - male_weight
    unisex_rates = {}
    for age in male_table["rates"]:
        male_rate = male_table["rates"].get(age, 1000.0)
        female_rate = female_table["rates"].get(age, 1000.0)
        unisex_rates[age] = round(male_rate * male_weight + female_rate * female_weight, 3)
    return {
        "name": male_table["name"].replace("Male", "Unisex").replace("Female", "Unisex"),
        "description": male_table["description"].replace("Männer", "Unisex").replace("Frauen", "Unisex") + " (50/50 Mischung gem. EU-Richtlinie 2004/113/EG)",
        "year": male_table["year"],
        "gender": "unisex",
        "type": male_table["type"],
        "select_period": male_table.get("select_period", 0),
        "base_year": male_table.get("base_year", male_table["year"]),
        "publisher": "Deutsche Aktuarvereinigung e.V.",
        "rates": unisex_rates
    }

DAV_2008_T_UNISEX = _create_unisex_table(DAV_2008_T_MALE, DAV_2008_T_FEMALE)
DAV_2004_R_UNISEX = _create_unisex_table(DAV_2004_R_MALE, DAV_2004_R_FEMALE)
```

Add these to `DAV_MORTALITY_TABLES`:
```python
"DAV_2008_T_UNISEX": DAV_2008_T_UNISEX,
"DAV_2004_R_UNISEX": DAV_2004_R_UNISEX,
```

Change the default unisex aliases to point to the blended tables:
```python
"DAV_2008_T": DAV_2008_T_UNISEX,  # Default to unisex (EU Gender Directive)
"DAV_2004_R": DAV_2004_R_UNISEX,  # Default to unisex (EU Gender Directive)
```

### 3.3 Fix IFRS 17 CSM sign convention

**File: `actuarial-engine/calculations/ifrs17.py`**

The IFRS 17 standard (paragraph 38) defines:
- Fulfilment Cash Flows (FCF) = PV(cash outflows) - PV(cash inflows). Positive FCF = net outflow.
- At initial recognition: CSM = max(0, -(FCF + RA))
- Loss Component = max(0, FCF + RA)

Fix the main calculation in `calculate_portfolio_csm()`:

```python
# FCF = PV(Benefits) + PV(Expenses) - PV(Premiums)
# Positive FCF means net cash outflow (insurer pays more than receives)
df['fcf'] = df['pv_benefits'] + df['pv_expenses'] - df['pv_premiums']

# CSM = max(0, -(FCF + RA)) — profit that will be recognized over coverage period
df['csm'] = np.maximum(0, -(df['fcf'] + df['risk_adjustment']))

# Loss Component = max(0, FCF + RA) — immediate loss for onerous contracts
df['loss_component'] = np.maximum(0, df['fcf'] + df['risk_adjustment'])
```

Also fix the client-side calculations in `client/src/utils/ifrs17Calculations.js`:
```javascript
export const calculateCSM = (pvPremiums, pvBenefits, pvExpenses, ra) => {
  const fcf = pvBenefits + pvExpenses - pvPremiums;  // positive = net outflow
  return Math.max(0, -(fcf + ra));
};

export const calculateLossComponent = (pvPremiums, pvBenefits, pvExpenses, ra) => {
  const fcf = pvBenefits + pvExpenses - pvPremiums;
  return Math.max(0, fcf + ra);
};
```

### 3.4 Fix MCR calculation

**File: `actuarial-engine/calculations/solvency.py`**

Replace `calculate_mcr()`:

```python
def calculate_mcr(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """
    Calculate Minimum Capital Requirement per Solvency II Articles 248-250.
    MCR = max(MCR_floor, min(0.45 × SCR, max(0.25 × SCR, MCR_linear)))
    """
    from utils.regulatory_constants import MCR_ABSOLUTE_FLOORS, MCR_LINEAR_FACTORS

    # MCR linear formula for life insurance
    technical_provisions_guaranteed = assumptions.get('tp_guaranteed', df['face_amount'].sum() * 0.80)
    technical_provisions_other = assumptions.get('tp_other', df['face_amount'].sum() * 0.15)
    capital_at_risk = assumptions.get('capital_at_risk', df['face_amount'].sum() * 0.50)

    mcr_linear = (
        MCR_LINEAR_FACTORS['life']['technical_provisions_guaranteed'] * technical_provisions_guaranteed +
        MCR_LINEAR_FACTORS['life']['technical_provisions_other'] * technical_provisions_other +
        MCR_LINEAR_FACTORS['capital_at_risk'] * capital_at_risk
    )

    # Get SCR for corridor calculation
    scr = assumptions.get('scr_for_mcr', df['face_amount'].sum() * 0.20)

    # MCR absolute floor for life insurers
    mcr_floor = MCR_ABSOLUTE_FLOORS.get('life_reinsurance', 3_700_000)

    # Corridor: between 25% and 45% of SCR
    mcr_combined = max(mcr_floor, min(0.45 * scr, max(0.25 * scr, mcr_linear)))

    return mcr_combined
```

### 3.5 Fix operational risk SCR

**File: `actuarial-engine/calculations/solvency.py`**

Replace `calculate_operational_risk_scr()`:

```python
def calculate_operational_risk_scr(df: pd.DataFrame, assumptions: Dict[str, Any]) -> float:
    """
    Calculate operational risk SCR per Article 204 of Delegated Regulation.
    Op_SCR = min(0.30 × BSCR, max(Op_premiums, Op_provisions))
    """
    earned_premiums = df['premium'].sum()
    technical_provisions = assumptions.get('technical_provisions', df['face_amount'].sum() * 0.95)
    basic_scr = assumptions.get('basic_scr', df['face_amount'].sum() * 0.20)

    # Premium-based component: 4% of earned life gross premiums
    op_premiums = 0.04 * earned_premiums

    # Provisions-based component: 0.45% of life technical provisions
    op_provisions = 0.0045 * technical_provisions

    # Capped at 30% of Basic SCR
    return min(0.30 * basic_scr, max(op_premiums, op_provisions))
```

### 3.6 Remove per-policy SCR placeholders

In `calculate_portfolio_scr()`, remove the hardcoded per-policy SCR/MCR:

```python
# Replace the placeholder per-policy results with meaningful allocation
total_scr = total_scr_adjusted
policy_results = []
for _, row in df.iterrows():
    # Proportional allocation based on face amount contribution
    weight = row['face_amount'] / df['face_amount'].sum() if df['face_amount'].sum() > 0 else 1/len(df)
    policy_result = {
        'policy_id': row['policy_id'],
        'scr_allocation': float(total_scr * weight),
        'weight': float(weight),
        'face_amount': float(row['face_amount']),
        'premium': float(row['premium'])
    }
    policy_results.append(policy_result)
```

### 3.7 Fix Pydantic deprecation

Search and replace all `.dict()` calls in the actuarial-engine Python files with `.model_dump()`:
- `actuarial-engine/main.py`: `policy.dict()` → `policy.model_dump()`
- `actuarial-engine/main.py`: `request.assumptions.dict()` → `request.assumptions.model_dump()`

### 3.8 Fix Python imports — remove sys.path hacks

**File: `actuarial-engine/calculations/ifrs17.py` and `solvency.py`**

Remove all `sys.path.append(...)` lines. Replace with proper relative imports. Create/update `actuarial-engine/pyproject.toml`:

```toml
[project]
name = "valuact-engine"
version = "1.0.0"
requires-python = ">=3.11"

[tool.setuptools.packages.find]
where = ["."]
```

Then use proper imports:
```python
# Instead of sys.path hacks + absolute imports:
from utils.audit_logger import AuditContext
from data.mortality_tables import get_mortality_table
from models.request import IFRS17Request
```

Make sure all `__init__.py` files exist and are properly set up for the package structure.

### 3.9 Remove legacy wrapper functions

Delete all functions marked "Legacy function" in both `ifrs17.py` and `solvency.py`. These include:
- `calculate_pv_benefits` (legacy wrapper)
- `calculate_pv_premiums` (legacy wrapper)
- `calculate_risk_adjustment_by_policy` (legacy wrapper)
- `calculate_expense_loading` (legacy wrapper)
- `calculate_tax_liability` (legacy wrapper)
- `calculate_market_risk_scr_legacy`
- `calculate_credit_risk_scr`
- `calculate_underwriting_risk_scr`
- `calculate_operational_risk_scr_legacy`
- `calculate_mcr_legacy`

---

## PHASE 4: GERMAN LOCALIZATION

### 4.1 Install and configure next-intl

```bash
cd client && npm install next-intl
```

Create the i18n structure:

**`client/src/i18n/config.ts`:**
```typescript
export const locales = ['de', 'en'] as const;
export const defaultLocale = 'de' as const;
```

**`client/src/i18n/de.json`:**
```json
{
  "common": {
    "calculate": "Berechnen",
    "reset": "Zurücksetzen",
    "export": "Exportieren",
    "save": "Speichern",
    "loading": "Berechnung läuft...",
    "error": "Fehler",
    "success": "Erfolgreich",
    "login": "Anmelden",
    "logout": "Abmelden",
    "register": "Registrieren",
    "settings": "Einstellungen",
    "methodology": "Methodik",
    "language": "Sprache",
    "currency": "Währung",
    "year": "Jahr",
    "years": "Jahre",
    "age": "Alter",
    "gender": "Geschlecht",
    "male": "Männlich",
    "female": "Weiblich",
    "unisex": "Unisex",
    "results": "Ergebnisse",
    "assumptions": "Annahmen",
    "inputParameters": "Eingabeparameter",
    "auditTrail": "Prüfpfad",
    "pdfExport": "PDF-Export",
    "free": "Kostenlos",
    "pro": "Professional"
  },
  "nav": {
    "home": "Startseite",
    "calculators": "Rechner",
    "ifrs17": "IFRS 17 Rechner",
    "solvency": "Solvency II Rechner",
    "mortality": "Sterbetafeln",
    "methodology": "Methodik",
    "pricing": "Preise",
    "impressum": "Impressum",
    "datenschutz": "Datenschutz"
  },
  "ifrs17": {
    "title": "IFRS 17 Rechner",
    "subtitle": "Vertragliche Servicemarge & Verlustkomponente",
    "csm": "Vertragliche Servicemarge (CSM)",
    "csmFull": "Contractual Service Margin",
    "lossComponent": "Verlustkomponente",
    "riskAdjustment": "Risikoanpassung",
    "fcf": "Erfüllungszahlungsströme",
    "fcfFull": "Fulfilment Cash Flows",
    "pvPremiums": "Barwert der Prämien",
    "pvBenefits": "Barwert der Leistungen",
    "pvExpenses": "Barwert der Kosten",
    "discountRate": "Diskontierungssatz",
    "lapseRate": "Stornoquote",
    "mortalityTable": "Sterbetafel",
    "expenseLoading": "Kostenzuschlag",
    "expenseInflation": "Kosteninflation",
    "confidenceLevel": "Konfidenzniveau",
    "policyTerm": "Vertragslaufzeit",
    "issueAge": "Eintrittsalter",
    "faceAmount": "Versicherungssumme",
    "premium": "Jahresprämie",
    "policyType": "Versicherungsart",
    "termLife": "Risikolebensversicherung",
    "wholeLife": "Kapitallebensversicherung",
    "endowment": "Erlebensversicherung",
    "annuity": "Rentenversicherung",
    "measurementModel": "Bewertungsmodell",
    "gmm": "Allgemeines Bewertungsmodell (GMM)",
    "paa": "Prämienallokationsansatz (PAA)",
    "vfa": "Variabler Gebührenansatz (VFA)",
    "csmRelease": "CSM-Auflösung",
    "coverageUnits": "Deckungseinheiten",
    "onerousContract": "Belastender Vertrag",
    "profitableContract": "Profitabler Vertrag",
    "csmAccretion": "CSM-Aufzinsung",
    "sensitivityAnalysis": "Sensitivitätsanalyse"
  },
  "solvency": {
    "title": "Solvency II Rechner",
    "subtitle": "Solvenzkapitalanforderung & Mindestkapitalanforderung",
    "scr": "Solvenzkapitalanforderung (SCR)",
    "scrFull": "Solvency Capital Requirement",
    "mcr": "Mindestkapitalanforderung (MCR)",
    "mcrFull": "Minimum Capital Requirement",
    "bscr": "Basis-SCR",
    "ownFunds": "Eigenmittel",
    "solvencyRatio": "Solvenzquote",
    "marketRisk": "Marktrisiko",
    "counterpartyRisk": "Gegenparteiausfallrisiko",
    "lifeUnderwritingRisk": "Lebensversicherungstechnisches Risiko",
    "healthUnderwritingRisk": "Krankenversicherungstechnisches Risiko",
    "nonLifeUnderwritingRisk": "Nichtlebensversicherungstechnisches Risiko",
    "operationalRisk": "Operationelles Risiko",
    "diversificationBenefit": "Diversifikationseffekt",
    "lacDT": "Verlustausgleichsfähigkeit latenter Steuern",
    "interestRateRisk": "Zinsrisiko",
    "equityRisk": "Aktienrisiko",
    "propertyRisk": "Immobilienrisiko",
    "spreadRisk": "Spreadrisiko",
    "currencyRisk": "Währungsrisiko",
    "concentrationRisk": "Konzentrationsrisiko",
    "mortalityRisk": "Sterblichkeitsrisiko",
    "longevityRisk": "Langlebigkeitsrisiko",
    "lapseRisk": "Stornorisiko",
    "expenseRisk": "Kostenrisiko",
    "catastropheRisk": "Katastrophenrisiko",
    "stressTest": "Stresstest"
  },
  "mortality": {
    "title": "Sterbetafeln",
    "subtitle": "Deutsche Aktuarvereinigung (DAV) Sterbetafeln",
    "dav2008t": "DAV 2008 T — Risikolebensversicherung",
    "dav2004r": "DAV 2004 R — Rentenversicherung",
    "survivalProbability": "Überlebenswahrscheinlichkeit",
    "mortalityRate": "Sterbewahrscheinlichkeit",
    "lifeExpectancy": "Fernere Lebenserwartung",
    "deathProbability": "Todesfallwahrscheinlichkeit (qx)"
  },
  "landing": {
    "hero": "IFRS 17 & Solvency II Rechner",
    "heroSub": "für deutsche Versicherungsmathematiker",
    "tagline": "Sofortige CSM-, SCR- und MCR-Berechnungen mit DAV-Sterbetafeln und EIOPA-Zinskurve. Vollständige Nachvollziehbarkeit.",
    "ctaFree": "Kostenlos testen",
    "ctaPricing": "Preise ansehen",
    "feature1Title": "IFRS 17 konform",
    "feature1Desc": "CSM-Berechnung nach GMM, PAA und VFA mit korrekter Verlustkomponenten-Erkennung",
    "feature2Title": "Solvency II Standard",
    "feature2Desc": "SCR nach Standardformel mit allen Risikomodulen und Korrelationsmatrizen gem. Delegierte Verordnung (EU) 2015/35",
    "feature3Title": "Deutsche Standards",
    "feature3Desc": "DAV 2008 T und DAV 2004 R Sterbetafeln, EIOPA-Zinskurve, EUR-Formatierung",
    "feature4Title": "Prüfpfad",
    "feature4Desc": "Jeder Berechnungsschritt dokumentiert — Formeln, Annahmen, Zwischenergebnisse. Bereit für Wirtschaftsprüfer und BaFin.",
    "trustedBy": "Entwickelt für den deutschen Versicherungsmarkt"
  },
  "pricing": {
    "title": "Preise",
    "freeTitle": "Kostenlos",
    "freePrice": "0 €",
    "freePeriod": "für immer",
    "freeFeature1": "3 Berechnungen pro Tag",
    "freeFeature2": "IFRS 17 CSM Basisrechner",
    "freeFeature3": "Solvency II SCR Basisrechner",
    "freeFeature4": "DAV Sterbetafeln",
    "proTitle": "Professional",
    "proPrice": "79 €",
    "proPeriod": "pro Monat",
    "proFeature1": "Unbegrenzte Berechnungen",
    "proFeature2": "Vollständiger Prüfpfad",
    "proFeature3": "PDF-Export mit Berechnungsdetails",
    "proFeature4": "Sensitivitätsanalyse",
    "proFeature5": "CSM-Abwicklungsmuster",
    "proFeature6": "EIOPA-Zinskurve",
    "proFeature7": "Portfolioberechnung (bis 100 Policen)",
    "proFeature8": "E-Mail-Support",
    "ctaFree": "Kostenlos starten",
    "ctaPro": "Professional wählen"
  },
  "errors": {
    "required": "Pflichtfeld",
    "invalidNumber": "Ungültige Zahl",
    "outOfRange": "Wert außerhalb des gültigen Bereichs",
    "calculationFailed": "Berechnung fehlgeschlagen. Bitte überprüfen Sie die Eingaben.",
    "serverError": "Serverfehler. Bitte versuchen Sie es später erneut."
  }
}
```

Create `client/src/i18n/en.json` with English equivalents for each key.

### 4.2 German number and currency formatting

**File: `client/src/utils/formatters.js`**

Replace or update the formatters to use German locale by default:

```javascript
const DEFAULT_LOCALE = 'de-DE';

export const formatCurrency = (value, locale = DEFAULT_LOCALE, currency = 'EUR') => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatPercentage = (value, locale = DEFAULT_LOCALE, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatNumber = (value, locale = DEFAULT_LOCALE, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};
```

---

## PHASE 5: REBUILD THE UI — Public Calculator Focus

### 5.1 New route structure

The app should have this route layout:

```
(public)/
  page.jsx              → Landing page (German, no auth needed)
  rechner/
    page.jsx            → Calculator selection page
    ifrs17/page.jsx     → IFRS 17 calculator (no auth for basic, auth for pro)
    solvency/page.jsx   → Solvency II calculator (same gating)
    sterbetafeln/page.jsx → Mortality table browser
  preise/page.jsx       → Pricing page with Stripe
  methodik/page.jsx     → Methodology documentation
  impressum/page.jsx    → Legal notice (keep existing, but complete it)
  datenschutz/page.jsx  → Privacy policy (rename from privacy)
  agb/page.jsx          → Terms of service

(auth)/
  anmelden/page.jsx     → Login
  registrieren/page.jsx → Register

(dashboard)/            → For logged-in pro users only
  page.jsx              → Dashboard with calculation history
  einstellungen/page.jsx → Settings
```

### 5.2 Landing page — `(public)/page.jsx`

Rebuild the landing page entirely in German. It should:

1. **Hero section**: Clear headline "IFRS 17 & Solvency II Rechner" with subline "Sofortige versicherungsmathematische Berechnungen mit DAV-Sterbetafeln. Kostenlos testen."
2. **Two CTA buttons**: "Kostenlos berechnen" (goes to /rechner) and "Preise ansehen" (goes to /preise)
3. **Three feature cards** showing IFRS 17, Solvency II, and DAV/EIOPA compliance
4. **Calculator preview**: Show a small live preview or screenshot of the calculator in action
5. **Trust signals**: "Deutsche Standards", "EIOPA-konform", "DAV-Sterbetafeln", "Vollständiger Prüfpfad"
6. **Language toggle** (DE/EN) in the navbar

Keep the existing design system colors (trust-950 navy palette). The existing design system in `designSystem.js` is good — keep using it.

### 5.3 IFRS 17 Calculator page — `rechner/ifrs17/page.jsx`

This is the core product. Rebuild the IFRS 17 calculator with these requirements:

**No auth required for basic usage.** Anyone can fill in inputs and calculate. Pro features (audit trail, PDF export, sensitivity, save) are gated behind login.

**Input panel (left side or top):**
- Versicherungssumme (face amount) — number input, EUR, default 100.000 €
- Jahresprämie (annual premium) — number input, EUR, default 3.000 €
- Eintrittsalter (issue age) — number input, range 18-85, default 35
- Vertragslaufzeit (policy term) — number input, range 1-50 years, default 20
- Geschlecht — radio: Unisex (default) / Männlich / Weiblich
- Versicherungsart — dropdown: Risikolebensversicherung (default) / Kapitallebensversicherung / Rentenversicherung

**Assumptions panel (collapsible, advanced):**
- Diskontierungssatz — slider 0%-10%, default 3,5%
- Stornoquote — slider 0%-20%, default 5%
- Sterbetafel — dropdown: DAV 2008 T Unisex (default), DAV 2008 T Männlich, DAV 2008 T Weiblich, DAV 2004 R Unisex, DAV 2004 R Männlich, DAV 2004 R Weiblich
- Kostenzuschlag — slider 0%-15%, default 5%
- Kosteninflation — slider 0%-5%, default 2%
- Risikoanpassungsfaktor — slider 0%-10%, default 2%
- Konfidenzniveau — dropdown: 75%, 90%, 95%, 99%

**Results panel (right side or bottom):**
- Large CSM number with label "Vertragliche Servicemarge (CSM)"
- Loss Component with label "Verlustkomponente"
- Status badge: "Profitabler Vertrag" (green) or "Belastender Vertrag" (red)
- Breakdown: PV Prämien, PV Leistungen, PV Kosten, FCF, Risikoanpassung
- Bewertungsmodell indicator (GMM/PAA/VFA)
- All numbers formatted as EUR with German locale

**Pro-gated features (show locked icon, clicking prompts login/upgrade):**
- "Prüfpfad anzeigen" → Full audit trail viewer
- "PDF exportieren" → PDF report download
- "Sensitivitätsanalyse" → Sensitivity to discount rate, lapse, mortality
- "CSM-Abwicklung" → CSM release pattern chart over coverage period

**Calculate button**: "Berechnen" — calls the Python engine via the Express proxy. Show a loading spinner during calculation.

For the basic/free tier: Run calculations client-side using the existing `ifrs17Calculations.js` utilities (after fixing the formulas in Phase 3). This gives instant results without server calls and avoids rate limiting issues.

For the pro tier: Also run the full Python engine calculation (server-side) which provides audit trails, and detailed per-step methodology.

### 5.4 Solvency II Calculator page — `rechner/solvency/page.jsx`

Similar structure to IFRS 17 but for SCR calculation.

**Inputs:**
- Same policy inputs as IFRS 17 (face amount, premium, age, term, gender, type)
- Plus: Eigenmittel (own funds) — EUR input
- Plus: Asset allocation section (simplified):
  - Aktienquote (equity exposure) — slider 0-50%, default 10%
  - Immobilienquote (property) — slider 0-30%, default 5%
  - Anleihenquote (bonds) — slider 0-90%, default 60%
  - Fremdwährungsquote (FX) — slider 0-30%, default 10%

**Results:**
- Large SCR number: "Solvenzkapitalanforderung (SCR)"
- MCR: "Mindestkapitalanforderung (MCR)"
- Solvenzquote (solvency ratio) as percentage with color coding (green >150%, yellow 100-150%, red <100%)
- Breakdown by risk module: Marktrisiko, Gegenparteiausfallrisiko, etc.
- Diversifikationseffekt shown as savings
- Stacked bar chart showing risk module contributions

**Pro-gated:**
- Full risk module drill-down
- Stresstest-Szenarien
- PDF export

### 5.5 Mortality Table Browser — `rechner/sterbetafeln/page.jsx`

**Free feature** — no login needed. This is an SEO magnet.

Show an interactive table browser:
- Dropdown to select table: DAV 2008 T, DAV 2004 R (with gender variants)
- Table showing qx values by age (0-120)
- Interactive chart (Recharts): mortality curve (qx) by age, with male/female/unisex toggle
- Life expectancy calculator: enter age → get remaining life expectancy
- Survival probability calculator: enter age + term → get probability of surviving
- Comparison view: overlay DAV 2008 T vs DAV 2004 R

### 5.6 Pricing page — `preise/page.jsx`

Two-column pricing layout:

**Kostenlos (Free):**
- 3 Berechnungen pro Tag
- IFRS 17 CSM-Rechner (Basis)
- Solvency II SCR-Rechner (Basis)
- DAV-Sterbetafeln Browser
- Keine Registrierung nötig
- CTA: "Kostenlos berechnen" → /rechner

**Professional — 79 €/Monat** (or 69 €/Monat bei Jahreszahlung):
- Unbegrenzte Berechnungen
- Vollständiger Prüfpfad mit Formeldokumentation
- PDF-Export mit allen Berechnungsdetails
- Sensitivitätsanalyse
- CSM-Abwicklungsmuster
- EIOPA-Zinskurvenintegration
- Portfolio-Modus (bis 100 Policen)
- Berechnungshistorie
- E-Mail-Support
- CTA: "Jetzt starten" → /registrieren

### 5.7 Complete the Impressum — `impressum/page.jsx`

Keep the existing page structure but fill in complete data as required by § 5 TMG:
- Full name: Zaur Guliyev
- Full address (street, city, postal code) — MUST be a real German address
- Phone number or contact form
- E-Mail address
- USt-IdNr. (VAT ID) if applicable, or note that it's exempt under Kleinunternehmerregelung § 19 UStG
- Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV

### 5.8 Datenschutz (Privacy/GDPR) page — `datenschutz/page.jsx`

Rebuild as proper DSGVO-compliant privacy policy in German. Must cover:
- Verantwortlicher (data controller)
- Arten der verarbeiteten Daten
- Rechtsgrundlagen (legal basis — Art. 6 DSGVO)
- Speicherdauer
- Rechte der Betroffenen (rights: access, rectification, erasure, portability)
- Firebase/Google Cloud als Auftragsverarbeiter
- Stripe als Zahlungsdienstleister
- Cookie-Nutzung

---

## PHASE 6: STRIPE INTEGRATION

### 6.1 Server-side Stripe setup

Install: `cd server && npm install stripe`

Create `server/routes/stripe.js`:

```javascript
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authMiddleware } = require('../middleware/auth');

// Create checkout session
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const { priceId, interval } = req.body; // 'month' or 'year'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card', 'sepa_debit'], // SEPA for German users
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/preise`,
    customer_email: req.user.email,
    metadata: { userId: req.user.id },
    locale: 'de', // German checkout UI
    tax_id_collection: { enabled: true }, // Collect USt-IdNr.
  });

  res.json({ url: session.url });
});

// Webhook for subscription events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

  switch (event.type) {
    case 'checkout.session.completed':
      // Update user's subscription status in Firestore
      break;
    case 'customer.subscription.deleted':
      // Downgrade user to free tier
      break;
  }

  res.json({ received: true });
});

// Check subscription status
router.get('/subscription-status', authMiddleware, async (req, res) => {
  // Check Firestore for user's subscription status
  // Return { plan: 'free' | 'pro', validUntil: ... }
});

module.exports = router;
```

Register in server/index.js:
```javascript
const stripeRoutes = require('./routes/stripe');
app.use('/api/stripe', stripeRoutes);
```

### 6.2 Rate limiting for free tier

Update the rate limiter in `server/index.js` to differentiate free vs pro:

```javascript
// Free tier: 3 calculations per day
const calculationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3,
  message: { error: 'Tageslimit erreicht. Upgraden Sie auf Professional für unbegrenzte Berechnungen.' },
  keyGenerator: (req) => req.ip, // or req.user?.id if authenticated
  skip: (req) => req.user?.plan === 'pro' // skip limit for pro users
});

app.use('/api/calculations', calculationLimiter);
```

---

## PHASE 7: SEO OPTIMIZATION

### 7.1 Metadata and page titles

Every page needs proper German-language metadata. Use Next.js metadata API:

```javascript
// app/(public)/rechner/ifrs17/page.jsx
export const metadata = {
  title: 'IFRS 17 CSM Rechner | ValueAct Rechner',
  description: 'Kostenloser IFRS 17 Rechner für die Vertragliche Servicemarge (CSM). Mit DAV-Sterbetafeln, EIOPA-Zinskurve und vollständigem Prüfpfad.',
  keywords: 'IFRS 17, CSM, Vertragliche Servicemarge, Rechner, Versicherungsmathematik, DAV, Sterbetafel',
  openGraph: {
    title: 'IFRS 17 CSM Rechner — Kostenlos berechnen',
    description: 'Sofortige CSM-Berechnung nach IFRS 17 mit deutschen Standards. DAV 2008 T Sterbetafeln inklusive.',
    locale: 'de_DE',
  }
};
```

Do the same for:
- `/rechner/solvency` → "Solvency II SCR Rechner"
- `/rechner/sterbetafeln` → "DAV Sterbetafeln Online — Sterbewahrscheinlichkeiten"
- `/` → "ValueAct Rechner — IFRS 17 & Solvency II für Aktuare"

### 7.2 Structured data (JSON-LD)

Add to landing page:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ValueAct Rechner",
  "applicationCategory": "FinanceApplication",
  "description": "Online-Rechner für IFRS 17 und Solvency II mit DAV-Sterbetafeln",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "EUR"
  }
}
</script>
```

### 7.3 robots.txt and sitemap

Create `client/public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://rechner.valuact.io/sitemap.xml
```

Generate a `sitemap.xml` via Next.js `app/sitemap.ts`.

---

## PHASE 8: FINAL CLEANUP

### 8.1 Remove duplicate calculation logic

The Python actuarial engine is the source of truth for all pro/portfolio calculations. The client-side `ifrs17Calculations.js` and `solvencyCalculations.js` should only contain the simplified free-tier versions.

In `client/src/utils/ifrs17Calculations.js`: Keep only `calculateCSM`, `calculateLossComponent`, `calculatePresentValue`, `calculateCSMRelease`, `generateCSMRunoff`. Remove everything else — the full calculation comes from the API.

In `client/src/utils/solvencyCalculations.js`: Keep only a simplified SCR estimate for the free tier. The full Solvency II standard formula runs on the Python engine.

### 8.2 Update the AI chat system prompt to German

In `server/controllers/chatController.js`, replace the English system prompt:

```javascript
const systemPrompt = `Du bist ein Experte für Versicherungsmathematik und unterstützt Aktuare bei der täglichen Arbeit. 

Deine Kernkompetenz:
- IFRS 17: GMM, PAA, VFA, CSM-Mechanik, Risikoanpassung, Verlustkomponente
- Solvency II: SCR/MCR nach Standardformel, Risikomodule, Delegierte Verordnung (EU) 2015/35
- Deutsche Standards: DAV-Sterbetafeln, BaFin-Anforderungen, VAG
- EIOPA: Risikofreie Zinskurve, Smith-Wilson-Extrapolation, UFR

Antworte auf Deutsch, es sei denn, der Benutzer schreibt auf Englisch.
Verwende die korrekte versicherungsmathematische Fachterminologie.
Gib praxisnahe Antworten mit Bezug zu regulatorischen Anforderungen.`;
```

### 8.3 Environment-specific configurations

Create `client/.env.local.example`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_DEFAULT_LOCALE=de
```

### 8.4 README.md rewrite

Replace the README with:

```markdown
# ValueAct Rechner

Online IFRS 17 & Solvency II Rechner für deutsche Versicherungsmathematiker.

## Features

- **IFRS 17 CSM-Rechner**: Vertragliche Servicemarge mit GMM/PAA/VFA
- **Solvency II SCR-Rechner**: Standardformel mit allen Risikomodulen
- **DAV-Sterbetafeln**: DAV 2008 T und DAV 2004 R (Männlich/Weiblich/Unisex)
- **EIOPA-Zinskurve**: Smith-Wilson-Extrapolation mit UFR
- **Prüfpfad**: Vollständige Nachvollziehbarkeit aller Berechnungsschritte

## Tech Stack

- **Frontend**: Next.js 16 + Tailwind CSS
- **Backend**: Express.js (API Proxy)
- **Engine**: Python FastAPI (Berechnungen)
- **Database**: Firebase Firestore
- **Payments**: Stripe (SEPA + Kreditkarte)

## Development

\`\`\`bash
# Dependencies installieren
npm run install-all

# Umgebungsvariablen einrichten
cp server/.env.example server/.env
# → Variablen in .env eintragen

# Starten
npm run dev
\`\`\`

Frontend: http://localhost:3000
Backend: http://localhost:3001
Engine: http://localhost:8000

## License

Proprietary — Synexa Labs
```

---

## ORDER OF EXECUTION

If working through this sequentially, the recommended order is:

1. **Phase 1** (Strip down) — 30 min
2. **Phase 2** (Security fixes) — 1 hour
3. **Phase 3** (Actuarial correctness) — 3-4 hours
4. **Phase 4** (German i18n) — 2-3 hours
5. **Phase 5** (Rebuild UI) — This is the biggest phase. Work on it incrementally:
   - 5.1 Route structure — 30 min
   - 5.2 Landing page — 2-3 hours
   - 5.3 IFRS 17 Calculator — 4-6 hours (most important page)
   - 5.4 Solvency II Calculator — 3-4 hours
   - 5.5 Mortality tables — 2-3 hours
   - 5.6 Pricing page — 1-2 hours
   - 5.7-5.8 Legal pages — 1-2 hours
6. **Phase 6** (Stripe) — 2-3 hours
7. **Phase 7** (SEO) — 1-2 hours
8. **Phase 8** (Cleanup) — 1-2 hours

**Total estimated effort: ~25-35 hours of focused work.**

---

## IMPORTANT CONSTRAINTS

- **Never expose secrets in client-side code.** All API keys, Firebase credentials, and Stripe secret keys stay server-side.
- **All UI text must be in German by default.** Use the i18n keys from Phase 4. English is the secondary language.
- **All currency values must display as EUR in German locale.** Example: `1.234.567,89 €`
- **All actuarial calculations must use the corrected formulas from Phase 3.** Do not keep the old formulas.
- **The mortality table default must be DAV 2008 T Unisex**, not CSO 2017.
- **Keep the existing Tailwind design system** (trust-*, growth-*, accent-* color tokens). The existing design is professional — don't replace it with a generic template.
- **The app must work without JavaScript for basic SEO** — use Next.js server components for landing/pricing/legal pages.
- **Rate limit free tier at the server level**, not client level (client-side limits are bypassable).
- **The Python actuarial engine is the single source of truth** for all calculations. Client-side JS (`ifrs17Calculations.js`, `solvencyCalculations.js`) should only have simplified free-tier logic. Never duplicate the full calculation in JavaScript.
- **Legal pages (Impressum, Datenschutz, AGB) are legally mandatory** in Germany. The app cannot launch without them.

---

## APPENDIX A: STRIPE ROUTE IMPLEMENTATION

Create `server/routes/stripe.js`:

```javascript
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

// Create checkout session
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email,
      payment_method_types: ['card', 'sepa_debit'],  // SEPA for German users
      line_items: [{
        price: process.env.STRIPE_PRICE_ID_MONTHLY,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/konto?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/rechner`,
      locale: 'de',
      tax_id_collection: { enabled: true },  // VAT collection for EU B2B
      metadata: { userId: req.user.id }
    });
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    logger.error('Stripe checkout error:', error);
    res.status(500).json({ error: 'Checkout fehlgeschlagen' });
  }
});

// Webhook for subscription lifecycle events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const admin = require('firebase-admin');
  const db = admin.firestore();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata.userId;
      if (userId) {
        await db.collection('users').doc(userId).update({
          plan: 'premium',
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          planUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const snapshot = await db.collection('users')
        .where('stripeSubscriptionId', '==', subscription.id).get();
      snapshot.forEach(async (doc) => {
        await doc.ref.update({ plan: 'free', planUpdatedAt: admin.firestore.FieldValue.serverTimestamp() });
      });
      break;
    }
  }
  res.json({ received: true });
});

// Check subscription status
router.get('/subscription', authMiddleware, async (req, res) => {
  const admin = require('firebase-admin');
  const db = admin.firestore();
  const userDoc = await db.collection('users').doc(req.user.id).get();
  res.json({ plan: userDoc.data()?.plan || 'free' });
});

module.exports = router;
```

**Important:** Register the webhook route BEFORE `express.json()` middleware in `server/index.js`:
```javascript
// Stripe webhook needs raw body — mount BEFORE express.json()
const stripeWebhook = require('./routes/stripe');
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Then JSON parsing for everything else
app.use(express.json({ limit: '10mb' }));

// Then mount the rest of stripe routes
app.use('/api/stripe', stripeWebhook);
```

Install stripe: `cd server && npm install stripe`
Client: `cd client && npm install @stripe/stripe-js`

---

## APPENDIX B: GEMINI PROMPT INJECTION FIX

The current `server/controllers/chatController.js` directly interpolates user input into the prompt string, which is vulnerable to prompt injection.

Replace the chat handler's prompt construction:

```javascript
// CURRENT (vulnerable):
const prompt = `You are an expert actuarial co-pilot... User question: ${message}`;
const result = await model.generateContent(prompt);

// FIXED (use structured messages):
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  systemInstruction: `Du bist ein Experte für Versicherungsmathematik...` // system prompt here
});

const chat = model.startChat({ history: [] });
const result = await chat.sendMessage(message);  // user input is isolated
```

Also update the model from `"gemini-pro"` to `"gemini-2.0-flash"` (newer, faster, cheaper).

---

## APPENDIX C: IMPRESSUM LEGAL REQUIREMENTS

The Impressum page (`/impressum`) is legally required by § 5 TMG (Telemediengesetz) and must contain:

1. **Full legal name:** Zaur Guliyev
2. **Full postal address:** Street, PLZ, City, Germany (complete — "Germany" alone is insufficient)
3. **Contact:** Email address (mandatory), phone number (recommended)
4. **VAT ID:** Umsatzsteuer-Identifikationsnummer (if applicable, § 27a UStG)
5. **Responsible for content:** "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV: Zaur Guliyev"
6. **EU dispute resolution:** Link to https://ec.europa.eu/consumers/odr/ (required for online services)

The existing Impressum page at `client/src/app/(main)/impressum/page.jsx` only contains "Zaur Guliyev" and "Germany" — this is non-compliant. Update with full details.

---

## APPENDIX D: FREE TIER RATE LIMITING

Add a rate limiter specifically for free-tier calculator usage on the server:

```javascript
// server/middleware/calculationRateLimit.js
const rateLimit = require('express-rate-limit');

const freeCalcLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 calculations per day for free users
  keyGenerator: (req) => {
    // Use user ID for authenticated users, IP for anonymous
    return req.user?.id || req.ip;
  },
  skip: (req) => {
    // Skip rate limit for premium users
    return req.user?.plan === 'premium';
  },
  message: {
    error: 'Tageslimit erreicht',
    message: 'Sie haben das kostenlose Tageslimit von 3 Berechnungen erreicht. Upgrade auf Premium für unbegrenzte Berechnungen.',
    upgradeUrl: '/preise'
  }
});

module.exports = { freeCalcLimiter };
```

Apply to calculation routes:
```javascript
const { freeCalcLimiter } = require('../middleware/calculationRateLimit');
router.post('/start', optionalAuthMiddleware, freeCalcLimiter, calculationController.startCalculation);
```

---

## APPENDIX E: CLIENT API ADDITIONS

Add to `client/src/utils/api.js`:

```javascript
export const stripe = {
  createCheckoutSession: () => api.post('/api/stripe/create-checkout-session'),
  getSubscription: () => api.get('/api/stripe/subscription'),
};

export const mortality = {
  getTables: () => api.get('/api/data/mortality-tables'),
  getTable: (tableId) => api.get(`/api/data/mortality-tables/${tableId}`),
};
```
