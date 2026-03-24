# ValueAct Rechner — Deep Dive: Actuarial Audit + Engineering Review + Implementation Plan

This document is a comprehensive review of the ValueAct2 codebase from two perspectives: (1) a qualified actuary auditing calculation correctness, and (2) a software engineer evaluating architecture, UX, and monetization readiness. Every item includes exact file paths and implementation instructions for Claude Code.

Execute all changes in the order presented. Each section builds on previous ones.

---

## PART A: ACTUARIAL CORRECTNESS FIXES

These issues affect the mathematical validity of results. An actuary who spot-checks your outputs against their own models will immediately notice these problems. Fixing them is essential for professional credibility.

---

### A1. CRITICAL: PV Benefits Includes a Maturity Benefit That Shouldn't Exist for Term Life

**File:** `actuarial-engine/calculations/ifrs17.py` → `calculate_pv_benefits_vectorized()`

**Problem:** The function always adds a maturity benefit:
```python
maturity_benefit = face_amount * survival_probs[-1] * discount_factors[term-1]
pv_benefits[i] = np.sum(death_benefits) + maturity_benefit
```

For term life insurance (`Risikolebensversicherung`), there is NO maturity benefit — if the insured survives the term, nothing is paid. This maturity benefit should only apply to endowment (`Erlebensversicherung`) or whole life products.

This error massively inflates PV(Benefits), which makes FCF more negative, which makes contracts appear more onerous than they are.

**Fix:** Make the maturity benefit conditional on policy type:
```python
# PV of death benefits
death_benefits = face_amount * mortality_probs * discount_factors[:term]

# PV of maturity benefit — ONLY for endowment and whole life
policy_type = row.get('policy_type', 'term_life')
if policy_type in ('endowment', 'whole_life'):
    maturity_benefit = face_amount * survival_probs[-1] * discount_factors[term-1]
else:
    maturity_benefit = 0.0

pv_benefits[i] = np.sum(death_benefits) + maturity_benefit
```

Also fix the non-vectorized version `calculate_pv_benefits_proper()` — it does NOT include a maturity benefit currently, which means the vectorized and non-vectorized versions produce DIFFERENT results. Make them consistent.

---

### A2. CRITICAL: PV Premiums Doesn't Include Lapse in Vectorized Version

**File:** `actuarial-engine/calculations/ifrs17.py` → `calculate_pv_premiums_vectorized()`

**Problem:** The vectorized premium function uses only survival probabilities:
```python
premium_cashflows = premium * survival_probs * discount_factors[:term]
```

But the non-vectorized version `calculate_pv_premiums_proper()` includes both survival AND persistence (lapse) probabilities:
```python
survival_probability = get_survival_probability(...)
persistence_probability = get_cumulative_persistence(lapse_rate, t, policy_type)
premium_amount = premium * survival_probability * persistence_probability
```

The vectorized version ignores lapse entirely, meaning it overestimates premium income. Since `calculate_portfolio_csm()` calls the VECTORIZED version, all portfolio calculations are wrong.

**Fix:** Add persistence probabilities to the vectorized function:
```python
lapse_rate = assumptions.get('lapse_rate', 0.05)
policy_type = row.get('policy_type', 'term_life')
use_dynamic_lapse = assumptions.get('use_dynamic_lapse', True)

# Calculate persistence probabilities
if use_dynamic_lapse:
    persistence_probs = np.array([
        get_cumulative_persistence(lapse_rate, t, policy_type)
        for t in range(1, term + 1)
    ])
else:
    persistence_probs = np.array([(1 - lapse_rate) ** t for t in range(1, term + 1)])

premium_cashflows = premium * survival_probs * persistence_probs * discount_factors[:term]
```

Import `get_cumulative_persistence` at the top of the function or ensure it's accessible.

---

### A3. CRITICAL: PV Expenses Vectorized Doesn't Include Inflation

**File:** `actuarial-engine/calculations/ifrs17.py` → `calculate_pv_expenses_vectorized()`

**Problem:** The vectorized version computes:
```python
expense_cashflows = premium * expense_loading * survival_probs * discount_factors[:term]
```

But the non-vectorized version `calculate_pv_expenses()` includes expense inflation:
```python
renewal_expense = premium * expense_loading * (1 + expense_inflation) ** t
```

