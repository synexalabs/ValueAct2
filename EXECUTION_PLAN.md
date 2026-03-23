# EXECUTION_PLAN.md
# ValueAct Rechner — Full Codebase Analysis Against ValueAct_Rechner.md

Generated: 2026-03-23. Based on reading every file referenced across all 8 phases and appendices.

---

## STATUS OVERVIEW

Most of the plan was executed in a previous session. This document audits exactly what is done, what remains, and what broke.

| Phase | Status | Notes |
|-------|--------|-------|
| 1 — Strip Down | ✅ DONE | All files deleted, routes cleaned |
| 2 — Security | ⚠️ PARTIAL | JWT ✅, AuthContext ✅, chatController ⚠️ (wrong model version) |
| 3 — Actuarial Correctness | ⚠️ PARTIAL | FCF/CSM ✅, DAV tables ✅, MCR ✅, OpRisk ✅, per-policy SCR ❌, legacy functions ❌ |
| 4 — German i18n | ⚠️ PARTIAL | Files created ✅, next-intl not wired into routing ❌ |
| 5 — UI Rebuild | ✅ DONE | All pages and components created |
| 6 — Stripe | ⚠️ PARTIAL | Route created ✅, webhook raw-body ordering BUG ❌ |
| 7 — SEO | ✅ DONE | Metadata, JSON-LD, robots.txt, sitemap all done |
| 8 — Cleanup | ✅ DONE | Client utils trimmed, README updated, env examples created |

---

## PART 1: DEPENDENCY GRAPH

Changes that must happen before others:

```
server/index.js (stripe webhook ordering fix)
  └── MUST precede: any Stripe webhook testing
      Reason: express.json() at line 70 must be preceded by raw body handler for /api/stripe/webhook

actuarial-engine/calculations/solvency.py (per-policy SCR fix, Phase 3.6)
  └── MUST precede: any pro-tier Solvency II UI work
      Reason: policy_results is returned in API response; hardcoded values would mislead the UI

actuarial-engine/calculations/ifrs17.py (legacy wrapper removal, Phase 3.9)
  └── No downstream dependencies — pure deletion, nothing imports these wrappers externally

server/controllers/chatController.js (gemini-2.0-flash upgrade)
  └── Independent — only affects chat feature
```

---

## PART 2: PER-PHASE FILE AUDIT

### PHASE 1 — Strip Down ✅ COMPLETE

All specified deletions are confirmed done. No remaining actions.

---

### PHASE 2 — Fix Critical Security

#### 2.1 JWT secret — server/utils/jwt.js ✅ DONE
- File: [server/utils/jwt.js](server/utils/jwt.js)
- Lines 3-9 have the crash-on-missing-secret logic exactly as specified.

#### 2.2 Remove TEST_MODE — client/src/contexts/AuthContext.jsx ✅ DONE
- No TEST_MODE, no DEMO_USER, no isTestMode anywhere in the file.
- `plan: user?.plan || 'free'` is correctly set (line 164).

#### 2.3 Fix Gemini prompt injection — server/controllers/chatController.js ⚠️ PARTIAL
- File: [server/controllers/chatController.js](server/controllers/chatController.js)
- **DONE**: systemInstruction field correctly used (line 41), user input isolated (line 44).
- **NOT DONE**: Model is still `'gemini-pro'` (line 40). Appendix B says change to `'gemini-2.0-flash'`.
- **Change needed**: Line 40: `model: 'gemini-pro'` → `model: 'gemini-2.0-flash'`
- **Risk**: safe (drop-in model name change, same SDK interface)

#### 2.4 .env.example files ✅ DONE
- `server/.env.example` exists.
- `client/.env.local.example` exists.

---

### PHASE 3 — Fix Actuarial Correctness

#### 3.1 Wire DAV mortality tables as defaults ✅ DONE
- `actuarial-engine/utils/actuarial.py`: VALID_TABLES list updated with all DAV variants (lines 36-40).
- `actuarial-engine/main.py`: `/api/v1/mortality-tables` returns DAV first (lines 182-196).
- `server/services/pythonEngineService.js`: Default changed to `'DAV_2008_T'` (line 104).

