# Valuact Code Review Guide for Cursor AI

> Use this guide to instruct Cursor AI to perform comprehensive code reviews after implementing features from the development plan.

---

## Table of Contents

1. [How to Request Code Reviews](#1-how-to-request-code-reviews)
2. [Review Prompts by Category](#2-review-prompts-by-category)
3. [Actuarial-Specific Review Checklist](#3-actuarial-specific-review-checklist)
4. [Suggested New Features](#4-suggested-new-features)
5. [Post-Review Actions](#5-post-review-actions)

---

## 1. How to Request Code Reviews

### Full Codebase Review

Copy and paste this prompt to Cursor AI after completing a phase:

```
Perform a comprehensive code review of the Valuact codebase. Analyze:

1. **Code Quality**
   - Check for code duplication across files
   - Identify functions that are too long (>50 lines)
   - Find unused imports and dead code
   - Check naming conventions consistency
   - Identify missing error handling

2. **Architecture**
   - Verify separation of concerns between layers
   - Check for circular dependencies
   - Ensure proper abstraction levels
   - Validate API contract consistency

3. **Security**
   - Check for SQL/NoSQL injection vulnerabilities
   - Verify input validation on all endpoints
   - Check for exposed secrets or API keys
   - Validate authentication/authorization flows
   - Check for XSS vulnerabilities in React components

4. **Performance**
   - Identify N+1 query patterns
   - Check for missing database indexes
   - Find synchronous operations that should be async
   - Identify memory leaks in React components
   - Check for unnecessary re-renders

5. **Actuarial Accuracy**
   - Verify CSM formula implementation against IFRS 17.44
   - Check SCR calculations against Solvency II Delegated Regulation
   - Validate mortality table interpolation
   - Ensure discount curve application is correct
   - Verify audit trail captures all calculation steps

6. **Testing**
   - Identify untested code paths
   - Check test coverage for edge cases
   - Verify mocks are realistic
   - Ensure actuarial calculations have validation tests

Provide a detailed report with:
- Critical issues (must fix)
- Warnings (should fix)
- Suggestions (nice to have)
- Code snippets showing problems and fixes
```

### Component-Specific Review

```
Review the [COMPONENT_NAME] component/module:

Files to review:
- [FILE_PATH_1]
- [FILE_PATH_2]

Focus on:
1. Does it follow the established patterns in the codebase?
2. Is error handling comprehensive?
3. Are there any edge cases not covered?
4. Is the code well-documented?
5. Are there any performance concerns?
6. For calculations: verify mathematical accuracy

Provide specific code improvements with before/after examples.
```

### Pre-Commit Review

```
Review the following changes before commit:

[PASTE GIT DIFF OR DESCRIBE CHANGES]

Check for:
1. Breaking changes to existing APIs
2. Missing tests for new functionality
3. Proper error messages
4. Console.log statements that should be removed
5. Hardcoded values that should be configurable
6. Accessibility issues in UI changes
```

---

## 2. Review Prompts by Category

### Python Actuarial Engine Review

```
Review the actuarial-engine Python code focusing on:

1. **Calculation Accuracy**
   - Verify all formulas match IFRS 17 / Solvency II specifications
   - Check vectorized operations are mathematically equivalent to loops
   - Validate edge cases (zero values, negative values, empty portfolios)
   - Ensure proper handling of date/time calculations

2. **Performance**
   - Check NumPy/Pandas usage is optimal
   - Identify opportunities for parallel processing
   - Verify caching is used appropriately
   - Check for memory-efficient data structures

3. **Type Safety**
   - Verify Pydantic models have proper validation
   - Check all function signatures have type hints
   - Ensure return types are consistent

4. **Audit Trail**
   - Verify all calculation steps are logged
   - Check formula versions are tracked
   - Ensure inputs and outputs are captured

Files to review:
- actuarial-engine/calculations/ifrs17.py
- actuarial-engine/calculations/solvency.py
- actuarial-engine/utils/actuarial.py
- actuarial-engine/utils/validation.py
```

### React/Next.js Frontend Review

```
Review the client-side React/Next.js code focusing on:

1. **React Best Practices**
   - Check for proper use of hooks (no rules violations)
   - Verify useEffect dependencies are correct
   - Ensure proper cleanup in useEffect
   - Check for unnecessary re-renders (missing useMemo/useCallback)

2. **State Management**
   - Verify state is lifted appropriately
   - Check for prop drilling that should use context
   - Ensure form state is handled correctly

3. **Accessibility**
   - Check for proper ARIA labels
   - Verify keyboard navigation works
   - Ensure color contrast is sufficient
   - Check form labels are associated correctly

4. **Error Handling**
   - Verify error boundaries are in place
   - Check API error handling and user feedback
   - Ensure loading states are shown appropriately

5. **Calculator Components**
   - Verify input validation matches backend expectations
   - Check calculation results are formatted correctly
   - Ensure LaTeX formulas render properly
   - Verify export functionality works

Files to review:
- client/src/components/calculators/*.jsx
- client/src/hooks/*.js
- client/src/lib/api.js
- client/src/app/**/page.jsx
```

### Node.js Backend Review

```
Review the server-side Node.js/Express code focusing on:

1. **API Design**
   - Check REST conventions are followed
   - Verify response formats are consistent
   - Ensure proper HTTP status codes
   - Check pagination is implemented correctly

2. **Security**
   - Verify JWT validation on protected routes
   - Check rate limiting is appropriate
   - Ensure CORS is configured correctly
   - Verify input sanitization

3. **Error Handling**
   - Check error middleware catches all errors
   - Verify error responses don't leak sensitive info
   - Ensure proper logging of errors

4. **Database Operations**
   - Verify Firestore queries are efficient
   - Check for proper transaction usage
   - Ensure data validation before writes

5. **Integration with Python Engine**
   - Verify circuit breaker is working
   - Check timeout handling
   - Ensure proper error propagation

Files to review:
- server/index.js
- server/routes/*.js
- server/controllers/*.js
- server/services/*.js
- server/middleware/*.js
```

---

## 3. Actuarial-Specific Review Checklist

Use this checklist to verify actuarial calculations are correct:

### IFRS 17 Calculations

```
Review IFRS 17 implementation against the following requirements:

□ CSM Calculation (IFRS 17.38-46)
  - CSM = max(0, -FCF) for profitable contracts
  - CSM cannot be negative (loss component instead)
  - CSM is measured at initial recognition

□ Fulfilment Cash Flows (IFRS 17.33-37)
  - Present value of future cash flows
  - Risk adjustment for non-financial risk
  - Uses current assumptions at each reporting date

□ Risk Adjustment (IFRS 17.37)
  - Reflects compensation for bearing uncertainty
  - Must disclose confidence level equivalent
  - Consistent methodology across portfolios

□ CSM Amortization (IFRS 17.44)
  - Released based on coverage units
  - Coverage units reflect quantity of benefits
  - Pattern should be systematic

□ Loss Component (IFRS 17.47-52)
  - Created when contract becomes onerous
  - Tracked separately from CSM
  - Reversed if contract becomes profitable

□ Measurement Models
  - GMM: General Measurement Model (default)
  - PAA: Premium Allocation Approach (simplified)
  - VFA: Variable Fee Approach (participating)

□ Discount Rates (IFRS 17.36)
  - Bottom-up: Risk-free + illiquidity premium
  - Top-down: Asset returns - credit risk
  - Locked-in for CSM, current for liability

Verify calculations against IFRS 17 TRG examples where applicable.
```

### Solvency II Calculations

```
Review Solvency II SCR implementation against Delegated Regulation (EU) 2015/35:

□ Market Risk (Art. 164-188)
  - Interest rate risk: up and down scenarios
  - Equity risk: Type 1 (39%), Type 2 (49%)
  - Property risk: 25% shock
  - Spread risk: by rating and duration
  - Currency risk: 25% shock
  - Concentration risk: threshold-based

□ Life Underwriting Risk (Art. 136-143)
  - Mortality risk: 15% increase
  - Longevity risk: 20% decrease
  - Disability risk: increase in rates
  - Lapse risk: 50% up/down/mass
  - Expense risk: 10% + 1% inflation
  - Revision risk: 3% annuity increase
  - Catastrophe risk: 0.15% mortality spike

□ Counterparty Default Risk (Art. 189-202)
  - Type 1: Rated exposures (reinsurance, derivatives)
  - Type 2: Unrated exposures (receivables)
  - LGD calculation

□ Operational Risk (Art. 204)
  - 3% of earned premiums, or
  - 0.45% of technical provisions
  - Cap at 30% of BSCR

□ Correlation Matrices
  - Verify matrices match Art. 136, 164
  - Check aggregation formula is correct

□ MCR Calculation (Art. 248-253)
  - Between 25% and 45% of SCR
  - Absolute floor: EUR 3.7M (life)

□ Own Funds (Art. 69-92)
  - Tier 1, Tier 2, Tier 3 classification
  - Eligibility limits
```

---

## 4. Suggested New Features

### High-Value Features (Recommended)

#### 4.1 Portfolio Comparison Tool

```
Feature: Compare two portfolios or two calculation runs side-by-side

Value: Actuaries frequently need to understand what changed between runs

Implementation:
- Add /comparisons route
- Create ComparisonView component
- Show delta for each metric with drill-down
- Highlight assumption changes that drove differences

Prompt for Cursor:
"Create a portfolio comparison feature that allows users to select two
calculations and view a side-by-side comparison of all metrics. Include:
- Waterfall chart showing drivers of change
- Table with metric deltas
- Assumption diff viewer
- Export comparison to PDF"
```

#### 4.2 Assumption Library

```
Feature: Centralized assumption set management

Value: Ensures consistency across calculations, enables scenario analysis

Implementation:
- Create assumptions table in Firestore
- Add assumption versioning
- Build UI for creating/editing assumption sets
- Allow selecting assumption sets in calculators

Prompt for Cursor:
"Implement an assumption library feature where users can:
- Create named assumption sets (e.g., 'Base 2024', 'Adverse Scenario')
- Version assumption sets with change tracking
- Lock assumption sets for audit purposes
- Select from library when running calculations
- Compare assumption sets side-by-side"
```

#### 4.3 Automated Reconciliation

```
Feature: Reconcile Valuact results against external systems

Value: Critical for audit and validation

Implementation:
- Import results from Excel/CSV
- Match policies between systems
- Calculate and display differences
- Generate reconciliation report

Prompt for Cursor:
"Build a reconciliation module that allows users to:
- Upload results from external systems (Prophet, AXIS, Excel)
- Map fields between systems
- Run automated comparison
- Flag material differences (>1% threshold)
- Generate reconciliation report with explanations"
```

#### 4.4 What-If Scenario Builder

```
Feature: Interactive scenario builder with real-time results

Value: Enables quick exploration of assumption impacts

Implementation:
- Slider-based assumption adjustment
- Real-time recalculation (debounced)
- Visual feedback on metric changes
- Save scenarios for later

Prompt for Cursor:
"Create an interactive What-If scenario builder with:
- Sliders for key assumptions (discount rate, lapse, mortality)
- Real-time chart updates showing CSM/SCR impact
- Ability to save and name scenarios
- Compare up to 4 scenarios simultaneously
- Mini calculation using simplified model for speed"
```

#### 4.5 Regulatory Deadline Tracker

```
Feature: Track reporting deadlines and calculation status

Value: Ensures timely regulatory submissions

Implementation:
- Calendar view of deadlines
- Status tracking per report
- Notifications before due dates
- Checklist for each submission

Prompt for Cursor:
"Implement a regulatory deadline tracker dashboard showing:
- Calendar with QRT/ORSA submission dates
- Status of each report (not started, in progress, ready, submitted)
- Countdown to next deadline
- Checklist of required calculations per report
- Email notifications 7 days and 1 day before deadlines"
```

### Medium-Value Features

#### 4.6 Batch Upload & Processing

```
Feature: Upload multiple portfolios for batch processing

Value: Efficiency for multi-entity groups

Prompt for Cursor:
"Add batch processing capability:
- Upload multiple CSV files at once
- Queue calculations for each portfolio
- Show progress for all calculations
- Download all results as ZIP
- Error handling per portfolio without failing batch"
```

#### 4.7 Calculation Templates

```
Feature: Save calculation configurations as templates

Value: Reduces setup time for recurring calculations

Prompt for Cursor:
"Implement calculation templates:
- Save current calculator settings as named template
- Load template to pre-fill all fields
- Share templates across team
- Template versioning
- Default templates for common scenarios"
```

#### 4.8 Advanced Visualization Dashboard

```
Feature: Interactive dashboards with drill-down

Value: Executive-level insights

Prompt for Cursor:
"Create an advanced analytics dashboard with:
- CSM waterfall by cohort
- SCR treemap by risk type
- Time series of key metrics
- Geographic breakdown (if applicable)
- Click-to-drill-down on any chart
- Export dashboard as PDF/PowerPoint"
```

#### 4.9 Peer Review Workflow

```
Feature: Built-in review and approval workflow

Value: Ensures four-eyes principle for calculations

Prompt for Cursor:
"Implement a peer review workflow:
- Submit calculation for review
- Reviewer can approve, reject, or request changes
- Comments on specific results
- Audit trail of review actions
- Lock results after approval
- Integration with assumption changes"
```

#### 4.10 Natural Language Query

```
Feature: Ask questions about results in plain English

Value: Makes platform accessible to non-actuaries

Prompt for Cursor:
"Extend AxiomAI to answer questions about calculation results:
- 'What is the CSM for cohort 2022?'
- 'Why did SCR increase this quarter?'
- 'Which policies have loss components?'
- 'Show me the top 10 policies by face amount'
Use the calculation results as context for Gemini AI"
```

### Lower-Priority Features

#### 4.11 Mobile Companion App

```
Feature: View key metrics on mobile

Prompt: "Design a mobile-responsive dashboard for viewing:
- Key KPIs (CSM, SCR, Solvency Ratio)
- Alerts for threshold breaches
- Calculation status notifications
- Quick approval actions"
```

#### 4.12 API Playground

```
Feature: Interactive API documentation

Prompt: "Create an API playground page where users can:
- Try API endpoints with sample data
- See request/response examples
- Generate code snippets (Python, JavaScript, curl)
- Test with their own API key"
```

#### 4.13 Audit Report Generator

```
Feature: Generate comprehensive audit packages

Prompt: "Build an audit report generator that creates:
- Executive summary PDF
- Detailed calculation methodology
- Full audit trail export
- Assumption documentation
- Reconciliation to prior period
- All in one downloadable package"
```

#### 4.14 Multi-Currency Support

```
Feature: Handle portfolios in multiple currencies

Prompt: "Add multi-currency support:
- Specify policy currency
- Apply FX rates from ECB or custom source
- Calculate in reporting currency
- Show currency risk in SCR
- Historical FX rate lookup"
```

#### 4.15 Integration Connectors

```
Feature: Connect to external data sources

Prompt: "Create integration connectors for:
- Policy admin systems (generic CSV/API)
- Asset management platforms
- Reinsurance systems
- General ledger (for P&L posting)
Include field mapping UI and scheduled sync"
```

---

## 5. Post-Review Actions

### After Receiving Review Results

1. **Prioritize Issues**
   ```
   Ask Cursor: "Prioritize these issues by:
   1. Security vulnerabilities (fix immediately)
   2. Calculation accuracy issues (fix before production)
   3. Performance problems (fix if impacting users)
   4. Code quality (fix in next sprint)
   5. Nice-to-haves (add to backlog)"
   ```

2. **Generate Fix Plan**
   ```
   Ask Cursor: "For each critical and high-priority issue, provide:
   - The specific file and line number
   - The current problematic code
   - The corrected code
   - A test to verify the fix"
   ```

3. **Verify Fixes**
   ```
   Ask Cursor: "Review the fixes I've implemented for:
   [LIST OF ISSUES]

   Verify each fix:
   1. Correctly addresses the issue
   2. Doesn't introduce new problems
   3. Has appropriate test coverage"
   ```

4. **Documentation Update**
   ```
   Ask Cursor: "Based on the changes made, update:
   - README.md if setup changed
   - API documentation if endpoints changed
   - CHANGELOG.md with summary of fixes
   - Architecture docs if structure changed"
   ```

### Continuous Review Process

Set up regular reviews:

```
Weekly: "Review all changes from the past week focusing on:
- New code quality
- Test coverage for new features
- Security implications of changes"

Monthly: "Perform full codebase review focusing on:
- Technical debt accumulation
- Deprecated dependencies
- Performance regression
- Documentation freshness"

Quarterly: "Strategic review focusing on:
- Architecture evolution
- Scalability concerns
- Security audit
- Dependency updates needed"
```

---

## Quick Reference Card

### Essential Review Commands

| Purpose | Prompt Start |
|---------|--------------|
| Full review | "Perform a comprehensive code review of..." |
| Security focus | "Audit the security of..." |
| Performance focus | "Analyze performance of..." |
| Actuarial accuracy | "Verify calculation accuracy of..." |
| Pre-commit | "Review these changes before I commit..." |
| Bug investigation | "Investigate the root cause of..." |
| Refactoring | "Suggest refactoring opportunities in..." |

### Review Severity Levels

| Level | Action | Timeline |
|-------|--------|----------|
| 🔴 Critical | Must fix | Immediate |
| 🟠 High | Should fix | This sprint |
| 🟡 Medium | Plan to fix | Next sprint |
| 🟢 Low | Nice to have | Backlog |
| ⚪ Info | FYI | No action |

---

*Use this guide to maintain high code quality throughout Valuact development.*