The vectorized version ignores expense inflation entirely.

**Fix:** Add inflation escalation:
```python
expense_inflation = assumptions.get('expense_inflation', 0.02)
inflation_factors = np.array([(1 + expense_inflation) ** t for t in range(1, term + 1)])
expense_cashflows = premium * expense_loading * survival_probs * inflation_factors * discount_factors[:term]
```

---

### A4. IMPORTANT: Risk Adjustment Module Exists But Isn't Used

**Files:**
- `actuarial-engine/calculations/risk_adjustment.py` — has a proper Cost of Capital (CoC) implementation
- `actuarial-engine/calculations/ifrs17.py` — uses a crude `|FCF| × factor × confidence_multiplier` instead

**Problem:** A well-implemented Risk Adjustment module with both CoC and Confidence Level approaches exists in `risk_adjustment.py`, but `calculate_portfolio_csm()` in `ifrs17.py` never calls it. Instead it uses an ad-hoc formula with arbitrary confidence multipliers (0.75→1.0x, 0.90→1.5x, etc.) that have no actuarial basis.

**Fix:** Wire the proper RA calculation into the IFRS 17 pipeline. In `calculate_portfolio_csm()`, replace the current RA section:

```python
# Replace the crude RA calculation with the proper module
from calculations.risk_adjustment import calculate_risk_adjustment_portfolio

ra_method = assumptions.get('ra_method', 'coc')  # 'coc' or 'confidence_level'
ra_result = calculate_risk_adjustment_portfolio(df, assumptions, method=ra_method)
total_ra = ra_result['risk_adjustment']

# Allocate RA proportionally to face amount
total_face = df['face_amount'].sum()
df['risk_adjustment'] = df['face_amount'] / total_face * total_ra if total_face > 0 else 0
```

Also add `ra_method` to the IFRS17Calculator.jsx assumptions panel so users can choose between CoC (default) and Confidence Level approaches. Add a UI dropdown:
```javascript
{ name: 'raMethod', label: 'RA-Methode' }
// Options: 'coc' → 'Cost of Capital (6%)', 'confidence_level' → 'Konfidenzniveau'
```

---

### A5. IMPORTANT: EIOPA Yield Curve Not Integrated — Flat Rate Used Instead

**Files:**
- `actuarial-engine/utils/eiopa_yield_curve.py` — complete Smith-Wilson implementation
- `actuarial-engine/calculations/ifrs17.py` — uses flat `assumptions['discount_rate']`
- `actuarial-engine/calculations/solvency.py` — uses flat `assumptions['discount_rate']`

**Problem:** The EIOPA yield curve module is complete with Smith-Wilson extrapolation, UFR convergence, volatility adjustment, and country-specific data. But no calculation actually uses it. Both IFRS 17 and Solvency II calculations use a single flat discount rate.

For Solvency II, using a flat rate instead of the term structure is technically non-compliant with the Delegated Regulation. For IFRS 17, using a flat rate is a valid simplification but loses significant accuracy for long-duration contracts.

**Fix — Phase 1 (add as pro feature):** Add a toggle `use_term_structure` in assumptions. When enabled, use the EIOPA curve for discounting:

In `calculate_pv_benefits_vectorized()`, `calculate_pv_premiums_vectorized()`, and `calculate_pv_expenses_vectorized()`, replace the flat discount factor calculation:

```python
if assumptions.get('use_term_structure', False):
    from utils.eiopa_yield_curve import get_eiopa_yield_curve
    curve = get_eiopa_yield_curve(currency='EUR', country='DE', include_va=True)
    discount_factors = np.array([curve.get_discount_factor(t) for t in time_vector])
else:
    discount_factors = np.array([get_cached_discount_factor(discount_rate, t) for t in time_vector])
```

Add to IFRS17Calculator.jsx as a pro-only toggle:
```javascript
// In the assumptions panel, add:
<div className="flex items-center justify-between">
  <span className="text-sm text-gray-600">EIOPA-Zinskurve verwenden</span>
  {isPro ? (
    <input type="checkbox" name="useTermStructure" ... />
  ) : (
    <span className="text-xs text-gray-400 flex items-center gap-1"><Lock size={12} /> Pro</span>
  )}
</div>
```

---