#### 3.2 Create unisex blended mortality tables ✅ DONE
- `actuarial-engine/data/dav_mortality_tables.py`:
  - `_create_unisex_table()` defined (line 160).
  - `DAV_2008_T_UNISEX` and `DAV_2004_R_UNISEX` created (lines 181-182).
  - `DAV_MORTALITY_TABLES` updated with unisex aliases as defaults (lines 188-195).

#### 3.3 Fix IFRS 17 CSM sign convention ✅ DONE
- `actuarial-engine/calculations/ifrs17.py`:
  - Line 215: `df['fcf'] = df['pv_benefits'] + df['pv_expenses'] - df['pv_premiums']` ✅
  - Line 256: `df['csm'] = np.maximum(0, -(df['fcf'] + df['risk_adjustment']))` ✅
  - Line 266: `df['loss_component'] = np.maximum(0, df['fcf'] + df['risk_adjustment']))` ✅
- `client/src/utils/ifrs17Calculations.js`: Correct sign convention (lines 8-15) ✅

#### 3.4 Fix MCR calculation ✅ DONE
- `actuarial-engine/calculations/solvency.py`:
  - `calculate_mcr()` at lines 541-562 uses Articles 248-250 formula correctly.
  - Imports `MCR_ABSOLUTE_FLOORS`, `MCR_LINEAR_FACTORS` from `utils.regulatory_constants`.

#### 3.5 Fix operational risk SCR ✅ DONE
- `actuarial-engine/calculations/solvency.py`:
  - `calculate_operational_risk_scr()` at lines 401-417 uses Article 204 formula.

#### 3.6 Remove per-policy SCR placeholders ❌ NOT DONE
- **File**: [actuarial-engine/calculations/solvency.py](actuarial-engine/calculations/solvency.py), lines 87-96
- **Current code** (lines 87-96 in `calculate_portfolio_scr()`):
  ```python
  policy_result = {
      'policy_id': row['policy_id'],
      'scr': float(row['face_amount'] * 0.25),  # Simplified per-policy SCR
      'mcr': float(row['face_amount'] * 0.125),  # Simplified per-policy MCR
      'pv_benefits': float(row['face_amount'] * 0.95),
      'pv_premiums': float(row['premium'])
  }
  ```
- **Required change**: Replace with proportional allocation based on total_scr_adjusted:
  ```python
  total_face = df['face_amount'].sum()
  for _, row in df.iterrows():
      weight = row['face_amount'] / total_face if total_face > 0 else 1/len(df)
      policy_result = {
          'policy_id': row['policy_id'],
          'scr_allocation': float(total_scr_adjusted * weight),
          'weight': float(weight),
          'face_amount': float(row['face_amount']),
          'premium': float(row['premium'])
      }
  ```
- **Risk**: moderate — changes API response shape. The UI must handle the new field names (`scr_allocation`, `weight`) vs old (`scr`, `mcr`).
- **Downstream impact**: `SolvencyCalculator.jsx` uses the pro-API response — check field names before changing.

#### 3.7 Fix Pydantic deprecation ✅ DONE
- `actuarial-engine/main.py`: All `.dict()` replaced with `.model_dump()` (lines 109, 111, 151, 153).

#### 3.8 Fix Python imports — remove sys.path hacks ✅ DONE
- `actuarial-engine/calculations/ifrs17.py`: No sys.path lines. Uses `from utils.audit_logger import ...` etc.
- `actuarial-engine/calculations/solvency.py`: No sys.path lines.
- `actuarial-engine/pyproject.toml`: Created.

