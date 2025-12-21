# Valuact Strategic Development Roadmap

> **Vision:** Build the most transparent, accurate, and user-friendly actuarial platform for life insurers
>
> **Mission:** Democratize actuarial science through modern technology while maintaining regulatory compliance and calculation integrity
>
> **Competitive Benchmark:** Willis Towers Watson, Moody's Analytics, Milliman, FIS
>
> **Last Updated:** December 2024 (Post-Codebase Audit)

---

## Table of Contents

1. [Current Implementation Status](#1-current-implementation-status)
2. [Executive Summary](#2-executive-summary)
3. [Competitive Landscape Analysis](#3-competitive-landscape-analysis)
4. [Product Vision & Differentiators](#4-product-vision--differentiators)
5. [Architecture Evolution](#5-architecture-evolution)
6. [Phase 1: Foundation - CURRENT](#6-phase-1-foundation-current)
7. [Phase 2: Core Platform](#7-phase-2-core-platform)
8. [Phase 3: Advanced Analytics](#8-phase-3-advanced-analytics)
9. [Phase 4: Enterprise Scale](#9-phase-4-enterprise-scale)
10. [Phase 5: Market Leader (Year 2)](#10-phase-5-market-leader-year-2)
11. [New Feature Recommendations](#11-new-feature-recommendations)
12. [Technical Excellence Standards](#12-technical-excellence-standards)
13. [Quality Assurance Framework](#13-quality-assurance-framework)
14. [Security & Compliance](#14-security--compliance)
15. [Performance Benchmarks](#15-performance-benchmarks)

---

## 1. Current Implementation Status

> **Audit Date:** December 2024

### ✅ COMPLETED (Production Ready)

| Component | Files | Status |
|-----------|-------|--------|
| **Python IFRS 17 Calculations** | `actuarial-engine/calculations/ifrs17.py` (781 lines) | Complete with audit trail |
| **Python Solvency II SCR** | `actuarial-engine/calculations/solvency.py` (684 lines) | All 8 risk modules |
| **Mortality Tables** | `actuarial-engine/data/mortality_tables.py` | CSO 2017, 2001, GAM 1994 |
| **Pydantic Validation** | `actuarial-engine/models/*.py` | Request/response models |
| **IFRS 17 Calculator UI** | `client/src/components/calculators/IFRS17Calculator.jsx` | Full CSM, RA, LC |
| **Solvency Calculator UI** | `client/src/components/calculators/SolvencyCalculator.jsx` | SCR components |
| **Mortality Calculator UI** | `client/src/components/calculators/MortalityCalculator.jsx` | Tables, survival |
| **Pricing Calculator UI** | `client/src/components/calculators/PricingCalculator.jsx` | Premium, profit |
| **Data Upload Pipeline** | `client/src/components/DataManagement/*.jsx` | Upload, validate, preview |
| **Firebase Authentication** | `server/routes/auth.js` | JWT + Firebase |
| **Gemini AI Chat** | `server/index.js` | AxiomAI persona |
| **Audit Trail Viewer** | `client/src/components/AuditTrailViewer.jsx` | Step-by-step |
| **Formula Explainer** | `client/src/components/FormulaExplainer.jsx` | LaTeX rendering |
| **Cloud Run Config** | `actuarial-engine/cloud-run.yaml` | GCP deployment |

### ⚠️ PARTIALLY IMPLEMENTED

| Component | Current State | Gap |
|-----------|--------------|-----|
| Backend → Python Integration | Inline in `calculationService.js` | Need dedicated service with circuit breaker |
| Data Management Calculations | Simulated with 5-sec timeout | Need real engine connection |
| Calculation Controller | Basic structure works | Missing async job support |
| API Client | Scattered fetch/axios calls | Need centralized `api.js` |

### ❌ NOT YET IMPLEMENTED

| Component | Priority | Est. Effort |
|-----------|----------|-------------|
| `pythonEngineService.js` | P0 | 2 hours |
| `client/src/lib/api.js` | P0 | 2 hours |
| `useCalculation` hook | P0 | 1 hour |
| Health check routes | P1 | 1 hour |
| WebSocket real-time | P1 | 4 hours |
| Sensitivity Analysis component | P1 | 3 hours |
| Stress Test Panel | P2 | 4 hours |
| Docker Compose | P2 | 2 hours |
| Redis caching | P2 | 4 hours |
| JavaScript tests | P1 | 8 hours |

### Gap Analysis Summary

```
┌────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION STATUS                        │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Python Engine         ████████████████████████████████  100%   │
│  UI Components         ████████████████████████████████  100%   │
│  Authentication        ████████████████████████████████  100%   │
│  Backend Integration   ████████████░░░░░░░░░░░░░░░░░░░░   40%   │
│  Client API Layer      ██████░░░░░░░░░░░░░░░░░░░░░░░░░░   20%   │
│  Real-time Features    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░    0%   │
│  Testing               ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░   15%   │
│  Infrastructure        ████████░░░░░░░░░░░░░░░░░░░░░░░░   25%   │
│                                                                  │
│  OVERALL PROGRESS      ████████████████░░░░░░░░░░░░░░░░   55%   │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 2. Executive Summary

### Current State

Valuact is an actuarial solutions platform with:
- **IFRS 17** CSM calculations (GMM, PAA, VFA) - FULLY IMPLEMENTED
- **Solvency II** SCR Standard Formula - FULLY IMPLEMENTED
- Modern tech stack (Python FastAPI + Next.js 16 + Node.js)
- AI co-pilot (Gemini AI integration) - WORKING
- Audit trail and transparency features - COMPLETE
- **Critical Gap:** Frontend calculators run client-side only, not connected to Python engine

### Immediate Priority

The Python actuarial engine is complete and production-ready. The critical gap is connecting the Node.js backend to the Python engine so that:
1. Calculator UIs can run server-side calculations
2. Data Management can run real valuations (not simulated)
3. Large portfolios can be processed efficiently

### Strategic Gap

To compete with enterprise actuarial solutions (Willis Towers Watson's RiskAgility, Moody's AXIS, Milliman MG-ALFA), Valuact needs:

| Capability | Current | Required | Priority |
|------------|---------|----------|----------|
| Backend Integration | Partial | Full | P0 NOW |
| Portfolio Size | 1,000 policies | 10M+ policies | P1 |
| Calculation Speed | Minutes | Seconds (with caching) | P2 |
| Stochastic Modeling | None | Full Monte Carlo ESG | P2 |
| Internal Models | None | Full Solvency II IM support | P3 |
| ALM Integration | None | Complete asset-liability matching | P3 |
| Reporting | Basic | Full QRT/ORD automation | P2 |
| Multi-jurisdiction | None | EU, UK, APAC, Americas | P3 |

### Value Proposition

**"The actuarial platform that actuaries actually want to use"**

1. **Transparency First** - Every calculation is explainable with full audit trail
2. **Modern UX** - Web-based, real-time, collaborative
3. **AI-Augmented** - Gemini AI helps interpret results and regulations
4. **Open Architecture** - API-first, integrates with existing systems
5. **Cost Effective** - SaaS model, pay per use, no legacy licensing

---

## 3. Competitive Landscape Analysis

### Enterprise Competitors

| Vendor | Product | Strengths | Weaknesses |
|--------|---------|-----------|------------|
| **Willis Towers Watson** | RiskAgility FM | Full IFRS 17, market leader | Expensive, complex, slow |
| **Moody's Analytics** | AXIS | Comprehensive, global | Legacy architecture |
| **Milliman** | MG-ALFA | Strong ALM, stochastic | Steep learning curve |
| **FIS** | Prophet | Scalable, flexible | Implementation heavy |
| **RNA Analytics** | RNA | Modern, cloud-native | Limited market presence |

### Valuact Competitive Strategy

```
┌────────────────────────────────────────────────────────────────┐
│                    VALUACT POSITIONING                          │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HIGH COMPLEXITY                                                 │
│       ▲                                                          │
│       │    ┌─────────────┐                                       │
│       │    │   Prophet   │                                       │
│       │    │   AXIS      │                                       │
│       │    │   MG-ALFA   │                                       │
│       │    └─────────────┘                                       │
│       │                        ┌─────────────────┐               │
│       │                        │    VALUACT      │               │
│       │                        │   (Target)      │               │
│       │                        └─────────────────┘               │
│       │                                                          │
│       │    ┌─────────────┐                                       │
│       │    │   RNA       │                                       │
│       │    │   (Current) │                                       │
│       │    └─────────────┘                                       │
│       │                                                          │
│  LOW COMPLEXITY                                                  │
│       └──────────────────────────────────────────────────► UX   │
│              COMPLEX                              SIMPLE          │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

**Strategy:** Deliver enterprise-grade capability with startup-grade user experience.

---

## 4. Product Vision & Differentiators

### Core Differentiators

#### 3.1 Radical Transparency

Every calculation in Valuact is fully explainable:

```
┌─────────────────────────────────────────────────────────────────┐
│  CSM Calculation for Policy P-12345                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Step 1: Present Value of Future Premiums                        │
│  ─────────────────────────────────────────                        │
│  Formula: PV = Σ (Premium_t × v^t × p_x^t × (1-lapse_t))         │
│                                                                   │
│  Inputs:                                                          │
│    • Annual Premium: $5,000                                       │
│    • Discount Rate: 3.5% (EIOPA RFR + illiquidity premium)       │
│    • Mortality: CSO 2017, Male, Age 45                           │
│    • Lapse Rate: 5% (company experience + industry benchmark)    │
│                                                                   │
│  Calculation:                                                     │
│    Year 1: $5,000 × 0.9662 × 0.9987 × 0.95 = $4,590.23          │
│    Year 2: $5,000 × 0.9335 × 0.9974 × 0.9025 = $4,212.15        │
│    ...                                                            │
│    Total PV: $42,156.78                                          │
│                                                                   │
│  [View Mortality Table] [View Discount Curve] [Export to Excel]  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.2 AI-Augmented Actuary (AxiomAI)

Not just a chatbot - a genuine actuarial assistant:

- **Regulation Interpreter:** "What does IFRS 17.B65(h) mean for my VFA portfolio?"
- **Result Explainer:** "Why did my CSM increase 15% this quarter?"
- **Assumption Validator:** "Are my mortality assumptions reasonable for this product?"
- **Anomaly Detector:** "Policy P-789 has unusual cash flow patterns"

#### 3.3 Real-Time Collaboration

```
┌─────────────────────────────────────────────────────────────────┐
│  Portfolio: European Life Book                                   │
│  Status: Calculating (Policy 45,230 of 125,000)                 │
│  ██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░ 36%                   │
│                                                                   │
│  Active Users:                                                    │
│  👤 Sarah Chen (reviewing assumptions)                           │
│  👤 Marcus Weber (waiting for results)                           │
│  👤 Priya Sharma (editing discount curve)                        │
│                                                                   │
│  [Live Feed]                                                      │
│  14:32:15 - Sarah updated lapse assumptions (+2%)                │
│  14:31:45 - Calculation restarted with new assumptions           │
│  14:30:22 - Marcus added comment on Cohort 2021                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

#### 3.4 Open API Architecture

```yaml
# Every calculation is API-accessible
POST /api/v1/calculate/ifrs17
Authorization: Bearer {token}
Content-Type: application/json

{
  "portfolio_id": "eu-life-2024",
  "calculation_type": "gmm",
  "as_of_date": "2024-12-31",
  "assumptions": {
    "discount_curve": "eiopa-rfr-eur-2024q4",
    "mortality_table": "cso-2017-male",
    "lapse_scenario": "base"
  },
  "options": {
    "sensitivity_analysis": true,
    "cohort_breakdown": true,
    "policy_level_results": false
  }
}
```

---

## 5. Architecture Evolution

### Current Architecture (v1)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js    │────▶│   Express    │────▶│   FastAPI    │
│   Frontend   │     │   Backend    │     │   Engine     │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Firestore   │
                     └──────────────┘
```

### Target Architecture (v2)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LOAD BALANCER (Cloud Load Balancing)         │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js SSR   │    │   Next.js SSR   │    │   Next.js SSR   │
│   (Vercel Edge) │    │   (Vercel Edge) │    │   (Vercel Edge) │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         └──────────────────────┼──────────────────────┘
                                │
                                ▼
         ┌──────────────────────────────────────────────┐
         │              API GATEWAY (Kong)               │
         │   • Rate Limiting  • Auth  • Routing         │
         └────────────────────────┬─────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Express API    │    │  Calculation    │    │  Reporting      │
│  (Node.js K8s)  │    │  Orchestrator   │    │  Service        │
│  • Auth         │    │  (Go)           │    │  (Python)       │
│  • CRUD         │    │  • Job Queue    │    │  • QRT          │
│  • Chat         │    │  • Status       │    │  • ORSA         │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         │           ┌──────────┴──────────┐           │
         │           │                     │           │
         │           ▼                     ▼           │
         │  ┌─────────────────┐ ┌─────────────────┐   │
         │  │  Calc Worker 1  │ │  Calc Worker N  │   │
         │  │  (Python K8s)   │ │  (Python K8s)   │   │
         │  │  • IFRS 17      │ │  • IFRS 17      │   │
         │  │  • Solvency II  │ │  • Solvency II  │   │
         │  │  • ALM          │ │  • ALM          │   │
         │  └────────┬────────┘ └────────┬────────┘   │
         │           │                   │             │
         │           └─────────┬─────────┘             │
         │                     │                       │
         ▼                     ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                               │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   Firestore     │   Redis Cluster │   BigQuery                  │
│   (Metadata)    │   (Cache/Queue) │   (Analytics)               │
│                 │                 │                             │
│   • Users       │   • Results     │   • Calculation History     │
│   • Portfolios  │   • Sessions    │   • Audit Logs              │
│   • Assumptions │   • Job Status  │   • Performance Metrics     │
└─────────────────┴─────────────────┴─────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    OBJECT STORAGE (GCS)                          │
│   • Portfolio Files  • Results  • Reports  • Mortality Tables   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Kubernetes for Workers** | Auto-scale based on calculation queue depth |
| **Go for Orchestrator** | High concurrency, low latency job management |
| **BigQuery for Analytics** | Scalable time-series analysis of calculations |
| **Redis Cluster** | Fast cache access, job queue, pub/sub for real-time |
| **Kong API Gateway** | Enterprise-grade rate limiting, auth, observability |

---

## 6. Phase 1: Foundation - CURRENT PRIORITY

### Objective
Complete the integration between all system components and establish production-ready infrastructure.

### 5.1 Critical Path: Backend-Engine Integration

**Priority:** P0 - Blocking

#### Task 1.1.1: Create Python Engine Service

**File:** `server/services/pythonEngineService.js`

```javascript
/**
 * Python Engine Service
 * Handles communication with the FastAPI actuarial engine
 *
 * @module services/pythonEngineService
 */

const axios = require('axios');
const { createLogger } = require('../utils/logger');
const { CircuitBreaker } = require('../utils/circuitBreaker');

const logger = createLogger('PythonEngineService');

class PythonEngineService {
  constructor() {
    this.baseURL = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';
    this.timeout = parseInt(process.env.CALCULATION_TIMEOUT) || 300000; // 5 min default

    // Circuit breaker for resilience
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 30000,
    });

    // Axios instance with defaults
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Source': 'valuact-backend',
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use((config) => {
      config.metadata = { startTime: Date.now() };
      logger.info(`Engine request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Response interceptor for timing
    this.client.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata.startTime;
        logger.info(`Engine response: ${response.status} (${duration}ms)`);
        return response;
      },
      (error) => {
        const duration = Date.now() - error.config?.metadata?.startTime;
        logger.error(`Engine error: ${error.message} (${duration}ms)`);
        throw error;
      }
    );
  }

  /**
   * Calculate IFRS 17 metrics for a portfolio
   * @param {Array} policies - Array of policy objects
   * @param {Object} assumptions - IFRS 17 assumptions
   * @param {Object} options - Calculation options
   * @returns {Promise<Object>} Calculation results with audit trail
   */
  async calculateIFRS17(policies, assumptions, options = {}) {
    return this.circuitBreaker.execute(async () => {
      const response = await this.client.post('/api/v1/calculate/ifrs17', {
        policies,
        assumptions: {
          discount_rate: assumptions.discountRate || 0.035,
          lapse_rate: assumptions.lapseRate || 0.05,
          mortality_table: assumptions.mortalityTable || 'CSO_2017',
          expense_inflation: assumptions.expenseInflation || 0.02,
          risk_adjustment_factor: assumptions.riskAdjustmentFactor || 0.06,
          expense_loading: assumptions.expenseLoading || 0.05,
          tax_rate: assumptions.taxRate || 0.21,
        },
        metadata: {
          calculation_date: new Date().toISOString(),
          ...options,
        },
      });

      return response.data;
    });
  }

  /**
   * Calculate Solvency II SCR for a portfolio
   * @param {Array} policies - Array of policy objects
   * @param {Object} assumptions - Solvency II assumptions
   * @param {Object} options - Calculation options
   * @returns {Promise<Object>} SCR results with component breakdown
   */
  async calculateSolvency(policies, assumptions, options = {}) {
    return this.circuitBreaker.execute(async () => {
      const response = await this.client.post('/api/v1/calculate/solvency', {
        policies,
        assumptions: {
          confidence_level: assumptions.confidenceLevel || 0.995,
          time_horizon: assumptions.timeHorizon || 1,
          market_risk_factor: assumptions.marketRiskFactor || 0.15,
          credit_risk_factor: assumptions.creditRiskFactor || 0.10,
          underwriting_risk_factor: assumptions.underwritingRiskFactor || 0.12,
          operational_risk_factor: assumptions.operationalRiskFactor || 0.03,
        },
        metadata: {
          calculation_date: new Date().toISOString(),
          ...options,
        },
      });

      return response.data;
    });
  }

  /**
   * Run sensitivity analysis
   * @param {string} calculationType - 'ifrs17' or 'solvency'
   * @param {Array} policies - Portfolio
   * @param {Object} baseAssumptions - Base assumptions
   * @param {Array} scenarios - Sensitivity scenarios
   * @returns {Promise<Object>} Sensitivity results
   */
  async runSensitivityAnalysis(calculationType, policies, baseAssumptions, scenarios) {
    const results = await Promise.all(
      scenarios.map(async (scenario) => {
        const shockedAssumptions = { ...baseAssumptions, ...scenario.shocks };
        const result = calculationType === 'ifrs17'
          ? await this.calculateIFRS17(policies, shockedAssumptions)
          : await this.calculateSolvency(policies, shockedAssumptions);

        return {
          scenario: scenario.name,
          shocks: scenario.shocks,
          results: result.aggregate_results,
        };
      })
    );

    return {
      base_scenario: 'Base',
      scenarios: results,
      generated_at: new Date().toISOString(),
    };
  }

  /**
   * Health check for Python engine
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }

  /**
   * Get available mortality tables
   * @returns {Promise<Array>} List of mortality tables
   */
  async getMortalityTables() {
    const response = await this.client.get('/api/v1/mortality-tables');
    return response.data;
  }
}

module.exports = new PythonEngineService();
```

#### Task 1.1.2: Circuit Breaker Utility

**File:** `server/utils/circuitBreaker.js`

```javascript
/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures when Python engine is down
 */

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

module.exports = { CircuitBreaker };
```

#### Task 1.1.3: Update Calculation Controller

**File:** `server/controllers/calculationController.js` (UPDATE)

```javascript
const pythonEngine = require('../services/pythonEngineService');
const firestoreService = require('../services/firestoreService');
const { createLogger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

const logger = createLogger('CalculationController');

/**
 * Start a new calculation
 * POST /api/calculations/start
 */
exports.startCalculation = async (req, res, next) => {
  const calculationId = uuidv4();
  const startTime = Date.now();

  try {
    const { calculationType, portfolio, assumptions, options } = req.body;
    const userId = req.user.uid;

    // Validate input
    if (!['ifrs17', 'solvency'].includes(calculationType)) {
      return res.status(400).json({
        error: 'Invalid calculation type',
        valid_types: ['ifrs17', 'solvency'],
      });
    }

    if (!portfolio || portfolio.length === 0) {
      return res.status(400).json({
        error: 'Portfolio is required and must not be empty',
      });
    }

    logger.info(`Starting ${calculationType} calculation`, {
      calculationId,
      userId,
      policyCount: portfolio.length,
    });

    // Save calculation metadata
    await firestoreService.saveDocument(
      `users/${userId}/calculations/${calculationId}`,
      {
        id: calculationId,
        type: calculationType,
        status: 'processing',
        policyCount: portfolio.length,
        createdAt: new Date().toISOString(),
        assumptions,
      }
    );

    // Execute calculation
    let result;
    if (calculationType === 'ifrs17') {
      result = await pythonEngine.calculateIFRS17(portfolio, assumptions, options);
    } else {
      result = await pythonEngine.calculateSolvency(portfolio, assumptions, options);
    }

    const duration = Date.now() - startTime;

    // Save results
    await firestoreService.updateDocument(
      `users/${userId}/calculations/${calculationId}`,
      {
        status: 'completed',
        result: result.aggregate_results,
        auditTrail: result.audit_trail,
        duration,
        completedAt: new Date().toISOString(),
      }
    );

    logger.info(`Calculation completed`, {
      calculationId,
      duration,
      policyCount: portfolio.length,
    });

    return res.json({
      calculation_id: calculationId,
      status: 'completed',
      duration_ms: duration,
      ...result,
    });
  } catch (error) {
    logger.error(`Calculation failed`, {
      calculationId,
      error: error.message,
    });

    // Save failure status
    if (req.user?.uid) {
      await firestoreService.updateDocument(
        `users/${req.user.uid}/calculations/${calculationId}`,
        {
          status: 'failed',
          error: error.message,
          completedAt: new Date().toISOString(),
        }
      );
    }

    next(error);
  }
};

/**
 * Get calculation status
 * GET /api/calculations/:calculationId/status
 */
exports.getCalculationStatus = async (req, res, next) => {
  try {
    const { calculationId } = req.params;
    const userId = req.user.uid;

    const calculation = await firestoreService.getDocument(
      `users/${userId}/calculations/${calculationId}`
    );

    if (!calculation) {
      return res.status(404).json({ error: 'Calculation not found' });
    }

    return res.json({
      id: calculation.id,
      status: calculation.status,
      type: calculation.type,
      createdAt: calculation.createdAt,
      completedAt: calculation.completedAt,
      duration: calculation.duration,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get calculation results
 * GET /api/calculations/:calculationId/results
 */
exports.getCalculationResults = async (req, res, next) => {
  try {
    const { calculationId } = req.params;
    const userId = req.user.uid;

    const calculation = await firestoreService.getDocument(
      `users/${userId}/calculations/${calculationId}`
    );

    if (!calculation) {
      return res.status(404).json({ error: 'Calculation not found' });
    }

    if (calculation.status !== 'completed') {
      return res.status(400).json({
        error: 'Calculation not completed',
        status: calculation.status,
      });
    }

    return res.json({
      id: calculation.id,
      type: calculation.type,
      result: calculation.result,
      auditTrail: calculation.auditTrail,
      assumptions: calculation.assumptions,
      createdAt: calculation.createdAt,
      completedAt: calculation.completedAt,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get calculation history
 * GET /api/calculations/history
 */
exports.getCalculationHistory = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { limit = 20, offset = 0 } = req.query;

    const calculations = await firestoreService.queryDocuments(
      `users/${userId}/calculations`,
      {
        orderBy: { field: 'createdAt', direction: 'desc' },
        limit: parseInt(limit),
        offset: parseInt(offset),
      }
    );

    return res.json({
      calculations: calculations.map((c) => ({
        id: c.id,
        type: c.type,
        status: c.status,
        policyCount: c.policyCount,
        createdAt: c.createdAt,
        completedAt: c.completedAt,
      })),
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Run sensitivity analysis
 * POST /api/calculations/sensitivity
 */
exports.runSensitivityAnalysis = async (req, res, next) => {
  try {
    const { calculationType, portfolio, baseAssumptions, scenarios } = req.body;

    const defaultScenarios = scenarios || [
      { name: 'Base', shocks: {} },
      { name: 'Discount +100bps', shocks: { discountRate: baseAssumptions.discountRate + 0.01 } },
      { name: 'Discount -100bps', shocks: { discountRate: baseAssumptions.discountRate - 0.01 } },
      { name: 'Lapse +50%', shocks: { lapseRate: baseAssumptions.lapseRate * 1.5 } },
      { name: 'Mortality +15%', shocks: { mortalityShock: 1.15 } },
    ];

    const result = await pythonEngine.runSensitivityAnalysis(
      calculationType,
      portfolio,
      baseAssumptions,
      defaultScenarios
    );

    return res.json(result);
  } catch (error) {
    next(error);
  }
};
```

### 5.2 Client API Layer

**File:** `client/src/lib/api.js`

```javascript
/**
 * Valuact API Client
 * Centralized API communication layer
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ValuactAPI {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 300000, // 5 minutes for long calculations
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ============ Authentication ============

  async login(email, password) {
    const response = await this.client.post('/api/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  }

  async register(email, password, organizationName) {
    const response = await this.client.post('/api/auth/register', {
      email,
      password,
      organizationName,
    });
    return response.data;
  }

  async logout() {
    localStorage.removeItem('authToken');
  }

  // ============ Calculations ============

  async runIFRS17Calculation(portfolio, assumptions, options = {}) {
    const response = await this.client.post('/api/calculations/start', {
      calculationType: 'ifrs17',
      portfolio,
      assumptions,
      options,
    });
    return response.data;
  }

  async runSolvencyCalculation(portfolio, assumptions, options = {}) {
    const response = await this.client.post('/api/calculations/start', {
      calculationType: 'solvency',
      portfolio,
      assumptions,
      options,
    });
    return response.data;
  }

  async getCalculationStatus(calculationId) {
    const response = await this.client.get(`/api/calculations/${calculationId}/status`);
    return response.data;
  }

  async getCalculationResults(calculationId) {
    const response = await this.client.get(`/api/calculations/${calculationId}/results`);
    return response.data;
  }

  async getCalculationHistory(limit = 20, offset = 0) {
    const response = await this.client.get('/api/calculations/history', {
      params: { limit, offset },
    });
    return response.data;
  }

  async runSensitivityAnalysis(calculationType, portfolio, baseAssumptions, scenarios) {
    const response = await this.client.post('/api/calculations/sensitivity', {
      calculationType,
      portfolio,
      baseAssumptions,
      scenarios,
    });
    return response.data;
  }

  // ============ Data Management ============

  async uploadPortfolio(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(options).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const response = await this.client.post('/api/data-management/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async getPortfolios() {
    const response = await this.client.get('/api/data');
    return response.data;
  }

  async getPortfolio(portfolioId) {
    const response = await this.client.get(`/api/data/${portfolioId}`);
    return response.data;
  }

  async deletePortfolio(portfolioId) {
    const response = await this.client.delete(`/api/data/${portfolioId}`);
    return response.data;
  }

  // ============ AI Chat ============

  async sendChatMessage(message, context = {}) {
    const response = await this.client.post('/api/chat', {
      message,
      context,
    });
    return response.data;
  }

  // ============ Methodology ============

  async getMethodology(topic) {
    const response = await this.client.get('/api/methodology', {
      params: { topic },
    });
    return response.data;
  }

  // ============ Health ============

  async healthCheck() {
    const response = await this.client.get('/api/health');
    return response.data;
  }
}

const api = new ValuactAPI();
export default api;

// Named exports for convenience
export const calculations = {
  runIFRS17: (portfolio, assumptions, options) =>
    api.runIFRS17Calculation(portfolio, assumptions, options),
  runSolvency: (portfolio, assumptions, options) =>
    api.runSolvencyCalculation(portfolio, assumptions, options),
  getStatus: (id) => api.getCalculationStatus(id),
  getResults: (id) => api.getCalculationResults(id),
  getHistory: (limit, offset) => api.getCalculationHistory(limit, offset),
  runSensitivity: (type, portfolio, assumptions, scenarios) =>
    api.runSensitivityAnalysis(type, portfolio, assumptions, scenarios),
};

export const data = {
  upload: (file, options) => api.uploadPortfolio(file, options),
  getAll: () => api.getPortfolios(),
  get: (id) => api.getPortfolio(id),
  delete: (id) => api.deletePortfolio(id),
};

export const chat = {
  send: (message, context) => api.sendChatMessage(message, context),
};
```

### 5.3 Calculation Hooks

**File:** `client/src/hooks/useCalculation.js`

```javascript
/**
 * React hook for running actuarial calculations
 */

import { useState, useCallback } from 'react';
import { calculations } from '../lib/api';

export function useCalculation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [progress, setProgress] = useState(0);

  const runIFRS17 = useCallback(async (portfolio, assumptions, options = {}) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      // For large portfolios, poll for status
      if (portfolio.length > 1000) {
        const { calculation_id } = await calculations.runIFRS17(
          portfolio,
          assumptions,
          { ...options, async: true }
        );

        // Poll for completion
        let status = 'processing';
        while (status === 'processing') {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const statusResponse = await calculations.getStatus(calculation_id);
          status = statusResponse.status;
          setProgress(statusResponse.progress || 0);
        }

        const finalResults = await calculations.getResults(calculation_id);
        setResults(finalResults);
        return finalResults;
      } else {
        // Synchronous for small portfolios
        const result = await calculations.runIFRS17(portfolio, assumptions, options);
        setResults(result);
        setProgress(100);
        return result;
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const runSolvency = useCallback(async (portfolio, assumptions, options = {}) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const result = await calculations.runSolvency(portfolio, assumptions, options);
      setResults(result);
      setProgress(100);
      return result;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const runSensitivity = useCallback(async (type, portfolio, baseAssumptions, scenarios) => {
    setLoading(true);
    setError(null);

    try {
      const result = await calculations.runSensitivity(
        type,
        portfolio,
        baseAssumptions,
        scenarios
      );
      setResults(result);
      return result;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResults(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    loading,
    error,
    results,
    progress,
    runIFRS17,
    runSolvency,
    runSensitivity,
    reset,
  };
}

export default useCalculation;
```

### 5.4 Environment Configuration

**File:** `server/.env.example` (UPDATE)

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Python Actuarial Engine
PYTHON_ENGINE_URL=http://localhost:8000
CALCULATION_TIMEOUT=300000

# Gemini AI
GOOGLE_API_KEY=your-gemini-api-key

# Security
JWT_SECRET=your-jwt-secret-key-min-32-chars
CLIENT_URL=http://localhost:3000

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
```

**File:** `client/.env.local.example` (CREATE)

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 5.5 Docker Configuration

**File:** `docker-compose.yml` (CREATE)

```yaml
version: '3.8'

services:
  # Python Actuarial Engine
  actuarial-engine:
    build:
      context: ./actuarial-engine
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - LOG_LEVEL=info
    volumes:
      - ./actuarial-engine:/app
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Node.js Backend
  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - PYTHON_ENGINE_URL=http://actuarial-engine:8000
      - REDIS_URL=redis://redis:6379
    env_file:
      - ./server/.env
    depends_on:
      - actuarial-engine
      - redis
    volumes:
      - ./server:/app
      - /app/node_modules

  # Next.js Frontend
  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    env_file:
      - ./client/.env.local
    depends_on:
      - server
    volumes:
      - ./client:/app
      - /app/node_modules
      - /app/.next

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

**File:** `actuarial-engine/Dockerfile` (CREATE)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 7. Phase 2: Core Platform

### Objective
Complete all core calculator features, implement real-time updates, and add comprehensive testing.

### 6.1 Real-Time Calculation Updates

**File:** `server/websocket.js` (CREATE)

```javascript
/**
 * WebSocket server for real-time calculation updates
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { createLogger } = require('./utils/logger');

const logger = createLogger('WebSocket');

let io;

function initializeWebSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.uid;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id} (user: ${socket.userId})`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Subscribe to calculation updates
    socket.on('subscribe:calculation', (calculationId) => {
      socket.join(`calculation:${calculationId}`);
      logger.debug(`Socket ${socket.id} subscribed to calculation ${calculationId}`);
    });

    // Unsubscribe from calculation
    socket.on('unsubscribe:calculation', (calculationId) => {
      socket.leave(`calculation:${calculationId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id} (reason: ${reason})`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error: ${error.message}`);
    });
  });

  return io;
}

/**
 * Emit calculation progress update
 */
function emitCalculationProgress(calculationId, progress, message) {
  if (io) {
    io.to(`calculation:${calculationId}`).emit('calculation:progress', {
      calculationId,
      progress,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Emit calculation completion
 */
function emitCalculationComplete(calculationId, results) {
  if (io) {
    io.to(`calculation:${calculationId}`).emit('calculation:complete', {
      calculationId,
      results: {
        aggregate: results.aggregate_results,
        // Don't send full policy results via WebSocket (too large)
      },
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Emit calculation error
 */
function emitCalculationError(calculationId, error) {
  if (io) {
    io.to(`calculation:${calculationId}`).emit('calculation:error', {
      calculationId,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Emit notification to user
 */
function emitUserNotification(userId, notification) {
  if (io) {
    io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }
}

module.exports = {
  initializeWebSocket,
  emitCalculationProgress,
  emitCalculationComplete,
  emitCalculationError,
  emitUserNotification,
};
```

**File:** `client/src/hooks/useWebSocket.js` (CREATE)

```javascript
/**
 * React hook for WebSocket connection
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useWebSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => {
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
    });

    socketRef.current.on('notification', (data) => {
      setLastMessage(data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const subscribeToCalculation = useCallback((calculationId, handlers) => {
    if (!socketRef.current) return;

    socketRef.current.emit('subscribe:calculation', calculationId);

    if (handlers.onProgress) {
      socketRef.current.on('calculation:progress', handlers.onProgress);
    }
    if (handlers.onComplete) {
      socketRef.current.on('calculation:complete', handlers.onComplete);
    }
    if (handlers.onError) {
      socketRef.current.on('calculation:error', handlers.onError);
    }

    return () => {
      socketRef.current.emit('unsubscribe:calculation', calculationId);
      socketRef.current.off('calculation:progress');
      socketRef.current.off('calculation:complete');
      socketRef.current.off('calculation:error');
    };
  }, []);

  return {
    connected,
    lastMessage,
    subscribeToCalculation,
    socket: socketRef.current,
  };
}

export default useWebSocket;
```

### 6.2 Comprehensive Sensitivity Analysis

**File:** `client/src/components/calculators/SensitivityAnalysis.jsx` (CREATE)

```jsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { BlockMath } from 'react-katex';
import { useCalculation } from '../../hooks/useCalculation';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const DEFAULT_SCENARIOS = [
  { id: 'discount_up_100', name: 'Discount +100bps', param: 'discountRate', shock: 0.01 },
  { id: 'discount_up_50', name: 'Discount +50bps', param: 'discountRate', shock: 0.005 },
  { id: 'discount_down_50', name: 'Discount -50bps', param: 'discountRate', shock: -0.005 },
  { id: 'discount_down_100', name: 'Discount -100bps', param: 'discountRate', shock: -0.01 },
  { id: 'lapse_up_50', name: 'Lapse +50%', param: 'lapseRate', shockMultiplier: 1.5 },
  { id: 'lapse_down_50', name: 'Lapse -50%', param: 'lapseRate', shockMultiplier: 0.5 },
  { id: 'mortality_up_15', name: 'Mortality +15%', param: 'mortalityShock', shock: 0.15 },
  { id: 'mortality_down_15', name: 'Mortality -15%', param: 'mortalityShock', shock: -0.15 },
  { id: 'expense_up_10', name: 'Expense +10%', param: 'expenseInflation', shock: 0.10 },
];

export default function SensitivityAnalysis({
  portfolio,
  baseAssumptions,
  calculationType = 'ifrs17',
}) {
  const [selectedScenarios, setSelectedScenarios] = useState(
    DEFAULT_SCENARIOS.slice(0, 5).map(s => s.id)
  );
  const [results, setResults] = useState(null);
  const { loading, error, runSensitivity } = useCalculation();

  const scenarios = useMemo(() => {
    return DEFAULT_SCENARIOS.filter(s => selectedScenarios.includes(s.id)).map(s => ({
      name: s.name,
      shocks: s.shockMultiplier
        ? { [s.param]: baseAssumptions[s.param] * s.shockMultiplier }
        : { [s.param]: (baseAssumptions[s.param] || 0) + s.shock },
    }));
  }, [selectedScenarios, baseAssumptions]);

  const handleRunAnalysis = async () => {
    const scenariosWithBase = [
      { name: 'Base', shocks: {} },
      ...scenarios,
    ];

    const result = await runSensitivity(
      calculationType,
      portfolio,
      baseAssumptions,
      scenariosWithBase
    );

    setResults(result);
  };

  const chartData = useMemo(() => {
    if (!results?.scenarios) return [];

    const baseResult = results.scenarios.find(s => s.scenario === 'Base');
    const baseCSM = baseResult?.results?.total_csm || 0;

    return results.scenarios.map(s => ({
      scenario: s.scenario,
      csm: s.results?.total_csm || 0,
      fcf: s.results?.total_fcf || 0,
      ra: s.results?.total_risk_adjustment || 0,
      change: ((s.results?.total_csm || 0) - baseCSM) / baseCSM,
      absoluteChange: (s.results?.total_csm || 0) - baseCSM,
    }));
  }, [results]);

  const toggleScenario = (scenarioId) => {
    setSelectedScenarios(prev =>
      prev.includes(scenarioId)
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sensitivity Analysis</h2>
          <p className="text-sm text-gray-500 mt-1">
            Analyze impact of assumption changes on {calculationType.toUpperCase()} metrics
          </p>
        </div>
        <button
          onClick={handleRunAnalysis}
          disabled={loading || selectedScenarios.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Running...' : 'Run Analysis'}
        </button>
      </div>

      {/* Scenario Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Select Scenarios</h3>
        <div className="flex flex-wrap gap-2">
          {DEFAULT_SCENARIOS.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => toggleScenario(scenario.id)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedScenarios.includes(scenario.id)
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              {scenario.name}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {results && chartData.length > 0 && (
        <>
          {/* Waterfall Chart */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">CSM Impact by Scenario</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                <YAxis type="category" dataKey="scenario" width={120} />
                <Tooltip
                  formatter={(value, name) => [formatCurrency(value), name]}
                />
                <Legend />
                <ReferenceLine x={chartData[0]?.csm || 0} stroke="#666" strokeDasharray="3 3" />
                <Bar dataKey="csm" fill="#3B82F6" name="CSM" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Change Analysis Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Impact Analysis</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Scenario
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      CSM
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Change
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      % Change
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      FCF
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Risk Adj.
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chartData.map((row, idx) => (
                    <tr key={row.scenario} className={idx === 0 ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {row.scenario}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        {formatCurrency(row.csm)}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-mono ${
                        row.absoluteChange > 0 ? 'text-green-600' :
                        row.absoluteChange < 0 ? 'text-red-600' : ''
                      }`}>
                        {idx === 0 ? '-' : formatCurrency(row.absoluteChange)}
                      </td>
                      <td className={`px-4 py-3 text-sm text-right font-mono ${
                        row.change > 0 ? 'text-green-600' :
                        row.change < 0 ? 'text-red-600' : ''
                      }`}>
                        {idx === 0 ? '-' : formatPercentage(row.change)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        {formatCurrency(row.fcf)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-mono">
                        {formatCurrency(row.ra)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Methodology Note */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Methodology</h4>
            <p className="text-sm text-gray-600 mb-2">
              Sensitivity analysis applies shocks to base assumptions and recalculates all metrics.
              Changes shown are relative to the base scenario.
            </p>
            <BlockMath math="\Delta CSM = CSM_{shocked} - CSM_{base}" />
          </div>
        </>
      )}
    </div>
  );
}
```

### 6.3 Stress Testing Panel

**File:** `client/src/components/calculators/StressTestPanel.jsx` (CREATE)

```jsx
'use client';

import React, { useState } from 'react';
import { AlertTriangle, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { useCalculation } from '../../hooks/useCalculation';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { BlockMath } from 'react-katex';

const REGULATORY_SCENARIOS = {
  solvency_ii: [
    {
      id: 'equity_stress',
      name: 'Equity Stress',
      icon: TrendingDown,
      description: 'Type 1 equities: 39% shock, Type 2: 49% shock',
      shocks: { equity_shock: -0.39 },
      regulation: 'SII Art. 169',
    },
    {
      id: 'interest_rate_down',
      name: 'Interest Rate Down',
      icon: Activity,
      description: 'Parallel shift down per EIOPA curve',
      shocks: { rate_shock_down: true },
      regulation: 'SII Art. 166',
    },
    {
      id: 'interest_rate_up',
      name: 'Interest Rate Up',
      icon: Activity,
      description: 'Parallel shift up per EIOPA curve',
      shocks: { rate_shock_up: true },
      regulation: 'SII Art. 166',
    },
    {
      id: 'mortality_cat',
      name: 'Mortality Catastrophe',
      icon: AlertTriangle,
      description: '0.15% additional mortality rate for 1 year',
      shocks: { mortality_cat: 0.0015 },
      regulation: 'SII Art. 136',
    },
    {
      id: 'mass_lapse_up',
      name: 'Mass Lapse Up',
      icon: DollarSign,
      description: '40% immediate surrender of policies',
      shocks: { mass_lapse: 0.40 },
      regulation: 'SII Art. 142',
    },
  ],
  ifrs17: [
    {
      id: 'discount_100bp',
      name: 'Discount Rate +100bp',
      icon: Activity,
      description: 'Parallel increase in risk-free rates',
      shocks: { discount_shock: 0.01 },
      regulation: 'IFRS 17.36',
    },
    {
      id: 'discount_minus_100bp',
      name: 'Discount Rate -100bp',
      icon: Activity,
      description: 'Parallel decrease in risk-free rates',
      shocks: { discount_shock: -0.01 },
      regulation: 'IFRS 17.36',
    },
    {
      id: 'expense_inflation',
      name: 'Expense Inflation +2%',
      icon: DollarSign,
      description: 'Increase in expense inflation assumption',
      shocks: { expense_inflation_shock: 0.02 },
      regulation: 'IFRS 17.33',
    },
    {
      id: 'mortality_15',
      name: 'Mortality +15%',
      icon: AlertTriangle,
      description: '15% increase in all mortality rates',
      shocks: { mortality_shock: 0.15 },
      regulation: 'IFRS 17.33',
    },
  ],
};

const COMBINED_SCENARIOS = [
  {
    id: 'adverse_combined',
    name: 'Adverse Combined',
    description: 'Multiple adverse scenarios occurring simultaneously',
    shocks: {
      equity_shock: -0.25,
      discount_shock: 0.01,
      mortality_shock: 0.10,
      lapse_shock: 0.20,
    },
    severity: 'high',
  },
  {
    id: 'moderate_stress',
    name: 'Moderate Stress',
    description: 'Moderate deterioration across all risk factors',
    shocks: {
      equity_shock: -0.15,
      discount_shock: 0.005,
      mortality_shock: 0.05,
      lapse_shock: 0.10,
    },
    severity: 'medium',
  },
];

export default function StressTestPanel({
  portfolio,
  baseAssumptions,
  baseResults,
  calculationType = 'solvency',
}) {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [stressResults, setStressResults] = useState({});
  const { loading, runSolvency, runIFRS17 } = useCalculation();

  const scenarios = REGULATORY_SCENARIOS[calculationType] || REGULATORY_SCENARIOS.solvency_ii;

  const runStressTest = async (scenario) => {
    setSelectedScenario(scenario.id);

    const stressedAssumptions = {
      ...baseAssumptions,
      stress_scenario: scenario.id,
      ...scenario.shocks,
    };

    try {
      const result = calculationType === 'solvency'
        ? await runSolvency(portfolio, stressedAssumptions)
        : await runIFRS17(portfolio, stressedAssumptions);

      setStressResults(prev => ({
        ...prev,
        [scenario.id]: result,
      }));
    } finally {
      setSelectedScenario(null);
    }
  };

  const calculateImpact = (scenarioId, metric) => {
    const stressedValue = stressResults[scenarioId]?.aggregate_results?.[metric];
    const baseValue = baseResults?.aggregate_results?.[metric] || baseResults?.[metric];

    if (!stressedValue || !baseValue) return null;

    return {
      absolute: stressedValue - baseValue,
      relative: (stressedValue - baseValue) / Math.abs(baseValue),
    };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Stress Testing</h2>
        <p className="text-sm text-gray-500 mt-1">
          Regulatory and scenario-based stress tests for {calculationType.toUpperCase()}
        </p>
      </div>

      {/* Regulatory Scenarios */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Regulatory Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarios.map(scenario => {
            const Icon = scenario.icon;
            const impact = calculateImpact(
              scenario.id,
              calculationType === 'solvency' ? 'total_scr' : 'total_csm'
            );
            const isRunning = loading && selectedScenario === scenario.id;

            return (
              <div
                key={scenario.id}
                className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{scenario.description}</p>
                    <p className="text-xs text-blue-600 mt-1">{scenario.regulation}</p>
                  </div>
                </div>

                {stressResults[scenario.id] && impact && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        {calculationType === 'solvency' ? 'SCR Impact:' : 'CSM Impact:'}
                      </span>
                      <span className={`font-mono font-medium ${
                        impact.relative > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(impact.absolute)}
                        <span className="text-xs ml-1">
                          ({formatPercentage(impact.relative)})
                        </span>
                      </span>
                    </div>
                    {calculationType === 'solvency' && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-500">Solvency Ratio:</span>
                        <span className="font-mono">
                          {formatPercentage(
                            stressResults[scenario.id].aggregate_results?.solvency_ratio || 0
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => runStressTest(scenario)}
                  disabled={isRunning}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    isRunning
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isRunning ? 'Running...' : stressResults[scenario.id] ? 'Re-run' : 'Run Test'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Combined Scenarios */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Combined Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COMBINED_SCENARIOS.map(scenario => {
            const impact = calculateImpact(
              scenario.id,
              calculationType === 'solvency' ? 'total_scr' : 'total_csm'
            );
            const isRunning = loading && selectedScenario === scenario.id;

            return (
              <div
                key={scenario.id}
                className={`border-2 rounded-lg p-4 ${
                  scenario.severity === 'high'
                    ? 'border-red-200 bg-red-50'
                    : 'border-yellow-200 bg-yellow-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={`w-5 h-5 ${
                    scenario.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    scenario.severity === 'high'
                      ? 'bg-red-200 text-red-800'
                      : 'bg-yellow-200 text-yellow-800'
                  }`}>
                    {scenario.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>

                <div className="text-xs text-gray-500 mb-3">
                  <strong>Shocks:</strong>{' '}
                  {Object.entries(scenario.shocks).map(([k, v]) => (
                    <span key={k} className="mr-2">
                      {k}: {typeof v === 'number' ? formatPercentage(v) : v}
                    </span>
                  ))}
                </div>

                {stressResults[scenario.id] && impact && (
                  <div className="p-3 bg-white rounded-lg mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Impact:</span>
                      <span className={`font-mono font-medium ${
                        impact.relative > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(impact.absolute)} ({formatPercentage(impact.relative)})
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => runStressTest(scenario)}
                  disabled={isRunning}
                  className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${
                    isRunning
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : scenario.severity === 'high'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                >
                  {isRunning ? 'Running...' : 'Run Combined Test'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Methodology */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Stress Test Methodology</h4>
        <p className="text-sm text-gray-600 mb-3">
          Stress tests are applied instantaneously to the current portfolio. Results show the
          impact on key metrics compared to the base scenario.
        </p>
        <BlockMath math="\text{Impact} = \text{Metric}_{stressed} - \text{Metric}_{base}" />
      </div>
    </div>
  );
}
```

---

## 8. Phase 3: Advanced Analytics

### Objective
Implement stochastic modeling, advanced reporting, and ALM integration.

### 7.1 Economic Scenario Generator (ESG)

**File:** `actuarial-engine/calculations/esg.py` (CREATE)

```python
"""
Economic Scenario Generator (ESG)
Generates interest rate, equity, and credit scenarios for stochastic modeling.
"""

import numpy as np
from typing import Tuple, List, Dict, Any
from dataclasses import dataclass
from scipy import stats
import pandas as pd

@dataclass
class ESGConfig:
    """Configuration for Economic Scenario Generator."""
    n_scenarios: int = 1000
    n_years: int = 50
    seed: int = 42
    model: str = "hull_white"  # hull_white, vasicek, cir


class HullWhiteModel:
    """
    Hull-White one-factor interest rate model.

    dr(t) = (θ(t) - a*r(t))dt + σ*dW(t)

    Parameters:
    - a: mean reversion speed
    - σ: volatility
    - θ(t): time-dependent drift (calibrated to initial curve)
    """

    def __init__(
        self,
        mean_reversion: float = 0.03,
        volatility: float = 0.01,
        initial_curve: np.ndarray = None
    ):
        self.a = mean_reversion
        self.sigma = volatility
        self.initial_curve = initial_curve if initial_curve is not None else \
            np.array([0.02 + 0.001 * t for t in range(51)])

    def theta(self, t: int) -> float:
        """Calculate time-dependent drift to match initial curve."""
        if t >= len(self.initial_curve) - 1:
            return self.a * self.initial_curve[-1]

        forward_rate = self.initial_curve[t + 1] - self.initial_curve[t]
        return forward_rate + self.a * self.initial_curve[t] + \
               (self.sigma ** 2 / (2 * self.a)) * (1 - np.exp(-2 * self.a * t))

    def simulate(
        self,
        n_scenarios: int,
        n_years: int,
        dt: float = 1.0,
        seed: int = 42
    ) -> np.ndarray:
        """
        Simulate interest rate paths.

        Returns:
            Array of shape (n_scenarios, n_years + 1) containing rate paths
        """
        np.random.seed(seed)

        rates = np.zeros((n_scenarios, n_years + 1))
        rates[:, 0] = self.initial_curve[0]

        for t in range(n_years):
            dW = np.random.normal(0, np.sqrt(dt), n_scenarios)
            drift = (self.theta(t) - self.a * rates[:, t]) * dt
            diffusion = self.sigma * dW

            rates[:, t + 1] = rates[:, t] + drift + diffusion

        return rates


class EquityModel:
    """
    Geometric Brownian Motion for equity returns.

    dS/S = μ*dt + σ*dW
    """

    def __init__(
        self,
        drift: float = 0.07,
        volatility: float = 0.20,
        correlation_with_rates: float = -0.30
    ):
        self.mu = drift
        self.sigma = volatility
        self.rho = correlation_with_rates

    def simulate(
        self,
        n_scenarios: int,
        n_years: int,
        rate_paths: np.ndarray = None,
        seed: int = 42
    ) -> np.ndarray:
        """
        Simulate equity index paths.

        Args:
            n_scenarios: Number of scenarios
            n_years: Projection years
            rate_paths: Interest rate paths for correlation
            seed: Random seed

        Returns:
            Array of shape (n_scenarios, n_years + 1) containing equity levels
        """
        np.random.seed(seed)

        # Generate correlated random numbers
        if rate_paths is not None:
            # Use Cholesky decomposition for correlation
            rate_innovations = np.diff(rate_paths, axis=1)
            rate_innovations = (rate_innovations - rate_innovations.mean()) / rate_innovations.std()

            independent_innovations = np.random.normal(0, 1, (n_scenarios, n_years))

            # Correlate with rates
            equity_innovations = (
                self.rho * rate_innovations +
                np.sqrt(1 - self.rho ** 2) * independent_innovations
            )
        else:
            equity_innovations = np.random.normal(0, 1, (n_scenarios, n_years))

        # Simulate paths
        equity = np.zeros((n_scenarios, n_years + 1))
        equity[:, 0] = 100.0  # Initial level

        for t in range(n_years):
            return_t = (self.mu - 0.5 * self.sigma ** 2) + self.sigma * equity_innovations[:, t]
            equity[:, t + 1] = equity[:, t] * np.exp(return_t)

        return equity


class CreditModel:
    """
    Credit spread model using CIR process.

    ds = κ(θ - s)dt + σ√s*dW
    """

    def __init__(
        self,
        mean_reversion: float = 0.5,
        long_term_mean: float = 0.01,
        volatility: float = 0.05
    ):
        self.kappa = mean_reversion
        self.theta = long_term_mean
        self.sigma = volatility

    def simulate(
        self,
        n_scenarios: int,
        n_years: int,
        seed: int = 42
    ) -> np.ndarray:
        """Simulate credit spread paths."""
        np.random.seed(seed)

        spreads = np.zeros((n_scenarios, n_years + 1))
        spreads[:, 0] = self.theta

        for t in range(n_years):
            dW = np.random.normal(0, 1, n_scenarios)
            drift = self.kappa * (self.theta - spreads[:, t])
            diffusion = self.sigma * np.sqrt(np.maximum(spreads[:, t], 0)) * dW

            spreads[:, t + 1] = np.maximum(spreads[:, t] + drift + diffusion, 0)

        return spreads


class EconomicScenarioGenerator:
    """
    Complete ESG combining interest rates, equity, and credit.
    """

    def __init__(self, config: ESGConfig = None):
        self.config = config or ESGConfig()
        self.rate_model = HullWhiteModel()
        self.equity_model = EquityModel()
        self.credit_model = CreditModel()

    def generate_scenarios(
        self,
        initial_curve: np.ndarray = None,
        calibration: Dict[str, Any] = None
    ) -> Dict[str, np.ndarray]:
        """
        Generate full set of economic scenarios.

        Returns:
            Dictionary containing:
            - interest_rates: (n_scenarios, n_years+1) array
            - equity_returns: (n_scenarios, n_years+1) array
            - credit_spreads: (n_scenarios, n_years+1) array
            - discount_factors: (n_scenarios, n_years+1) array
        """
        if initial_curve is not None:
            self.rate_model.initial_curve = initial_curve

        if calibration:
            self._apply_calibration(calibration)

        # Generate interest rate scenarios
        interest_rates = self.rate_model.simulate(
            self.config.n_scenarios,
            self.config.n_years,
            seed=self.config.seed
        )

        # Generate equity scenarios (correlated with rates)
        equity = self.equity_model.simulate(
            self.config.n_scenarios,
            self.config.n_years,
            rate_paths=interest_rates,
            seed=self.config.seed + 1
        )

        # Generate credit spread scenarios
        credit_spreads = self.credit_model.simulate(
            self.config.n_scenarios,
            self.config.n_years,
            seed=self.config.seed + 2
        )

        # Calculate discount factors
        discount_factors = np.exp(-np.cumsum(interest_rates, axis=1))

        return {
            "interest_rates": interest_rates,
            "equity_levels": equity,
            "credit_spreads": credit_spreads,
            "discount_factors": discount_factors,
            "metadata": {
                "n_scenarios": self.config.n_scenarios,
                "n_years": self.config.n_years,
                "model": self.config.model,
                "seed": self.config.seed,
            }
        }

    def _apply_calibration(self, calibration: Dict[str, Any]) -> None:
        """Apply calibration parameters to models."""
        if "rate_volatility" in calibration:
            self.rate_model.sigma = calibration["rate_volatility"]
        if "rate_mean_reversion" in calibration:
            self.rate_model.a = calibration["rate_mean_reversion"]
        if "equity_volatility" in calibration:
            self.equity_model.sigma = calibration["equity_volatility"]
        if "equity_drift" in calibration:
            self.equity_model.mu = calibration["equity_drift"]

    def calculate_statistics(
        self,
        scenarios: Dict[str, np.ndarray]
    ) -> Dict[str, Any]:
        """Calculate summary statistics for scenarios."""
        rates = scenarios["interest_rates"]
        equity = scenarios["equity_levels"]

        return {
            "interest_rates": {
                "mean": np.mean(rates[:, -1]),
                "std": np.std(rates[:, -1]),
                "percentiles": {
                    "5th": np.percentile(rates[:, -1], 5),
                    "25th": np.percentile(rates[:, -1], 25),
                    "50th": np.percentile(rates[:, -1], 50),
                    "75th": np.percentile(rates[:, -1], 75),
                    "95th": np.percentile(rates[:, -1], 95),
                }
            },
            "equity": {
                "mean_return": np.mean(np.log(equity[:, -1] / equity[:, 0])) / self.config.n_years,
                "volatility": np.std(np.diff(np.log(equity), axis=1)) * np.sqrt(1),
                "terminal_percentiles": {
                    "5th": np.percentile(equity[:, -1], 5),
                    "50th": np.percentile(equity[:, -1], 50),
                    "95th": np.percentile(equity[:, -1], 95),
                }
            }
        }
```

### 7.2 Stochastic Risk Adjustment

**File:** `actuarial-engine/calculations/stochastic_ra.py` (CREATE)

```python
"""
Stochastic Risk Adjustment Calculation
Monte Carlo simulation for IFRS 17 Risk Adjustment calibration.
"""

import numpy as np
from typing import Dict, List, Tuple, Any
from concurrent.futures import ProcessPoolExecutor
import multiprocessing
from dataclasses import dataclass

from .esg import EconomicScenarioGenerator, ESGConfig


@dataclass
class RiskAdjustmentConfig:
    """Configuration for stochastic Risk Adjustment."""
    n_simulations: int = 10000
    confidence_level: float = 0.75  # IFRS 17 typical range: 65-95%
    n_workers: int = 4
    seed: int = 42


def simulate_insurance_cashflows(
    policy_data: Dict,
    mortality_rates: np.ndarray,
    lapse_rates: np.ndarray,
    economic_scenarios: Dict[str, np.ndarray],
    n_years: int = 50
) -> np.ndarray:
    """
    Simulate insurance liability cash flows under multiple scenarios.

    Args:
        policy_data: Policy characteristics
        mortality_rates: Base mortality rates by age
        lapse_rates: Base lapse rates by duration
        economic_scenarios: ESG output
        n_years: Projection horizon

    Returns:
        Array of shape (n_scenarios, n_years) with net cash flows
    """
    n_scenarios = economic_scenarios["interest_rates"].shape[0]

    # Initialize cash flow arrays
    death_benefits = np.zeros((n_scenarios, n_years))
    surrender_benefits = np.zeros((n_scenarios, n_years))
    premiums = np.zeros((n_scenarios, n_years))
    expenses = np.zeros((n_scenarios, n_years))

    # Get policy parameters
    face_amount = policy_data.get("face_amount", 100000)
    annual_premium = policy_data.get("annual_premium", 1000)
    issue_age = policy_data.get("issue_age", 45)
    cash_value_rate = policy_data.get("cash_value_rate", 0.02)

    # Apply mortality/lapse volatility
    mortality_vol = 0.10
    lapse_vol = 0.15

    np.random.seed(42)
    mortality_shocks = np.random.lognormal(0, mortality_vol, (n_scenarios, n_years))
    lapse_shocks = np.random.lognormal(0, lapse_vol, (n_scenarios, n_years))

    # Calculate in-force progression
    in_force = np.ones((n_scenarios, n_years + 1))

    for t in range(n_years):
        age = issue_age + t
        if age > 120:
            break

        # Apply shocked rates
        q_x = mortality_rates[min(age, len(mortality_rates) - 1)] * mortality_shocks[:, t]
        lapse = lapse_rates[min(t, len(lapse_rates) - 1)] * lapse_shocks[:, t]

        # Deaths
        deaths = in_force[:, t] * q_x
        death_benefits[:, t] = deaths * face_amount

        # Lapses (of survivors)
        survivors = in_force[:, t] - deaths
        lapses = survivors * lapse
        cash_value = face_amount * (1 - np.exp(-cash_value_rate * t))
        surrender_benefits[:, t] = lapses * cash_value

        # Premiums from continuing policies
        continuing = survivors - lapses
        premiums[:, t] = continuing * annual_premium

        # Expenses (maintenance + claims processing)
        expenses[:, t] = continuing * 50 + deaths * 200 + lapses * 100

        # Update in-force
        in_force[:, t + 1] = continuing

    # Net cash flow = Benefits + Expenses - Premiums
    net_cashflows = death_benefits + surrender_benefits + expenses - premiums

    return net_cashflows


def calculate_present_value(
    cashflows: np.ndarray,
    discount_factors: np.ndarray
) -> np.ndarray:
    """
    Calculate present value of cash flows.

    Args:
        cashflows: (n_scenarios, n_years) array
        discount_factors: (n_scenarios, n_years+1) array

    Returns:
        Array of shape (n_scenarios,) with PV for each scenario
    """
    # Align discount factors with cash flow timing (end of year)
    df = discount_factors[:, 1:]  # Skip t=0
    n_years = min(cashflows.shape[1], df.shape[1])

    pv = np.sum(cashflows[:, :n_years] * df[:, :n_years], axis=1)
    return pv


def calculate_stochastic_risk_adjustment(
    portfolio: List[Dict],
    assumptions: Dict,
    config: RiskAdjustmentConfig = None
) -> Dict[str, Any]:
    """
    Calculate Risk Adjustment using full stochastic simulation.

    IFRS 17.37: Risk adjustment for non-financial risk reflects
    compensation for bearing uncertainty about amount and timing
    of cash flows from non-financial risk.

    Args:
        portfolio: List of policy dictionaries
        assumptions: Calculation assumptions
        config: Stochastic simulation configuration

    Returns:
        Dictionary with:
        - risk_adjustment: Calibrated RA at confidence level
        - confidence_level: Target confidence level
        - expected_pv: Expected PV of liabilities
        - percentile_pv: PV at confidence percentile
        - distribution_stats: Statistical summary
        - scenario_pvs: All scenario PVs for analysis
    """
    if config is None:
        config = RiskAdjustmentConfig()

    # Generate economic scenarios
    esg_config = ESGConfig(
        n_scenarios=config.n_simulations,
        n_years=50,
        seed=config.seed
    )
    esg = EconomicScenarioGenerator(esg_config)
    scenarios = esg.generate_scenarios()

    # Get mortality and lapse tables
    mortality_rates = assumptions.get("mortality_rates", np.array([0.001 * (1.05 ** i) for i in range(121)]))
    lapse_rates = assumptions.get("lapse_rates", np.array([0.08, 0.06, 0.05, 0.04, 0.03] + [0.02] * 45))

    # Simulate cash flows for each policy
    all_pvs = []

    with ProcessPoolExecutor(max_workers=config.n_workers) as executor:
        futures = []
        for policy in portfolio:
            future = executor.submit(
                simulate_and_value_policy,
                policy,
                mortality_rates,
                lapse_rates,
                scenarios
            )
            futures.append(future)

        for future in futures:
            policy_pvs = future.result()
            all_pvs.append(policy_pvs)

    # Aggregate portfolio PVs across scenarios
    portfolio_pvs = np.sum(all_pvs, axis=0)

    # Calculate statistics
    expected_pv = np.mean(portfolio_pvs)
    percentile_pv = np.percentile(portfolio_pvs, config.confidence_level * 100)

    # Risk Adjustment = Percentile - Expected
    risk_adjustment = percentile_pv - expected_pv

    return {
        "risk_adjustment": float(risk_adjustment),
        "confidence_level": config.confidence_level,
        "expected_pv": float(expected_pv),
        "percentile_pv": float(percentile_pv),
        "ra_as_percent_bel": float(risk_adjustment / abs(expected_pv)) if expected_pv != 0 else 0,
        "distribution_stats": {
            "mean": float(np.mean(portfolio_pvs)),
            "std": float(np.std(portfolio_pvs)),
            "skewness": float(stats.skew(portfolio_pvs)),
            "kurtosis": float(stats.kurtosis(portfolio_pvs)),
            "min": float(np.min(portfolio_pvs)),
            "max": float(np.max(portfolio_pvs)),
            "percentiles": {
                "1st": float(np.percentile(portfolio_pvs, 1)),
                "5th": float(np.percentile(portfolio_pvs, 5)),
                "25th": float(np.percentile(portfolio_pvs, 25)),
                "50th": float(np.percentile(portfolio_pvs, 50)),
                "75th": float(np.percentile(portfolio_pvs, 75)),
                "95th": float(np.percentile(portfolio_pvs, 95)),
                "99th": float(np.percentile(portfolio_pvs, 99)),
            }
        },
        "n_simulations": config.n_simulations,
        "methodology": "Full stochastic simulation with correlated economic scenarios",
    }


def simulate_and_value_policy(
    policy: Dict,
    mortality_rates: np.ndarray,
    lapse_rates: np.ndarray,
    scenarios: Dict[str, np.ndarray]
) -> np.ndarray:
    """Simulate cash flows and calculate PV for a single policy."""
    cashflows = simulate_insurance_cashflows(
        policy,
        mortality_rates,
        lapse_rates,
        scenarios
    )

    pvs = calculate_present_value(cashflows, scenarios["discount_factors"])
    return pvs


# Import scipy for stats
from scipy import stats
```

### 7.3 QRT Report Generator

**File:** `actuarial-engine/reports/qrt_generator.py` (CREATE)

```python
"""
Solvency II Quantitative Reporting Templates (QRT) Generator
Generates standardized regulatory reports per EIOPA specifications.

Supported templates:
- S.02.01: Balance Sheet
- S.05.01: Premiums, Claims and Expenses
- S.12.01: Life Technical Provisions
- S.22.01: Impact of LTG measures
- S.25.01: SCR (Standard Formula)
- S.28.01: MCR (Life)
"""

from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from datetime import datetime
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Border, Side, Alignment


@dataclass
class QRTContext:
    """Context for QRT generation."""
    reporting_date: datetime
    entity_name: str
    lei_code: str
    currency: str = "EUR"
    solo_or_group: str = "Solo"


class QRTGenerator:
    """
    Generate Solvency II QRT reports.

    Usage:
        generator = QRTGenerator(calculation_results, context)
        workbook = generator.generate_all()
        workbook.save("qrt_report.xlsx")
    """

    def __init__(
        self,
        calculation_results: Dict[str, Any],
        context: QRTContext
    ):
        self.results = calculation_results
        self.context = context
        self._setup_styles()

    def _setup_styles(self):
        """Setup Excel styles for QRT formatting."""
        self.header_fill = PatternFill(start_color="4472C4", end_color="4472C4", fill_type="solid")
        self.header_font = Font(color="FFFFFF", bold=True)
        self.border = Border(
            left=Side(style="thin"),
            right=Side(style="thin"),
            top=Side(style="thin"),
            bottom=Side(style="thin")
        )

    def generate_all(self) -> Workbook:
        """Generate all QRT templates."""
        wb = Workbook()

        # Remove default sheet
        wb.remove(wb.active)

        # Generate each template
        self._generate_s02_01(wb)
        self._generate_s12_01(wb)
        self._generate_s25_01(wb)
        self._generate_s28_01(wb)

        return wb

    def _generate_s02_01(self, wb: Workbook) -> None:
        """
        S.02.01 - Balance Sheet
        """
        ws = wb.create_sheet("S.02.01")

        # Header
        ws["A1"] = "S.02.01.01"
        ws["A2"] = "Balance sheet"
        ws["A3"] = f"Reporting date: {self.context.reporting_date.strftime('%Y-%m-%d')}"
        ws["A4"] = f"Entity: {self.context.entity_name}"

        # Column headers
        headers = ["Item", "Solvency II value", "Statutory accounts value"]
        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=6, column=col, value=header)
            cell.fill = self.header_fill
            cell.font = self.header_font
            cell.border = self.border

        # Assets
        assets = [
            ("Assets", "", ""),
            ("Intangible assets", 0, 0),
            ("Deferred tax assets", 0, 0),
            ("Pension benefit surplus", 0, 0),
            ("Property, plant & equipment", 0, 0),
            ("Investments", self.results.get("total_assets", 0), 0),
            ("  - Property", 0, 0),
            ("  - Holdings in related undertakings", 0, 0),
            ("  - Equities", 0, 0),
            ("  - Bonds", 0, 0),
            ("  - Collective Investments Undertakings", 0, 0),
            ("  - Derivatives", 0, 0),
            ("  - Deposits other than cash equivalents", 0, 0),
            ("Loans and mortgages", 0, 0),
            ("Reinsurance recoverables", 0, 0),
            ("Receivables", 0, 0),
            ("Cash and cash equivalents", 0, 0),
            ("Any other assets", 0, 0),
            ("Total assets", self.results.get("total_assets", 0), 0),
        ]

        for row, (item, sii_value, stat_value) in enumerate(assets, 7):
            ws.cell(row=row, column=1, value=item).border = self.border
            ws.cell(row=row, column=2, value=sii_value).border = self.border
            ws.cell(row=row, column=3, value=stat_value).border = self.border

        # Liabilities
        liabilities_start = len(assets) + 8
        liabilities = [
            ("Liabilities", "", ""),
            ("Technical provisions - life", self.results.get("technical_provisions", 0), 0),
            ("  - Best Estimate", self.results.get("best_estimate", 0), 0),
            ("  - Risk margin", self.results.get("risk_margin", 0), 0),
            ("Other liabilities", 0, 0),
            ("Total liabilities", self.results.get("total_liabilities", 0), 0),
            ("", "", ""),
            ("Excess of assets over liabilities", self.results.get("own_funds", 0), 0),
        ]

        for row, (item, sii_value, stat_value) in enumerate(liabilities, liabilities_start):
            ws.cell(row=row, column=1, value=item).border = self.border
            ws.cell(row=row, column=2, value=sii_value).border = self.border
            ws.cell(row=row, column=3, value=stat_value).border = self.border

    def _generate_s12_01(self, wb: Workbook) -> None:
        """
        S.12.01 - Life Technical Provisions
        """
        ws = wb.create_sheet("S.12.01")

        ws["A1"] = "S.12.01.02"
        ws["A2"] = "Life and Health SLT Technical Provisions"

        # Headers
        headers = [
            "Line of Business",
            "Insurance with profit participation",
            "Index-linked and unit-linked",
            "Other life insurance",
            "Health insurance",
            "Total (Life other than health)"
        ]

        for col, header in enumerate(headers, 1):
            cell = ws.cell(row=4, column=col, value=header)
            cell.fill = self.header_fill
            cell.font = self.header_font
            cell.border = self.border

        # Data rows
        tp_data = self.results.get("technical_provisions_breakdown", {})

        rows = [
            ("Technical provisions calculated as a whole", 0, 0, 0, 0, 0),
            ("Total Recoverables from reinsurance", 0, 0, 0, 0, 0),
            ("Best Estimate", 0, 0,
             tp_data.get("other_life_be", self.results.get("best_estimate", 0)), 0,
             self.results.get("best_estimate", 0)),
            ("Risk Margin", 0, 0,
             tp_data.get("other_life_rm", self.results.get("risk_margin", 0)), 0,
             self.results.get("risk_margin", 0)),
            ("Technical Provisions - Total", 0, 0,
             tp_data.get("other_life_total", self.results.get("technical_provisions", 0)), 0,
             self.results.get("technical_provisions", 0)),
        ]

        for row_num, row_data in enumerate(rows, 5):
            for col, value in enumerate(row_data, 1):
                cell = ws.cell(row=row_num, column=col, value=value)
                cell.border = self.border

    def _generate_s25_01(self, wb: Workbook) -> None:
        """
        S.25.01 - SCR for undertakings using Standard Formula
        """
        ws = wb.create_sheet("S.25.01")

        ws["A1"] = "S.25.01.01"
        ws["A2"] = "Solvency Capital Requirement - for undertakings on Standard Formula"

        # Headers
        ws.cell(row=4, column=1, value="Item").fill = self.header_fill
        ws.cell(row=4, column=2, value="Gross solvency capital requirement").fill = self.header_fill
        ws.cell(row=4, column=3, value="USP").fill = self.header_fill
        ws.cell(row=4, column=4, value="Simplifications").fill = self.header_fill

        scr_components = self.results.get("scr_components", {})

        rows = [
            ("Market risk", scr_components.get("market_risk", 0), "None", "None"),
            ("Counterparty default risk", scr_components.get("counterparty_risk", 0), "None", "None"),
            ("Life underwriting risk", scr_components.get("life_underwriting_risk", 0), "None", "None"),
            ("Health underwriting risk", scr_components.get("health_risk", 0), "None", "None"),
            ("Non-life underwriting risk", scr_components.get("non_life_risk", 0), "None", "None"),
            ("Diversification", -scr_components.get("diversification_benefit", 0), "", ""),
            ("Intangible asset risk", 0, "", ""),
            ("Basic Solvency Capital Requirement", scr_components.get("basic_scr", 0), "", ""),
            ("", "", "", ""),
            ("Operational risk", scr_components.get("operational_risk", 0), "", ""),
            ("Loss-absorbing capacity of technical provisions", 0, "", ""),
            ("Loss-absorbing capacity of deferred taxes", scr_components.get("lac_dt", 0), "", ""),
            ("", "", "", ""),
            ("Solvency Capital Requirement", self.results.get("total_scr", 0), "", ""),
        ]

        for row_num, row_data in enumerate(rows, 5):
            for col, value in enumerate(row_data, 1):
                cell = ws.cell(row=row_num, column=col, value=value)
                cell.border = self.border
                if row_data[0] in ["Basic Solvency Capital Requirement", "Solvency Capital Requirement"]:
                    cell.font = Font(bold=True)

    def _generate_s28_01(self, wb: Workbook) -> None:
        """
        S.28.01 - Minimum Capital Requirement (Life)
        """
        ws = wb.create_sheet("S.28.01")

        ws["A1"] = "S.28.01.01"
        ws["A2"] = "Minimum Capital Requirement - Only life or only non-life insurance activity"

        mcr = self.results.get("mcr", 0)
        scr = self.results.get("total_scr", 0)

        rows = [
            ("Linear MCR", mcr * 0.8),  # Simplified
            ("SCR", scr),
            ("MCR cap", scr * 0.45),
            ("MCR floor", scr * 0.25),
            ("Combined MCR", mcr),
            ("Absolute floor of the MCR", 3700000),  # EUR 3.7M for life insurers
            ("Minimum Capital Requirement", max(mcr, 3700000)),
        ]

        for row_num, (item, value) in enumerate(rows, 4):
            ws.cell(row=row_num, column=1, value=item).border = self.border
            ws.cell(row=row_num, column=2, value=value).border = self.border

    def export_to_xbrl(self) -> str:
        """Export QRT data in XBRL format (placeholder)."""
        # XBRL export would require additional library
        raise NotImplementedError("XBRL export not yet implemented")
```

---

## 9. Phase 4: Enterprise Scale

### 8.1 Multi-Tenant Architecture

See detailed implementation in Phase 4 section of the original plan.

### 8.2 Kubernetes Deployment

**File:** `k8s/deployment.yaml` (CREATE)

```yaml
# Kubernetes deployment configuration for Valuact

apiVersion: apps/v1
kind: Deployment
metadata:
  name: actuarial-engine
  labels:
    app: valuact
    component: actuarial-engine
spec:
  replicas: 3
  selector:
    matchLabels:
      app: valuact
      component: actuarial-engine
  template:
    metadata:
      labels:
        app: valuact
        component: actuarial-engine
    spec:
      containers:
        - name: actuarial-engine
          image: gcr.io/valuact/actuarial-engine:latest
          ports:
            - containerPort: 8000
          resources:
            requests:
              memory: "2Gi"
              cpu: "1000m"
            limits:
              memory: "8Gi"
              cpu: "4000m"
          env:
            - name: LOG_LEVEL
              value: "info"
          livenessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /health
              port: 8000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: actuarial-engine-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: actuarial-engine
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

---

## 10. Phase 5: Market Leader (Year 2)

### Target Capabilities

1. **Internal Model Support** - Full Solvency II internal model capabilities
2. **Multi-Jurisdiction** - UK Solvency II, APAC (LAGIC, RBC), Americas (RBC)
3. **Real-Time Dashboard** - Executive KPI monitoring
4. **API Marketplace** - Third-party integrations
5. **Mobile App** - Executive reporting on mobile

### Product Roadmap Summary

```
Year 1 (Current Plan)
├── Q1: Foundation & Integration
├── Q2: Core Platform Completion
├── Q3: Advanced Analytics
└── Q4: Enterprise Scale

Year 2
├── Q1: Internal Models
├── Q2: Multi-Jurisdiction
├── Q3: Advanced Reporting
└── Q4: Platform Expansion
```

---

## 11. New Feature Recommendations

> These features would significantly enhance Valuact's competitive position

### 11.1 High-Value Features (Recommended)

#### Portfolio Comparison Tool
**Value:** Actuaries frequently need to understand what changed between calculation runs

```
Prompt for Cursor:
"Create a portfolio comparison feature that allows users to select two
calculations and view a side-by-side comparison of all metrics. Include:
- Waterfall chart showing drivers of change
- Table with metric deltas and percentage changes
- Assumption diff viewer highlighting what changed
- Drill-down to policy level differences
- Export comparison report to PDF"
```

**Implementation:** New route `/comparisons`, component `ComparisonView.jsx`

#### Assumption Library
**Value:** Ensures consistency across calculations, enables scenario analysis

```
Prompt for Cursor:
"Implement an assumption library feature where users can:
- Create named assumption sets (e.g., 'Base 2024', 'Adverse Scenario')
- Version assumption sets with full change history
- Lock assumption sets for audit purposes (immutable after lock)
- Select from library when running calculations
- Compare two assumption sets side-by-side
- Import/export assumption sets as JSON"
```

**Implementation:** Firestore collection `assumptionSets`, UI in `/settings/assumptions`

#### Automated Reconciliation
**Value:** Critical for audit trail and validation against external systems

```
Prompt for Cursor:
"Build a reconciliation module that allows users to:
- Upload results from external systems (Prophet, AXIS, Excel)
- Auto-map fields between systems using column matching
- Run automated comparison at policy and aggregate levels
- Flag material differences exceeding configurable threshold (default 1%)
- Generate reconciliation report with difference explanations
- Track reconciliation history over time"
```

**Implementation:** New service `reconciliationService.js`, UI at `/reconciliation`

#### What-If Scenario Builder
**Value:** Quick exploration of assumption impacts with real-time feedback

```
Prompt for Cursor:
"Create an interactive What-If scenario builder with:
- Sliders for key assumptions (discount rate ±200bps, lapse ±50%, mortality ±20%)
- Debounced real-time recalculation (300ms delay)
- Live updating charts showing CSM/SCR impact as sliders move
- Ability to save and name custom scenarios
- Compare up to 4 scenarios on single chart
- Use simplified calculation model for sub-second response"
```

**Implementation:** Component `WhatIfBuilder.jsx`, simplified calc endpoint

#### Regulatory Deadline Tracker
**Value:** Ensures timely regulatory submissions, reduces compliance risk

```
Prompt for Cursor:
"Implement a regulatory deadline tracker dashboard showing:
- Calendar view with QRT/ORSA submission dates (configurable per jurisdiction)
- Status tracker: Not Started → In Progress → Under Review → Submitted
- Countdown timer to next deadline with color coding (green/yellow/red)
- Checklist of required calculations per submission type
- Email/in-app notifications at 14, 7, 3, 1 days before deadline
- Historical submission log with timestamps"
```

**Implementation:** Dashboard widget, Firestore `deadlines` collection

### 11.2 Medium-Value Features

#### Batch Upload & Processing
**Value:** Efficiency for multi-entity insurance groups

```
Prompt for Cursor:
"Add batch processing capability:
- Upload multiple CSV/Excel files via drag-drop zone
- Queue all portfolios for parallel processing
- Show progress dashboard with per-portfolio status
- Aggregate results across all portfolios
- Download all results as single ZIP file
- Graceful error handling (one failure doesn't stop batch)"
```

#### Calculation Templates
**Value:** Reduces setup time for recurring quarterly/annual calculations

```
Prompt for Cursor:
"Implement calculation templates:
- Save current calculator configuration as named template
- Include assumptions, options, report preferences
- One-click load template to pre-fill all fields
- Share templates across organization (with permissions)
- Template versioning with changelog
- Default templates for common scenarios (Q-close, Y-end, Stress)"
```

#### Advanced Visualization Dashboard
**Value:** Executive-level insights without actuarial expertise

```
Prompt for Cursor:
"Create an executive analytics dashboard with:
- CSM waterfall chart by cohort year
- SCR treemap visualization by risk module
- Time series of key metrics (CSM, SCR, Solvency Ratio) over quarters
- Geographic breakdown if multi-region portfolio
- Click-to-drill-down on any chart element
- Export entire dashboard as PDF or PowerPoint
- Auto-refresh option for live monitoring"
```

#### Peer Review Workflow
**Value:** Implements four-eyes principle required by regulations

```
Prompt for Cursor:
"Implement a peer review workflow for calculations:
- Submit calculation for review (changes status to 'Pending Review')
- Reviewer dashboard showing pending items
- Approve, Reject, or Request Changes actions
- Comment thread on specific results or assumptions
- Full audit trail of all review actions
- Lock results after final approval (no further edits)
- Configurable approval chain (1 or 2 approvers)"
```

#### Natural Language Query (AI-Enhanced)
**Value:** Makes platform accessible to non-actuaries, speeds up analysis

```
Prompt for Cursor:
"Extend AxiomAI to answer data questions about calculation results:
- 'What is the CSM for cohort 2022?'
- 'Why did SCR increase compared to last quarter?'
- 'Which policies have loss components greater than 10000?'
- 'Show me top 10 policies by risk adjustment'
- 'Compare current quarter to previous quarter'
Use calculation results as context, structured query generation"
```

### 11.3 Lower-Priority Features (Backlog)

| Feature | Description | Complexity |
|---------|-------------|------------|
| Mobile Companion | View KPIs on mobile, push notifications | Medium |
| API Playground | Interactive API docs with try-it-now | Low |
| Audit Report Generator | One-click comprehensive audit package | Medium |
| Multi-Currency Support | FX rates, currency risk in SCR | High |
| Integration Connectors | Connect to policy admin, GL systems | High |
| Portfolio Optimization | What portfolio changes improve metrics | Very High |
| Monte Carlo UI | Visualize stochastic simulation results | High |

---

## 12. Technical Excellence Standards

### Code Quality Requirements

| Metric | Target | Tool |
|--------|--------|------|
| Test Coverage | >80% | pytest-cov, vitest |
| Type Safety | 100% | mypy, TypeScript |
| Linting | 0 errors | ruff, ESLint |
| Documentation | All public APIs | Sphinx, JSDoc |
| Security | 0 critical/high | Snyk, npm audit |

### Performance Requirements

| Metric | Target |
|--------|--------|
| Single policy calculation | <100ms |
| 1,000 policy portfolio | <5s |
| 100,000 policy portfolio | <60s |
| 1M policy portfolio | <10min (async) |
| API response time (P95) | <200ms |
| Uptime | 99.9% |

---

## 13. Quality Assurance Framework

### Testing Pyramid

```
                    ┌───────────┐
                    │    E2E    │  (10%)
                    │   Tests   │
                 ┌──┴───────────┴──┐
                 │  Integration    │  (30%)
                 │     Tests       │
              ┌──┴─────────────────┴──┐
              │      Unit Tests       │  (60%)
              │                       │
              └───────────────────────┘
```

### Actuarial Validation

All calculations must be validated against:

1. **Spreadsheet models** - Excel/actuarial model comparison
2. **Published examples** - IFRS 17 TRG examples, EIOPA guidance
3. **Third-party tools** - Cross-validation with Prophet/AXIS where possible
4. **Peer review** - All calculation changes reviewed by qualified actuary

---

## 14. Security & Compliance

### Data Protection

- **Encryption at rest:** AES-256
- **Encryption in transit:** TLS 1.3
- **Access control:** RBAC with audit logging
- **Data residency:** EU data center options

### Regulatory Compliance

- **GDPR:** Data processing agreements, right to erasure
- **SOC 2 Type II:** Annual audit
- **ISO 27001:** Information security management

---

## 15. Performance Benchmarks

### Calculation Performance Targets

| Portfolio Size | IFRS 17 | Solvency II |
|----------------|---------|-------------|
| 100 policies | <1s | <1s |
| 1,000 policies | <5s | <5s |
| 10,000 policies | <30s | <30s |
| 100,000 policies | <3min | <3min |
| 1,000,000 policies | <15min | <15min |

---

## 16. Implementation Guide

### Getting Started

```bash
# Clone repository
git clone https://github.com/valuact/valuact.git
cd valuact

# Install dependencies
npm install

# Start development environment
docker-compose up -d
npm run dev

# Run tests
npm test
cd actuarial-engine && pytest
```

### Development Workflow

1. Create feature branch from `main`
2. Implement with tests
3. Run full test suite
4. Create PR with description
5. Code review (actuarial + engineering)
6. Merge after approval

---

*Document Version: 1.0.0*
*Last Updated: December 2024*
*Confidential - Valuact Internal*