### A6. IMPORTANT: CSM Roll-Forward Module Exists But Isn't Exposed

**File:** `actuarial-engine/calculations/csm_rollforward.py`

**Problem:** A complete CSM roll-forward module exists with proper IFRS 17 §44 movements (new business, interest accretion, changes in estimates, experience adjustments, currency, release). But it's not connected to any API endpoint or UI component.

CSM roll-forward is one of the most valuable features for actuaries — it shows the period-to-period movement of CSM which is required for IFRS 17 financial statements.

**Fix:** Create a new API endpoint and UI component.

Add to `actuarial-engine/main.py`:
```python
from calculations.csm_rollforward import calculate_csm_rollforward

@app.post("/api/v1/calculate/csm-rollforward")
async def csm_rollforward(request: dict):
    """Calculate CSM roll-forward between periods"""
    try:
        result = calculate_csm_rollforward(
            opening_balance=request.get('opening_balance', {}),
            new_business=request.get('new_business', []),
            assumptions=request.get('assumptions', {}),
            economic_data=request.get('economic_data', {})
        )
        return result.to_dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

Add to `server/routes/calculations.js`:
```javascript
router.post('/csm-rollforward', async (req, res) => {
  try {
    const response = await axios.post(
      `${PYTHON_ENGINE_URL}/api/v1/calculate/csm-rollforward`,
      req.body,
      { timeout: 30000 }
    );
    res.json(response.data);
  } catch (err) {
    logger.error('CSM rollforward error:', err.message);
    res.status(500).json({ error: 'CSM-Überleitung fehlgeschlagen' });
  }
});
```

Create a new tab "CSM-Überleitung" in the IFRS 17 calculator that shows a waterfall chart of the CSM movement. This is a pro-only feature.

---

### A7. MODERATE: Audit Trail Formula Documentation Is Inconsistent

**File:** `actuarial-engine/calculations/ifrs17.py` — at the end of `calculate_portfolio_csm()`

**Problem:** The `audit.add_formula_used()` calls at the end still have the OLD formulas that don't match the corrected code:
```python
audit.add_formula_used("CSM_Initial", "2.0.0", "Initial CSM Recognition",
                      "CSM_0 = \\max(0, FCF_0 - RA_0)")  # WRONG — code does -(FCF + RA)
audit.add_formula_used("FCF", "2.0.0", "Fulfilment Cash Flows",
                      "FCF = PV_{premiums} - PV_{benefits} - PV_{expenses}")  # WRONG — code does Benefits + Expenses - Premiums
audit.add_formula_used("Loss_Component", "2.0.0", "Loss Component",
                      "LC = \\max(0, RA - FCF)")  # WRONG — code does max(0, FCF + RA)
```

An actuary reviewing the audit trail will see formulas that contradict the actual calculations.

**Fix:** Update all formula documentation to match the actual code:
```python
audit.add_formula_used("CSM_Initial", "2.1.0", "Erstmalige Erfassung der CSM (IFRS 17 Abs. 38)",
                      "CSM_0 = \\max(0, -(FCF_0 + RA_0))")
audit.add_formula_used("FCF", "2.1.0", "Erfüllungszahlungsströme",
                      "FCF = PV_{Leistungen} + PV_{Kosten} - PV_{Prämien}")
audit.add_formula_used("Risk_Adjustment", "2.1.0", "Risikoanpassung",
                      "RA = CoC \\times \\sum_{t} \\frac{SCR_t}{(1+r)^t}")
audit.add_formula_used("Loss_Component", "2.1.0", "Verlustkomponente",
                      "LC = \\max(0, FCF + RA)")
audit.add_formula_used("CSM_Release", "2.1.0", "CSM-Auflösung (IFRS 17 B119)",
                      "CSM_{release,t} = CSM_{opening,t} \\times \\frac{CU_t}{\\sum CU}")