#### 3.9 Remove legacy wrapper functions ⚠️ PARTIAL
- **File**: [actuarial-engine/calculations/ifrs17.py](actuarial-engine/calculations/ifrs17.py), lines 598-624
- **Functions still present** (marked "Legacy function" in docstrings):
  - `calculate_pv_benefits` (line 599)
  - `calculate_pv_premiums` (line 604)
  - `calculate_risk_adjustment_by_policy` (line 609)
  - `calculate_expense_loading` (line 613)
  - `calculate_tax_liability` (line 619)
- **All forward to proper functions** — no external imports, safe to delete.
- **Risk**: safe — these are only called by the legacy wrappers themselves or nowhere.
- **solvency.py status**: None of the solvency legacy functions named in the plan exist — they were either already removed or never existed in this version.

#### MINOR: Stale audit log default reference
- **File**: [actuarial-engine/calculations/ifrs17.py](actuarial-engine/calculations/ifrs17.py), line 153
- `audit.add_assumption_used("Mortality Table", assumptions.get('mortality_table', 'CSO_2017'), ...)`
- The `'CSO_2017'` default is only in the audit logging call, not in the actual calculation — the real default comes from the request model. Low priority.
- **Risk**: safe — cosmetic only.

---

### PHASE 4 — German Localization

#### 4.1 next-intl install and configure ⚠️ PARTIAL
- `client/src/i18n/config.ts` ✅ Created with `locales = ['de', 'en']`, `defaultLocale = 'de'`.
- `client/src/i18n/de.json` ✅ Created (full German translations).
- `client/src/i18n/en.json` ✅ Created (English equivalents).
- **NOT DONE**: `next-intl` is in `package.json` (v4.8.3) but has NO `middleware.ts` in `client/src/`.
- **Impact**: Without the middleware, next-intl URL-based locale routing won't work. The current app has no `/de/` or `/en/` URL prefixes and no language toggle functionality.
- **However**: The i18n translation files exist but are NOT consumed by any component — no component calls `useTranslations()` from next-intl. The i18n setup is infrastructure-only at this stage.
- **Decision needed**: Do you want URL-based i18n (`/de/rechner`, `/en/rechner`) or message-only i18n (same URL, content switches)? The plan implies URL-based routing but this hasn't been wired.
- **Risk if left as-is**: next-intl package is installed but unused — no runtime errors, just dead code.

#### 4.2 German number and currency formatting ✅ DONE
- `client/src/utils/formatters.js` uses `DEFAULT_LOCALE = 'de-DE'` and EUR by default.

---

### PHASE 5 — UI Rebuild

#### 5.1 Route structure ✅ DONE
All routes created. Structure matches spec with one important note:

- **Plan says**: `(dashboard)/page.jsx`
- **Actual**: `(dashboard)/dashboard/page.jsx`
- **This is CORRECT**: In Next.js, `(dashboard)` is a route group (no URL segment). `(dashboard)/page.jsx` would create URL `/`, conflicting with the public landing page. `(dashboard)/dashboard/page.jsx` → URL `/dashboard` is correct.
- **Conflict flag**: The plan has an error. The current implementation is the right one.

Additional route not in plan: `(dashboard)/einstellungen/page.jsx` — extra, harmless.

#### 5.2 Landing page ✅ DONE
- `client/src/app/(public)/page.jsx` — German hero, features, CTAs, trust signals.

#### 5.3 IFRS 17 Calculator ✅ DONE
- `client/src/components/calculators/IFRS17Calculator.jsx` — all spec requirements met.
- Client-side `clientSideEstimate()` for free tier, axios call for pro.
- Pro-gated features (Prüfpfad, PDF, sensitivity) shown with Lock icon.

#### 5.4 Solvency II Calculator ✅ DONE
- `client/src/components/calculators/SolvencyCalculator.jsx` — all spec requirements met.
- Asset allocation sliders, color-coded solvency ratio bar, risk module breakdown.

#### 5.5 Mortality Table Browser ✅ DONE
- `client/src/components/calculators/MortalityBrowser.jsx` — free feature, no auth needed.

#### 5.6 Pricing page ✅ DONE
- `client/src/app/(public)/preise/page.jsx`

#### 5.7 Impressum ⚠️ INCOMPLETE — LEGALLY REQUIRED
- File: [client/src/app/(public)/impressum/page.jsx](client/src/app/(public)/impressum/page.jsx)
- Contains placeholder text: `[Straße und Hausnummer]`, `[PLZ] [Ort]`, `[USt-IdNr.]`
- **Per Appendix C, this is legally required by § 5 TMG before launch.**
- The EU dispute resolution link is missing.
- **Action needed**: Fill in real address, phone/email, USt-IdNr. (or note § 19 UStG exemption), add ODR link.
- **Risk**: risky if not filled in — legal liability.

#### 5.8 Datenschutz (GDPR) ✅ STRUCTURALLY DONE
- `client/src/app/(public)/datenschutz/page.jsx` — covers Verantwortlicher, Rechtsgrundlagen, Rechte, Firebase/Stripe mentions.

---

### PHASE 6 — Stripe Integration

#### 6.1 Server-side Stripe setup ⚠️ CRITICAL BUG
- `server/routes/stripe.js` ✅ Created with correct checkout, webhook, subscription endpoints.
- `server/index.js` registers `stripeRoutes` on line 96. ✅
- **CRITICAL BUG**: `express.json()` is applied globally at line 70, BEFORE the stripe route is registered. Stripe webhooks require the raw request body (Buffer) for signature verification. When `express.json()` runs first, it parses the body into a JS object, and the `stripe.webhooks.constructEvent()` call at line 166 in `stripe.js` receives a non-Buffer body and will **always throw "No signatures found matching the expected signature"**.
- **Fix required** (in `server/index.js`, before line 70):
  ```javascript
  // Must be before express.json()
  app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
  ```
- **Risk**: risky — Stripe payments will silently fail (no plan upgrades) without this fix.

#### 6.2 Rate limiting for free tier ✅ DONE
- `server/index.js` lines 82-88: `calculationLimiter` (3/day, skip for pro users).

---

### PHASE 7 — SEO Optimization ✅ COMPLETE

- All page metadata with German `title`, `description`, `openGraph.locale: 'de_DE'`.
- JSON-LD in `client/src/app/layout.jsx` (SoftwareApplication schema).
- `client/public/robots.txt` with correct sitemap URL.
- `client/src/app/sitemap.ts` generates all public routes.

---

### PHASE 8 — Final Cleanup ✅ COMPLETE

- `client/src/utils/ifrs17Calculations.js`: Stripped to 5 functions as specified.
- `client/src/utils/solvencyCalculations.js`: Stripped to 2 functions as specified.
- `server/controllers/chatController.js`: German system prompt, structured input. Model version not updated (see Phase 2.3).
- `client/.env.local.example`: Created.
- `README.md`: Rewritten in German.

---

## PART 3: CONFLICTS AND ISSUES

### C1 — CRITICAL: Stripe Webhook Body Parsing (Phase 6.1)
- **Problem**: `express.json()` at `server/index.js:70` parses all request bodies globally before the Stripe webhook route is reached. Stripe webhook signature verification requires the raw Buffer body.
- **Symptom**: Every Stripe webhook event (subscription activated, cancelled) will fail with "Invalid signature". Users will pay but never get Pro access.
- **Fix location**: `server/index.js`, before line 70.
- **Exact fix**:
  ```javascript
  // Add this BEFORE app.use(express.json(...)):
  app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
  ```

### C2 — Gemini Model Version (Phase 2.3 / Appendix B)
- **Problem**: `chatController.js:40` uses `'gemini-pro'` which is deprecated/older.
- **Plan specifies**: `'gemini-2.0-flash'`
- **Fix**: `server/controllers/chatController.js:40`: `model: 'gemini-pro'` → `model: 'gemini-2.0-flash'`