```

Also update the methodology version from "2.0.0" to "2.1.0" throughout.

---

### A8. MODERATE: Solvency II Operational Risk Includes Op Risk in the Correlation Matrix (Circular)

**File:** `actuarial-engine/calculations/solvency.py` → `calculate_total_scr()`

**Problem:** Per Solvency II Article 103, operational risk is added OUTSIDE the correlation matrix. The total SCR is:
```
SCR = BSCR + Op_SCR + Adj (LAC)
```

But in the current code, `operational_risk` is passed INTO `calculate_total_scr()` which puts it through the square-root correlation formula alongside the other risks. The correlation matrix correctly has 0.0 for all op risk entries, so the math works out (op risk just adds its square), but the structure is semantically wrong and will confuse reviewers.

**Fix:** Restructure `calculate_portfolio_scr()` to separate BSCR from operational risk:

```python
# Calculate BSCR (without operational risk)
bscr = calculate_total_scr({
    'market_risk': market_risk_scr,
    'counterparty_risk': counterparty_risk_scr,
    'life_underwriting_risk': life_underwriting_risk_scr,
    'health_underwriting_risk': health_underwriting_risk_scr,
    'non_life_underwriting_risk': non_life_underwriting_risk_scr,
})

# Op risk uses BSCR as input (Art. 204)
operational_risk_scr = calculate_operational_risk_scr(df, {**assumptions, 'basic_scr': bscr})