### C3 — Dashboard Route Path Discrepancy (Phase 5.1)
- **Plan says**: `(dashboard)/page.jsx`
- **Actual**: `(dashboard)/dashboard/page.jsx`
- **Assessment**: The current implementation is CORRECT. The plan has an error — `(dashboard)/page.jsx` would map to URL `/`, conflicting with the public landing page.
- **No fix needed.**

### C4 — next-intl Not Wired (Phase 4.1)
- **Problem**: next-intl is installed but there is no `middleware.ts`, no `[locale]` route segments, and no component uses `useTranslations()`.
- **Impact**: Language toggle in Navbar (mentioned in plan 5.2) doesn't exist. `de.json` and `en.json` are currently dead files.
- **Decision**: Either wire next-intl properly (requires adding middleware.ts and wrapping all routes in `[locale]/`) or use a simpler approach (React context for language).
- **Risk**: moderate architectural change if wired properly — every route path changes.

### C5 — api.js Deleted, Appendix E References It
- **Problem**: `client/src/utils/api.js` was deleted in the cleanup phase. Appendix E says to add stripe and mortality API functions there.
- **Impact**: No runtime error — IFRS17Calculator.jsx and SolvencyCalculator.jsx use `axios` directly. Appendix E is unimplemented but not blocking.
- **Fix if needed**: Create a new `client/src/utils/api.js` with the stripe/mortality functions from Appendix E.

### C6 — Per-policy SCR Response Shape Change Risk (Phase 3.6)
- **Problem**: The plan changes `policy_results` fields from `{scr, mcr, pv_benefits, pv_premiums}` to `{scr_allocation, weight, face_amount, premium}`.
- **Impact**: `SolvencyCalculator.jsx` pro-tier API response handling must be updated alongside the Python change, otherwise the component will break when a pro user triggers the API call.
- **Currently**: SolvencyCalculator.jsx renders `result.policy_results` from API — need to verify field names used.

### C7 — Impressum Placeholder Text (Phase 5.7 / Appendix C)
- **Problem**: Impressum has `[Straße und Hausnummer]`, `[PLZ] [Ort]`, `[USt-IdNr.]` placeholders.
- **Legal requirement**: § 5 TMG requires complete address before the app can be publicly accessible.
- **This is a blocker for launch.**

---

## PART 4: MISSING STEPS

Steps the plan doesn't cover but that would break the app or cause issues:

### M1 — Stripe webhook ordering in server/index.js
Already flagged as C1 above. Not mentioned anywhere in the plan as an explicit step, but the plan's Appendix A code comment says "Register the webhook route BEFORE `express.json()`" — this was not implemented.

### M2 — next-intl middleware.ts
The plan says "Install and configure next-intl" and mentions a language toggle in the Navbar. But it doesn't provide the full next-intl wiring (middleware.ts, [locale] route wrapper, NextIntlClientProvider in layout). Without these, the installed package is inert.

### M3 — SolvencyCalculator.jsx pro response handling
When a Pro user runs the Solvency II calculation via the API, the response structure from the Python engine (`scr_breakdown`, `policy_results`, etc.) needs to be mapped to the UI. The current SolvencyCalculator.jsx pro branch calls `axios.post('/api/calculations/start', ...)` and renders `result.results` but the exact field mapping to the Solvency results UI hasn't been verified end-to-end.

### M4 — IFRS17Calculator.jsx pro response handling
Same issue: the pro path calls `/api/calculations/start` with `calculationType: 'ifrs17'`, and the Python engine returns an `IFRS17Response` object. The calculator needs to map `result.results.aggregate_metrics.total_fcf`, `result.results.aggregate_metrics.risk_adjustment` etc. to the display fields.

### M5 — Stripe CLIENT_URL env var
`server/routes/stripe.js` uses `process.env.CLIENT_URL` in success/cancel URLs, but `CLIENT_URL` is not in `server/.env.example`. It will be `undefined` in development, creating broken redirect URLs after checkout.

### M6 — calculationController uses plan='pro' skip logic but auth doesn't set plan from Firestore
`calculationLimiter` in `server/index.js` has `skip: (req) => req.user?.plan === 'pro'`. But `auth.js` middleware needs to fetch the user's plan from Firestore and attach it to `req.user`. Currently, the JWT only contains `userId` and `email` — plan status comes from Firestore. If `auth.js` doesn't fetch the plan, pro users won't get the rate limit bypass.

---

## PART 5: COMPONENTS IMPORTING DELETED FILES

From the cleanup phase, here are all components that imported deleted files and their current status:

| Deleted File | Previously Imported By | Current Status |
|---|---|---|
| `client/src/utils/api.js` | IFRS17Calculator, SolvencyCalculator | Both now use `axios` directly — ✅ no broken imports |
| `client/src/utils/pdfGenerator.js` | (was in deleted components) | No current component imports it — ✅ safe |
| `client/src/utils/mortalityTables.js` | (was in deleted components) | MortalityBrowser.jsx uses static inline data — ✅ safe |
| `client/src/utils/validation.js` | (was in deleted components) | No current component imports it — ✅ safe |
| `client/src/hooks/useLocalStorage.js` | (was in deleted components) | No current component imports it — ✅ safe |
| `server/models/FormulaVersion.js` | methodologyService.js | ✅ Fixed in this session |
| `server/services/dataService.js` | calculationService.js | ✅ Fixed in this session |

**All currently active components have clean imports.** The server loads successfully (verified by `node -e "require('./index.js')"` — only Firebase credential error from test env vars, no MODULE_NOT_FOUND errors).

---

## PART 6: RISK LEVELS PER REMAINING CHANGE

| Change | File | Risk | Reason |
|--------|------|------|--------|
| Fix webhook raw body ordering | `server/index.js` (add 1 line before line 70) | **safe** | Pure insertion, no existing code changes |
| Upgrade Gemini model name | `server/controllers/chatController.js:40` | **safe** | String change, same SDK API |
| Remove legacy wrapper functions | `actuarial-engine/calculations/ifrs17.py:598-624` | **safe** | Functions delegate to proper functions; no external callers |
| Fix per-policy SCR allocation | `actuarial-engine/calculations/solvency.py:87-96` | **moderate** | Changes response field names `scr`/`mcr` → `scr_allocation`/`weight`; UI must be updated simultaneously |
| Wire next-intl middleware | New `client/src/middleware.ts` + wrap routes in `[locale]/` | **risky** | All route paths change; every Link href must be updated; requires testing |
| Fill Impressum placeholders | `client/src/app/(public)/impressum/page.jsx` | **safe** | Content-only change |
| Add CLIENT_URL to env.example | `server/.env.example` | **safe** | Documentation only |
| Fix rate-limit plan fetch in auth middleware | `server/middleware/auth.js` | **moderate** | Adds a Firestore read per request; affects request latency; must handle errors gracefully |

---

## SUMMARY: WHAT TO EXECUTE NEXT

**Must fix before launch:**
1. `server/index.js` — Stripe webhook raw body fix (C1, M1) — 1 line insertion
2. `server/.env.example` — Add `CLIENT_URL` entry (M5)
3. `client/src/app/(public)/impressum/page.jsx` — Fill in real address (C7) — legal requirement
4. `server/middleware/auth.js` — Verify plan is fetched from Firestore and attached to req.user (M6)

**Should fix before launch:**
5. `server/controllers/chatController.js:40` — Upgrade to `gemini-2.0-flash` (C2)
6. `actuarial-engine/calculations/solvency.py:87-96` — Fix per-policy SCR allocation (Phase 3.6)
7. `actuarial-engine/calculations/ifrs17.py:598-624` — Delete legacy wrappers (Phase 3.9)

**Post-launch or optional:**
8. next-intl full wiring with middleware.ts (C4, M2) — language toggle feature
9. `client/src/utils/api.js` — Create with Appendix E stripe/mortality helpers (C5)
10. Verify pro-tier API response mapping in IFRS17Calculator and SolvencyCalculator (M3, M4)