# Total SCR = BSCR + Op_SCR - LAC_DT
total_scr = bscr + operational_risk_scr
total_scr_adjusted = total_scr - lac_dt
```

Remove `'operational_risk'` from the `calculate_total_scr()` call and the main correlation matrix entries.

---

### A9. MODERATE: Mortality Table Rates Used as Decimals vs Per-Mille Inconsistency

**File:** `actuarial-engine/data/dav_mortality_tables.py` vs `actuarial-engine/data/mortality_tables.py`

**Problem:** DAV tables store rates as per-mille (‰), e.g., `0: 3.620` means 3.620 per 1000. The `get_dav_mortality_rate()` function correctly divides by 1000. But `mortality_tables.py` (the general module) stores rates differently, and the `get_mortality_rate()` function may not consistently handle the conversion depending on which table is used.

Verify: when `calculate_pv_benefits_vectorized()` calls `get_cached_mortality_rate('DAV_2008_T', 35, 'M')`, does it get back 0.001360 (correct decimal) or 1.360 (per-mille)?

**Fix:** Add a unit test that verifies:
```python
from data.dav_mortality_tables import get_dav_mortality_rate
rate = get_dav_mortality_rate("DAV_2008_T", 35, "male")
assert 0.001 < rate < 0.002, f"Expected ~0.00136, got {rate}"  # Should be ~0.00136
```

Also verify that `mortality_tables.py`'s `get_mortality_rate()` dispatches correctly to `get_dav_mortality_rate()` for DAV tables and returns rates in the same decimal format.

---

### A10. MODERATE: Dynamic Lapse Multipliers Are Unsourced

**File:** `actuarial-engine/calculations/ifrs17.py` → `get_dynamic_lapse_rate()`

**Problem:** The lapse multipliers `{0: 0.50, 1: 1.50, 2: 1.30, ...}` are described as "based on industry experience" but no source is cited. A qualified actuary will immediately question where these come from.

**Fix:** Either:
A) Source them from published DAV/BaFin guidance or a recognized study (e.g., DAV-Hinweis "Stornoabzug"), and add the citation in the docstring.
B) Or explicitly label them as "Beispielhafte Stornomultiplikatoren — bitte durch unternehmensspezifische Werte ersetzen" (example lapse multipliers — please replace with company-specific values) and make them configurable via the assumptions input.

Add them as a configurable parameter:
```python
LAPSE_MULTIPLIERS = assumptions.get('lapse_multipliers', {
    0: 0.50, 1: 1.50, 2: 1.30, 3: 1.10, 4: 1.00, 5: 0.90
})
```

---

## PART B: SOFTWARE & UX IMPROVEMENTS FOR MONETIZATION

These changes make the product genuinely useful in daily actuarial work and worth paying for.

---

### B1. Add CSV Portfolio Upload (Pro Feature)

**Problem:** Currently, the calculator only supports a single policy. No actuary works with one policy at a time. The Python engine already supports portfolio calculations (up to 1000 policies). But there's no way to upload a portfolio from the UI.

**Fix:** Create a simple CSV upload component for pro users.

Create `client/src/components/PortfolioUpload.jsx`:
- Accept CSV with columns: policy_id, issue_date, face_amount, premium, issue_age, policy_term, gender, policy_type
- Parse with Papa Parse (already in package.json but unused — keep it for this)
- Validate column headers and data types
- Show preview table of first 10 rows
- Submit to `/api/calculations/ifrs17` or `/api/calculations/solvency` with full portfolio

Add a tab "Portfolio" to both IFRS17Calculator and SolvencyCalculator that shows:
- For free users: "Portfolio-Berechnung ab Professional — bis zu 100 Policen gleichzeitig"
- For pro users: the upload component

Create a sample CSV file `client/public/beispiel-portfolio.csv` with 5 example policies that users can download.

---

### B2. Add PDF Report Export (Pro Feature)

**Problem:** Actuaries need to produce documentation for auditors and regulators. Currently there's no way to export results. The server has `pdfkit` installed but unused.

**Fix:** Create a PDF generation endpoint on the server.

Create `server/services/pdfReportService.js`:
- Generate a professional PDF report from IFRS 17 or Solvency II calculation results
- Include: title page, executive summary, input parameters, results summary, detailed breakdown, audit trail, methodology notes, disclaimer
- Use pdfkit (already installed)
- Return the PDF as a downloadable buffer

Add endpoint in `server/routes/calculations.js`:
```javascript
router.post('/export-pdf', async (req, res) => {
  const { calculationType, results, inputs, assumptions } = req.body;
  const pdfBuffer = await pdfReportService.generateReport(calculationType, results, inputs, assumptions);
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename=valueact-${calculationType}-${Date.now()}.pdf`,
  });
  res.send(pdfBuffer);
});
```

Add a "PDF exportieren" button to the calculator results panels (pro-only with lock icon for free users).

---

### B3. Add Sensitivity Analysis UI (Pro Feature)

**Problem:** The Python engine has `calculate_csm_sensitivity()` and `calculate_scr_sensitivity()` functions, and the server has a `/sensitivity` route. But there's no UI for it.

Sensitivity analysis is something actuaries do constantly — "what if the discount rate changes by ±50bp?" This is a key differentiator for a paid tool.

**Fix:** Create `client/src/components/calculators/SensitivityPanel.jsx`:
- User selects 1-3 parameters to stress (discount rate, lapse rate, mortality shock, etc.)
- User defines shock ranges (e.g., -100bp to +100bp in 25bp steps)
- Display results as a tornado chart (horizontal bars showing impact per parameter)
- Display a table showing CSM/SCR under each scenario

Wire it into both IFRS17Calculator and SolvencyCalculator as a collapsible "Sensitivitätsanalyse" section. Pro-only.

---

### B4. Add EIOPA Yield Curve Viewer Page

**Problem:** The EIOPA yield curve module is complete but invisible to users. Showing the current yield curve is valuable standalone content that actuaries will bookmark.

**Fix:** Create `client/src/app/(public)/rechner/zinskurve/page.jsx`:
- Display the current EIOPA EUR risk-free rate term structure as a line chart (recharts)
- Show spot rates at key maturities (1, 5, 10, 20, 30, 50 years)
- Show forward rate curve
- Show discount factors
- Toggle Volatility Adjustment on/off
- Country selector (DE, FR, IT, ES, NL, AT, BE)
- Show UFR convergence point

Add a new API endpoint:
```javascript
// server/index.js or a new route
app.get('/api/yield-curve', async (req, res) => {
  try {
    const response = await axios.get(`${PYTHON_ENGINE_URL}/api/v1/yield-curve`, {
      params: { currency: req.query.currency || 'EUR', country: req.query.country || 'DE' }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Zinskurve nicht verfügbar' });
  }
});
```

Add Python endpoint:
```python
@app.get("/api/v1/yield-curve")
async def yield_curve(currency: str = "EUR", country: str = "DE"):
    from utils.eiopa_yield_curve import get_curve_summary
    return get_curve_summary(currency=currency, country=country)
```

Add to Navbar: "Zinskurve" link.
Add to sitemap.

This is free content that drives SEO traffic for "EIOPA Zinskurve" searches.

---

### B5. Add Disclaimer Banner on All Calculator Results

**Problem:** No disclaimer anywhere that results are indicative only. A German lawyer would flag this immediately.

**Fix:** Add a small disclaimer below every calculation result:

```jsx
<div className="text-xs text-gray-400 mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
  <strong>Hinweis:</strong> Die Berechnungen dienen ausschließlich Informations- und Illustrationszwecken.
  Sie stellen keine versicherungsmathematische Beratung dar und ersetzen nicht die Prüfung durch einen
  zugelassenen Aktuar. Für die Richtigkeit der Ergebnisse wird keine Haftung übernommen.
  {results.source === 'client' && (
    <> Kostenlose Berechnungen verwenden vereinfachte Annahmen. Für die vollständige
    Berechnung mit DAV-Sterbetafeln und Prüfpfad nutzen Sie den Professional-Plan.</>
  )}
</div>
```

Add this to both IFRS17Calculator.jsx and SolvencyCalculator.jsx in the results panel.

---

### B6. Add Calculation History (Pro Feature)

**Problem:** Pro users can't see their previous calculations. Every calculation is fire-and-forget.

**Fix:** Save calculation results to Firestore for authenticated users.

In `server/routes/calculations.js`, after a successful calculation, save to Firestore:
```javascript
if (req.user?.id) {
  const admin = require('firebase-admin');
  await admin.firestore().collection('calculations').add({
    userId: req.user.id,
    type: 'ifrs17', // or 'solvency'
    inputs: req.body,
    results: responseData,
    createdAt: new Date().toISOString(),
  });
}
```

Add a `/api/calculations/history` endpoint that returns the user's last 50 calculations.

Add a "Berechnungshistorie" section to the dashboard page showing a table of past calculations with date, type, key result (CSM or SCR), and a link to re-view.

---

## PART C: REMAINING BUG FIXES

### C1. Rate Limiter Middleware Order (from previous review)
Move the rate limiter inside routes/calculations.js AFTER authMiddleware. Create `server/middleware/calculationRateLimit.js`. Remove inline limiter from index.js. See previous review for exact code.

### C2. Stripe Webhook `admin` Scope
Move `const admin = require('firebase-admin')` to the top of `server/routes/stripe.js`.

### C3. pythonEngineService.js Defaults
- Line 21: Change `mortalityTable: Joi.string().default('CSO_2017')` → `'DAV_2008_T'`
- Line ~264: Change fallback tables list to DAV tables

### C4. SolvencyCalculator Client MCR Factors
In `clientSCREstimate()`, fix: `0.045 * face * 0.80 + 0.0085 * face * 0.15 + 0.0015 * face * 0.50`

### C5. MortalityBrowser Life Expectancy
Replace arbitrary `1.07` escalation with Gompertz: `Math.min(1, q0 * Math.exp(0.085 * t))`

### C6. IFRS17Calculator Bewertungsmodell
Fix the ternary that always shows GMM. Show VFA for annuity type.

### C7. VAT Contradiction
Preise page: change "zzgl. MwSt." to "Gemäß § 19 UStG wird keine Umsatzsteuer erhoben."

### C8. Impressum Address
Add TODO placeholder with full address format.

### C9. TrustedHostMiddleware
Change `allowed_hosts=["*"]` to `os.getenv("ALLOWED_HOSTS", "localhost").split(",")`

### C10. Dockerfile Comment + pip install -e .
Fix comment, add `RUN pip install -e .`

### C11. Error Handlers to German
Change "Something went wrong!" → "Ein Fehler ist aufgetreten..."
Change "Route not found" → "Route nicht gefunden."

### C12. Delete Stale Files
```bash
rm DATA_FORMAT_REFERENCE.md DATA_MANAGEMENT_GUIDE.md vercel.json Valuact_logo_v2.png
rm -f server/logs/combined.log server/logs/error.log
```

### C13. Remove Unused npm Dependencies
```bash
cd client && npm uninstall firebase html2canvas katex react-katex react-dropzone react-to-print
```
Keep: papaparse (for B1 CSV upload), recharts (for charts), framer-motion (used in Login), jspdf (future use).

### C14. Remove DE/EN Toggle (Not Wired Up)
Remove the language toggle button from Navbar.jsx. The app is German-only for launch. The `LanguageContext` can stay for future use but remove the visible toggle since it doesn't do anything.

### C15. Add CSM Release Pattern Chart
In IFRS17Calculator.jsx, add a BarChart showing `results.csmRunoff` data using recharts. See previous review for exact code.

---

## PART D: NEW FEATURES FOR DAILY ACTUARIAL WORK

These are the features that transform this from a "nice demo" into a "tool I use every week."

### D1. Actuarial Glossary / Formelsammlung Page

Create `client/src/app/(public)/methodik/formeln/page.jsx`:
- List all formulas used in the calculators with proper mathematical notation (KaTeX — reinstall if removed)
- Group by: IFRS 17 formulas, Solvency II formulas, Mortality/Survival formulas
- Each formula links to the relevant IFRS 17 paragraph or Delegated Regulation Article
- German + English notation side by side
- This is FREE content that drives SEO traffic for "IFRS 17 Formeln" and "Solvency II Standardformel"

### D2. BaFin QRT Template Reference

Create `client/src/app/(public)/methodik/qrt/page.jsx`:
- List the key Quantitative Reporting Templates relevant to German life insurers
- S.02.01 — Balance Sheet
- S.12.01 — Life Technical Provisions
- S.25.01 — SCR Standard Formula
- S.28.01 — MCR
- For each, explain what data is needed and how ValueAct calculations map to QRT fields
- This is informational content but shows actuaries that the tool understands their reporting workflow

### D3. AI Chat Integration with Calculation Results

**File:** `server/controllers/chatController.js`

**Problem:** The AI chat is completely disconnected from the calculator. An actuary can't ask "Warum ist die Verlustkomponente so hoch?" and get a contextual answer.

**Fix:** Modify the chat to accept an optional `context` parameter with the latest calculation results:

```javascript
async handleChat(req, res) {
  const message = sanitizeInput(req.body.message);
  const context = req.body.context; // Latest calculation results

  let contextPrompt = '';
  if (context) {
    contextPrompt = `\n\nDer Benutzer hat gerade folgende Berechnung durchgeführt:\n${JSON.stringify(context, null, 2)}\n\nBitte beziehe dich in deiner Antwort auf diese Ergebnisse wenn relevant.`;
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    systemInstruction: systemPrompt + contextPrompt
  });
  // ... rest unchanged
}
```

Add a small chat button to the calculator results panel that opens a chat drawer with the current results pre-loaded as context.

---

## EXECUTION ORDER

### Week 1: Actuarial Correctness (MUST DO)
1. A1 — Fix maturity benefit for term life
2. A2 — Add lapse to vectorized premiums
3. A3 — Add inflation to vectorized expenses
4. A7 — Fix audit trail formulas
5. A8 — Fix op risk outside correlation matrix
6. C1-C15 — All bug fixes from Part C

### Week 2: Core Pro Features
7. A4 — Wire proper Risk Adjustment module
8. A5 — Integrate EIOPA yield curve (pro toggle)
9. B1 — CSV portfolio upload
10. B2 — PDF report export
11. B5 — Disclaimer banner
12. B6 — Calculation history

### Week 3: Differentiating Features
13. A6 — CSM roll-forward endpoint + UI
14. B3 — Sensitivity analysis UI
15. B4 — EIOPA yield curve viewer page
16. D1 — Formeln/Glossary page
17. D3 — AI chat with calculation context

### Week 4: Content & Polish
18. D2 — QRT reference page
19. A9 — Mortality rate unit tests
20. A10 — Document lapse multiplier sources

---

## WHAT AN ACTUARY WILL CHECK FIRST

When a qualified actuary evaluates this tool, they will:

1. **Enter a simple term life policy** (€100K, age 35, 20 years, DAV 2008 T) and compare the PV of benefits against their own calculation. If it's wrong (and currently it is because of the maturity benefit bug in A1), they will never come back.

2. **Check if lapse is modeled** — they'll enter a high lapse rate and see if premiums decrease. Currently the vectorized version ignores lapse (A2), so changing the lapse rate has no effect on PV premiums in the portfolio calculation. This is a credibility killer.

3. **Look at the audit trail** — they'll check if the documented formulas match the results. Currently they don't (A7).

4. **Ask about the discount rate** — any German actuary will ask "Welche Zinskurve?" and expect the EIOPA curve, not a flat rate.

5. **Try to export results** — and find they can't.

Fix items A1, A2, A3, and A7 before anything else. They are the difference between "interesting demo" and "tool I might actually use."
