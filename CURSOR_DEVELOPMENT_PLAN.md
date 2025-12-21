# Valuact Development Plan for Cursor AI

> **Last Updated:** December 2024
> **Platform:** Actuarial Solutions for Life Insurers
> **Tech Stack:** Python FastAPI + Next.js 16 + React 19 + Node.js Express + Firebase

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Current Implementation Status](#2-current-implementation-status)
3. [Phase 1: Critical Integration (Week 1-2)](#3-phase-1-critical-integration)
4. [Phase 2: Core Feature Completion (Week 3-4)](#4-phase-2-core-feature-completion)
5. [Phase 3: Advanced Analytics (Week 5-6)](#5-phase-3-advanced-analytics)
6. [Phase 4: Enterprise Features (Week 7-8)](#6-phase-4-enterprise-features)
7. [Phase 5: Performance & Scale (Week 9-10)](#7-phase-5-performance--scale)
8. [Coding Standards & Best Practices](#8-coding-standards--best-practices)
9. [Testing Strategy](#9-testing-strategy)
10. [File Reference Guide](#10-file-reference-guide)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Next.js 16)                       │
│  Port: 3000 | React 19 | Tailwind | App Router                  │
├─────────────────────────────────────────────────────────────────┤
│  /calculators/ifrs17  │  /calculators/solvency  │  /axiomai    │
│  /valuations          │  /data                   │  /methodology │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP/REST
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER (Node.js Express)                     │
│  Port: 3001 | Firebase Admin | Gemini AI | JWT Auth             │
├─────────────────────────────────────────────────────────────────┤
│  /api/calculations  │  /api/data  │  /api/chat  │  /api/auth   │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP/REST
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   ACTUARIAL ENGINE (Python FastAPI)              │
│  Port: 8000 | NumPy/Pandas | Pydantic | Vectorized Calcs        │
├─────────────────────────────────────────────────────────────────┤
│  /api/v1/calculate/ifrs17  │  /api/v1/calculate/solvency        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FIREBASE FIRESTORE                          │
│  Users | Calculations | Portfolios | Audit Logs                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Current Implementation Status

### ✅ Fully Implemented

| Component | File | Status |
|-----------|------|--------|
| IFRS 17 CSM Calculations | `actuarial-engine/calculations/ifrs17.py` | Complete (781 lines) |
| Solvency II SCR Framework | `actuarial-engine/calculations/solvency.py` | Complete (684 lines) |
| Mortality Tables | `actuarial-engine/data/mortality_tables.py` | CSO 2017, 2001, GAM 1994 |
| Request/Response Models | `actuarial-engine/models/*.py` | Pydantic validation |
| Audit Logging | `actuarial-engine/utils/audit_logger.py` | Full audit trail |
| IFRS 17 Calculator UI | `client/src/components/calculators/IFRS17Calculator.jsx` | Functional |
| Solvency Calculator UI | `client/src/components/calculators/SolvencyCalculator.jsx` | Functional |
| Firebase Auth | `server/routes/auth.js` | JWT + Firebase |
| Gemini AI Chat | `server/index.js` | AxiomAI persona |

### ⚠️ Partially Implemented

| Component | Location | Gap |
|-----------|----------|-----|
| Backend → Python Integration | `server/routes/calculations.js` | Not connected to FastAPI |
| Data Management → Calculations | `server/routes/dataManagement.js` | TODO: IFRS 17 computation |
| Calculation Status Tracking | `server/controllers/calculationController.js` | No real-time updates |
| Sensitivity Analysis UI | `client/src/components/calculators/*.jsx` | Backend not connected |

### ❌ Not Implemented

- Real-time WebSocket updates for long calculations
- Batch calculation queue processing
- Portfolio comparison reports
- Monte Carlo simulation for Risk Adjustment
- Multi-currency support
- Regulatory reporting templates (QRT/ORD)

---

## 3. Phase 1: Critical Integration

**Priority:** P0 - Blocking
**Goal:** Connect all three tiers (Client ↔ Server ↔ Python Engine)

### Task 1.1: Backend → Python Engine Connection

**File:** `server/services/pythonEngineService.js` (CREATE)

```javascript
// Create a new service to communicate with Python FastAPI
const axios = require('axios');

const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';

class PythonEngineService {
  async calculateIFRS17(portfolio, assumptions) {
    const response = await axios.post(
      `${PYTHON_ENGINE_URL}/api/v1/calculate/ifrs17`,
      { policies: portfolio, assumptions },
      { timeout: 120000 } // 2 minute timeout for large portfolios
    );
    return response.data;
  }

  async calculateSolvency(portfolio, assumptions) {
    const response = await axios.post(
      `${PYTHON_ENGINE_URL}/api/v1/calculate/solvency`,
      { policies: portfolio, assumptions },
      { timeout: 120000 }
    );
    return response.data;
  }

  async healthCheck() {
    const response = await axios.get(`${PYTHON_ENGINE_URL}/health`);
    return response.data;
  }
}

module.exports = new PythonEngineService();
```

**Update:** `server/controllers/calculationController.js`

```javascript
// Replace stub implementation with actual Python engine calls
const pythonEngine = require('../services/pythonEngineService');

exports.startCalculation = async (req, res) => {
  const { calculationType, portfolio, assumptions } = req.body;

  try {
    let result;
    if (calculationType === 'ifrs17') {
      result = await pythonEngine.calculateIFRS17(portfolio, assumptions);
    } else if (calculationType === 'solvency') {
      result = await pythonEngine.calculateSolvency(portfolio, assumptions);
    }

    // Store result in Firestore with audit trail
    await firestoreService.saveCalculation(req.user.uid, {
      type: calculationType,
      input: { portfolio, assumptions },
      result,
      timestamp: new Date().toISOString()
    });

    return res.json(result);
  } catch (error) {
    // Handle timeout, validation errors, etc.
  }
};
```

### Task 1.2: Environment Configuration

**File:** `server/.env` (UPDATE)

```env
# Python Engine
PYTHON_ENGINE_URL=http://localhost:8000

# For production (Google Cloud Run)
# PYTHON_ENGINE_URL=https://actuarial-engine-xxxxx.run.app
```

**File:** `.env.example` (UPDATE)

```env
# Add Python engine configuration
PYTHON_ENGINE_URL=http://localhost:8000
```

### Task 1.3: Data Management → Calculation Pipeline

**File:** `server/routes/dataManagement.js` (UPDATE)

Find the TODO comment and implement:

```javascript
// CURRENT (line ~150):
// TODO: Implement actual IFRS 17 computation

// REPLACE WITH:
const pythonEngine = require('../services/pythonEngineService');

router.post('/calculate', authenticateToken, async (req, res) => {
  const { portfolioId, calculationType, assumptions } = req.body;

  // 1. Retrieve portfolio from Firestore
  const portfolio = await firestoreService.getPortfolio(req.user.uid, portfolioId);

  // 2. Transform to Python engine format
  const policies = portfolio.policies.map(p => ({
    policy_id: p.policyId,
    issue_date: p.issueDate,
    face_amount: p.faceAmount,
    premium: p.premium,
    policy_type: p.policyType,
    gender: p.gender,
    issue_age: p.issueAge,
    sum_assured: p.sumAssured,
    premium_term: p.premiumTerm
  }));

  // 3. Call Python engine
  const result = await pythonEngine.calculateIFRS17(policies, assumptions);

  // 4. Store and return result
  return res.json(result);
});
```

### Task 1.4: Client API Integration

**File:** `client/src/utils/api.js` (CREATE)

```javascript
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const calculations = {
  runIFRS17: (portfolio, assumptions) =>
    api.post('/api/calculations/start', {
      calculationType: 'ifrs17',
      portfolio,
      assumptions
    }),

  runSolvency: (portfolio, assumptions) =>
    api.post('/api/calculations/start', {
      calculationType: 'solvency',
      portfolio,
      assumptions
    }),

  getHistory: () => api.get('/api/calculations/history'),

  getResult: (calculationId) =>
    api.get(`/api/calculations/${calculationId}/results`),
};

export const data = {
  uploadPortfolio: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/data-management/upload', formData);
  },

  getPortfolios: () => api.get('/api/data'),
};

export default api;
```

### Task 1.5: Update Calculator Components

**File:** `client/src/components/calculators/IFRS17Calculator.jsx` (UPDATE)

```javascript
// Add import
import { calculations } from '../../utils/api';

// Update the calculate function to use backend
const handleCalculate = async () => {
  setLoading(true);
  setError(null);

  try {
    // For portfolio calculations, use backend
    if (portfolio && portfolio.length > 0) {
      const response = await calculations.runIFRS17(portfolio, {
        discount_rate: discountRate,
        lapse_rate: lapseRate,
        mortality_table: mortalityTable,
        expense_inflation: expenseInflation,
        risk_adjustment_factor: riskAdjustmentFactor,
        expense_loading: expenseLoading,
        tax_rate: taxRate,
      });

      setResults(response.data);
      setAuditTrail(response.data.audit_trail);
    } else {
      // For single policy demo, use local calculation
      const localResult = calculateCSM(premium, fcf, riskAdjustment);
      setResults({ csm: localResult });
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Calculation failed');
  } finally {
    setLoading(false);
  }
};
```

---

## 4. Phase 2: Core Feature Completion

**Priority:** P1 - Important
**Goal:** Complete all calculator features and data management

### Task 2.1: Real-Time Calculation Status

**File:** `server/services/calculationQueueService.js` (CREATE)

```javascript
// Implement job queue for long-running calculations
const Queue = require('bull');
const pythonEngine = require('./pythonEngineService');
const firestoreService = require('./firestoreService');

const calculationQueue = new Queue('calculations', {
  redis: process.env.REDIS_URL || 'redis://localhost:6379'
});

calculationQueue.process(async (job) => {
  const { userId, calculationType, portfolio, assumptions } = job.data;

  // Update status to processing
  await firestoreService.updateCalculationStatus(job.id, 'processing');

  try {
    let result;
    if (calculationType === 'ifrs17') {
      result = await pythonEngine.calculateIFRS17(portfolio, assumptions);
    } else {
      result = await pythonEngine.calculateSolvency(portfolio, assumptions);
    }

    // Store result
    await firestoreService.saveCalculationResult(job.id, result);
    await firestoreService.updateCalculationStatus(job.id, 'completed');

    return result;
  } catch (error) {
    await firestoreService.updateCalculationStatus(job.id, 'failed', error.message);
    throw error;
  }
});

module.exports = {
  addJob: (data) => calculationQueue.add(data),
  getJob: (jobId) => calculationQueue.getJob(jobId),
};
```

### Task 2.2: WebSocket for Real-Time Updates

**File:** `server/websocket.js` (CREATE)

```javascript
const { Server } = require('socket.io');

let io;

const initializeWebSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('subscribe:calculation', (calculationId) => {
      socket.join(`calculation:${calculationId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const emitCalculationUpdate = (calculationId, status, data) => {
  if (io) {
    io.to(`calculation:${calculationId}`).emit('calculation:update', {
      calculationId,
      status,
      data,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = { initializeWebSocket, emitCalculationUpdate };
```

### Task 2.3: Sensitivity Analysis Implementation

**File:** `client/src/components/calculators/SensitivityAnalysis.jsx` (CREATE)

```jsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { calculations } from '../../utils/api';

export default function SensitivityAnalysis({ portfolio, baseAssumptions }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSensitivityAnalysis = async () => {
    setLoading(true);

    // Define shock scenarios
    const scenarios = [
      { name: 'Base', discount_rate: baseAssumptions.discount_rate },
      { name: '-100bps', discount_rate: baseAssumptions.discount_rate - 0.01 },
      { name: '-50bps', discount_rate: baseAssumptions.discount_rate - 0.005 },
      { name: '+50bps', discount_rate: baseAssumptions.discount_rate + 0.005 },
      { name: '+100bps', discount_rate: baseAssumptions.discount_rate + 0.01 },
    ];

    const scenarioResults = await Promise.all(
      scenarios.map(async (scenario) => {
        const response = await calculations.runIFRS17(portfolio, {
          ...baseAssumptions,
          discount_rate: scenario.discount_rate,
        });
        return {
          scenario: scenario.name,
          csm: response.data.aggregate_results.total_csm,
          fcf: response.data.aggregate_results.total_fcf,
        };
      })
    );

    setResults(scenarioResults);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Sensitivity Analysis</h3>

      <button
        onClick={runSensitivityAnalysis}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Running...' : 'Run Analysis'}
      </button>

      {results && (
        <div className="mt-6">
          <LineChart width={600} height={300} data={results}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="scenario" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Legend />
            <Line type="monotone" dataKey="csm" stroke="#3B82F6" name="CSM" />
            <Line type="monotone" dataKey="fcf" stroke="#10B981" name="FCF" />
          </LineChart>
        </div>
      )}
    </div>
  );
}
```

### Task 2.4: Stress Testing UI

**File:** `client/src/components/calculators/StressTestPanel.jsx` (CREATE)

```jsx
import React, { useState } from 'react';
import { calculations } from '../../utils/api';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const STRESS_SCENARIOS = [
  {
    id: 'market_crash',
    name: 'Market Crash',
    description: '30% equity decline, 100bps rate increase',
    shocks: { equity_shock: -0.30, rate_shock: 0.01 }
  },
  {
    id: 'mortality_cat',
    name: 'Mortality Catastrophe',
    description: '150% mortality spike for 1 year',
    shocks: { mortality_shock: 1.5 }
  },
  {
    id: 'lapse_crisis',
    name: 'Mass Lapse Event',
    description: '50% lapse rate increase',
    shocks: { lapse_shock: 0.5 }
  },
  {
    id: 'combined',
    name: 'Combined Stress',
    description: 'All risks materialize simultaneously',
    shocks: { equity_shock: -0.20, rate_shock: 0.005, mortality_shock: 1.2, lapse_shock: 0.3 }
  }
];

export default function StressTestPanel({ portfolio, baseResults }) {
  const [stressResults, setStressResults] = useState({});
  const [loading, setLoading] = useState({});

  const runStressTest = async (scenario) => {
    setLoading(prev => ({ ...prev, [scenario.id]: true }));

    try {
      const response = await calculations.runSolvency(portfolio, {
        stress_scenario: scenario.id,
        ...scenario.shocks
      });

      setStressResults(prev => ({
        ...prev,
        [scenario.id]: response.data
      }));
    } finally {
      setLoading(prev => ({ ...prev, [scenario.id]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Stress Testing</h3>

      <div className="grid grid-cols-2 gap-4">
        {STRESS_SCENARIOS.map(scenario => (
          <div key={scenario.id} className="border rounded-lg p-4">
            <h4 className="font-medium">{scenario.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>

            <button
              onClick={() => runStressTest(scenario)}
              disabled={loading[scenario.id]}
              className="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700"
            >
              {loading[scenario.id] ? 'Running...' : 'Run Test'}
            </button>

            {stressResults[scenario.id] && (
              <div className="mt-3 text-sm">
                <div className="flex justify-between">
                  <span>Stressed SCR:</span>
                  <span className="font-mono">
                    {formatCurrency(stressResults[scenario.id].total_scr)}
                  </span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Impact:</span>
                  <span className="font-mono">
                    {formatPercentage(
                      (stressResults[scenario.id].total_scr - baseResults.total_scr) /
                      baseResults.total_scr
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Task 2.5: Enhanced Audit Trail Viewer

**File:** `client/src/components/AuditTrailViewer.jsx` (UPDATE)

```jsx
// Add these features to the existing component:

// 1. Collapsible calculation steps
// 2. Export audit trail to PDF
// 3. Formula version tracking
// 4. Assumption change highlighting

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { ChevronDown, ChevronRight, Download, AlertTriangle } from 'lucide-react';

export default function AuditTrailViewer({ auditTrail }) {
  const [expandedSteps, setExpandedSteps] = useState({});

  const toggleStep = (stepId) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Calculation Audit Trail', 20, 20);
    doc.setFontSize(10);

    let y = 35;
    auditTrail.calculation_steps.forEach((step, idx) => {
      doc.text(`${idx + 1}. ${step.step_name}`, 20, y);
      doc.text(`   Input: ${JSON.stringify(step.inputs)}`, 25, y + 5);
      doc.text(`   Output: ${JSON.stringify(step.outputs)}`, 25, y + 10);
      y += 20;
    });

    doc.save(`audit-trail-${auditTrail.calculation_id}.pdf`);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Audit Trail</h3>
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
        >
          <Download size={16} />
          Export PDF
        </button>
      </div>

      <div className="space-y-2">
        {auditTrail.calculation_steps?.map((step, idx) => (
          <div key={idx} className="border-l-2 border-blue-500 pl-4">
            <button
              onClick={() => toggleStep(idx)}
              className="flex items-center gap-2 w-full text-left"
            >
              {expandedSteps[idx] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span className="font-medium">{step.step_name}</span>
              {step.warnings?.length > 0 && (
                <AlertTriangle size={16} className="text-yellow-500" />
              )}
            </button>

            {expandedSteps[idx] && (
              <div className="mt-2 ml-6 text-sm space-y-1">
                <div><span className="text-gray-500">Formula:</span> {step.formula}</div>
                <div><span className="text-gray-500">Inputs:</span>
                  <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                    {JSON.stringify(step.inputs, null, 2)}
                  </pre>
                </div>
                <div><span className="text-gray-500">Result:</span>
                  <span className="font-mono ml-2">{step.result}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        <div>Formula Version: {auditTrail.formula_version}</div>
        <div>Calculated: {new Date(auditTrail.timestamp).toLocaleString()}</div>
        <div>Engine: {auditTrail.engine_version}</div>
      </div>
    </div>
  );
}
```

---

## 5. Phase 3: Advanced Analytics

**Priority:** P2 - Enhancement
**Goal:** Portfolio analytics, reporting, and visualization

### Task 3.1: Portfolio Analytics Dashboard

**File:** `client/src/app/analytics/page.jsx` (CREATE)

```jsx
'use client';

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { calculations } from '../../utils/api';

export default function AnalyticsDashboard() {
  const [portfolioData, setPortfolioData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState('csm');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    // Fetch aggregated analytics data
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Portfolio Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Total CSM" value={portfolioData?.totalCSM} />
        <KPICard title="Solvency Ratio" value={portfolioData?.solvencyRatio} />
        <KPICard title="Loss Ratio" value={portfolioData?.lossRatio} />
        <KPICard title="Policies" value={portfolioData?.policyCount} />
      </div>

      {/* CSM by Cohort */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">CSM by Cohort Year</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={portfolioData?.cohortBreakdown}>
            <XAxis dataKey="cohort_year" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="csm" fill="#3B82F6" />
            <Bar dataKey="loss_component" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SCR Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">SCR Risk Breakdown</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={portfolioData?.scrBreakdown}
              dataKey="value"
              nameKey="risk_type"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {portfolioData?.scrBreakdown?.map((entry, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function KPICard({ title, value, trend }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-2xl font-bold mt-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
    </div>
  );
}
```

### Task 3.2: Regulatory Reporting Templates

**File:** `actuarial-engine/reports/qrt_generator.py` (CREATE)

```python
"""
Solvency II Quantitative Reporting Templates (QRT) Generator
Generates S.02.01, S.12.01, S.22.01, etc.
"""
from typing import Dict, Any
from datetime import datetime
import pandas as pd

class QRTGenerator:
    """Generates Solvency II QRT reports from calculation results."""

    def __init__(self, calculation_results: Dict[str, Any]):
        self.results = calculation_results
        self.reporting_date = datetime.now()

    def generate_s02_01(self) -> pd.DataFrame:
        """
        S.02.01 - Balance Sheet
        Own funds, technical provisions, SCR
        """
        return pd.DataFrame({
            'Item': [
                'Technical Provisions - Life',
                'Best Estimate',
                'Risk Margin',
                'Own Funds',
                'SCR',
                'MCR',
                'Solvency Ratio'
            ],
            'Value': [
                self.results.get('technical_provisions', 0),
                self.results.get('best_estimate', 0),
                self.results.get('risk_margin', 0),
                self.results.get('own_funds', 0),
                self.results.get('total_scr', 0),
                self.results.get('mcr', 0),
                self.results.get('solvency_ratio', 0)
            ],
            'Currency': ['EUR'] * 7
        })

    def generate_s12_01(self) -> pd.DataFrame:
        """
        S.12.01 - Life Technical Provisions
        By line of business breakdown
        """
        # Implementation for life TP breakdown
        pass

    def generate_s22_01(self) -> pd.DataFrame:
        """
        S.22.01 - Impact of Long Term Guarantees
        Volatility adjustment, matching adjustment impact
        """
        pass

    def generate_s25_01(self) -> pd.DataFrame:
        """
        S.25.01 - SCR for Standard Formula
        Detailed SCR component breakdown
        """
        scr_components = self.results.get('scr_components', {})

        return pd.DataFrame({
            'Risk Module': list(scr_components.keys()),
            'SCR': list(scr_components.values())
        })

    def export_all(self, output_path: str) -> None:
        """Export all QRT templates to Excel."""
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            self.generate_s02_01().to_excel(writer, sheet_name='S.02.01', index=False)
            self.generate_s25_01().to_excel(writer, sheet_name='S.25.01', index=False)
```

### Task 3.3: CSM Roll-Forward Analysis

**File:** `actuarial-engine/calculations/csm_rollforward.py` (CREATE)

```python
"""
IFRS 17 CSM Roll-Forward Analysis
Tracks CSM movement from period to period
"""
from dataclasses import dataclass
from typing import List, Dict
import numpy as np

@dataclass
class CSMMovement:
    """Represents CSM movement between periods."""
    opening_csm: float
    new_business: float
    interest_accretion: float
    changes_in_estimates: float
    experience_adjustments: float
    csm_release: float
    closing_csm: float

    def validate(self) -> bool:
        """Validate that movements reconcile."""
        calculated_closing = (
            self.opening_csm +
            self.new_business +
            self.interest_accretion +
            self.changes_in_estimates +
            self.experience_adjustments -
            self.csm_release
        )
        return abs(calculated_closing - self.closing_csm) < 0.01


def calculate_csm_rollforward(
    opening_balance: Dict,
    closing_balance: Dict,
    new_business: List[Dict],
    assumptions_changes: Dict,
    discount_rate: float
) -> CSMMovement:
    """
    Calculate CSM roll-forward from opening to closing.

    IFRS 17.44: CSM adjusted for:
    (a) Effect of new contracts
    (b) Interest accretion
    (c) Changes in FCF relating to future service
    (d) Currency exchange differences
    (e) Amount recognized as insurance revenue
    """
    opening_csm = opening_balance.get('csm', 0)

    # New business CSM
    new_business_csm = sum(
        max(0, nb.get('premium', 0) - nb.get('fcf', 0) - nb.get('ra', 0))
        for nb in new_business
    )

    # Interest accretion at locked-in rate
    interest_accretion = opening_csm * discount_rate

    # Changes in estimates (unlock for VFA, locked for GMM)
    changes_in_estimates = calculate_estimate_changes(
        opening_balance,
        assumptions_changes
    )

    # Experience adjustments
    experience_adjustments = calculate_experience_variance(
        opening_balance.get('expected_claims', 0),
        closing_balance.get('actual_claims', 0)
    )

    # CSM release based on coverage units
    coverage_units_expired = closing_balance.get('coverage_units_expired', 0)
    total_coverage_units = closing_balance.get('total_coverage_units', 1)
    csm_release = (opening_csm + new_business_csm + interest_accretion) * (
        coverage_units_expired / total_coverage_units
    )

    closing_csm = (
        opening_csm +
        new_business_csm +
        interest_accretion +
        changes_in_estimates +
        experience_adjustments -
        csm_release
    )

    return CSMMovement(
        opening_csm=opening_csm,
        new_business=new_business_csm,
        interest_accretion=interest_accretion,
        changes_in_estimates=changes_in_estimates,
        experience_adjustments=experience_adjustments,
        csm_release=csm_release,
        closing_csm=max(0, closing_csm)  # CSM cannot be negative
    )
```

### Task 3.4: Monte Carlo Risk Adjustment

**File:** `actuarial-engine/calculations/monte_carlo_ra.py` (CREATE)

```python
"""
Monte Carlo Simulation for IFRS 17 Risk Adjustment
Calibrates RA to specified confidence level
"""
import numpy as np
from scipy import stats
from typing import Tuple, List
from concurrent.futures import ProcessPoolExecutor
import multiprocessing

def simulate_cashflows(
    expected_cashflows: np.ndarray,
    volatility_assumptions: dict,
    num_simulations: int = 10000,
    seed: int = 42
) -> np.ndarray:
    """
    Simulate future cash flows using Monte Carlo.

    Args:
        expected_cashflows: Expected cash flow vector
        volatility_assumptions: Dict with mortality_vol, lapse_vol, expense_vol
        num_simulations: Number of simulations to run
        seed: Random seed for reproducibility

    Returns:
        Array of shape (num_simulations, len(expected_cashflows))
    """
    np.random.seed(seed)

    n_periods = len(expected_cashflows)

    # Mortality volatility
    mortality_shocks = np.random.lognormal(
        mean=0,
        sigma=volatility_assumptions.get('mortality_vol', 0.05),
        size=(num_simulations, n_periods)
    )

    # Lapse volatility
    lapse_shocks = np.random.lognormal(
        mean=0,
        sigma=volatility_assumptions.get('lapse_vol', 0.10),
        size=(num_simulations, n_periods)
    )

    # Expense volatility
    expense_shocks = np.random.lognormal(
        mean=0,
        sigma=volatility_assumptions.get('expense_vol', 0.03),
        size=(num_simulations, n_periods)
    )

    # Combined shock factor
    combined_shocks = mortality_shocks * lapse_shocks * expense_shocks

    # Apply shocks to expected cash flows
    simulated_cashflows = expected_cashflows * combined_shocks

    return simulated_cashflows


def calculate_risk_adjustment_monte_carlo(
    expected_fcf: float,
    expected_cashflows: np.ndarray,
    confidence_level: float = 0.75,
    num_simulations: int = 10000,
    volatility_assumptions: dict = None
) -> Tuple[float, dict]:
    """
    Calculate Risk Adjustment using Monte Carlo simulation.

    Per IFRS 17.37: RA reflects compensation for bearing uncertainty
    about amount and timing of cash flows.

    Args:
        expected_fcf: Expected fulfilment cash flows
        expected_cashflows: Cash flow projection vector
        confidence_level: Confidence level (e.g., 0.75 for 75th percentile)
        num_simulations: Number of Monte Carlo simulations
        volatility_assumptions: Volatility parameters

    Returns:
        Tuple of (risk_adjustment, diagnostics_dict)
    """
    if volatility_assumptions is None:
        volatility_assumptions = {
            'mortality_vol': 0.05,
            'lapse_vol': 0.10,
            'expense_vol': 0.03
        }

    # Run simulations
    simulated_cfs = simulate_cashflows(
        expected_cashflows,
        volatility_assumptions,
        num_simulations
    )

    # Calculate PV for each simulation
    discount_factors = 1 / (1.03 ** np.arange(1, len(expected_cashflows) + 1))
    simulated_pvs = np.sum(simulated_cfs * discount_factors, axis=1)

    # Risk adjustment = percentile - expected
    percentile_value = np.percentile(simulated_pvs, confidence_level * 100)
    expected_pv = np.sum(expected_cashflows * discount_factors)

    risk_adjustment = percentile_value - expected_pv

    # Diagnostics
    diagnostics = {
        'num_simulations': num_simulations,
        'confidence_level': confidence_level,
        'expected_pv': expected_pv,
        'percentile_value': percentile_value,
        'risk_adjustment': risk_adjustment,
        'ra_as_percent_fcf': risk_adjustment / abs(expected_fcf) if expected_fcf != 0 else 0,
        'simulation_std': np.std(simulated_pvs),
        'simulation_min': np.min(simulated_pvs),
        'simulation_max': np.max(simulated_pvs),
        'simulation_percentiles': {
            'p5': np.percentile(simulated_pvs, 5),
            'p25': np.percentile(simulated_pvs, 25),
            'p50': np.percentile(simulated_pvs, 50),
            'p75': np.percentile(simulated_pvs, 75),
            'p95': np.percentile(simulated_pvs, 95),
        }
    }

    return risk_adjustment, diagnostics
```

---

## 6. Phase 4: Enterprise Features

**Priority:** P2 - Enhancement
**Goal:** Multi-tenancy, permissions, collaboration

### Task 4.1: Multi-Tenant Architecture

**File:** `server/middleware/tenantMiddleware.js` (CREATE)

```javascript
const firestoreService = require('../services/firestoreService');

/**
 * Multi-tenant middleware
 * Ensures users can only access their organization's data
 */
const tenantMiddleware = async (req, res, next) => {
  try {
    const userId = req.user.uid;

    // Get user's organization
    const userDoc = await firestoreService.getUser(userId);
    const organizationId = userDoc.organizationId;

    if (!organizationId) {
      return res.status(403).json({
        error: 'User not associated with an organization'
      });
    }

    // Attach tenant context to request
    req.tenant = {
      organizationId,
      organizationName: userDoc.organizationName,
      role: userDoc.role, // admin, actuary, viewer
      permissions: await getPermissions(userDoc.role)
    };

    next();
  } catch (error) {
    next(error);
  }
};

const getPermissions = async (role) => {
  const permissionMap = {
    admin: ['read', 'write', 'delete', 'manage_users', 'export'],
    actuary: ['read', 'write', 'export'],
    viewer: ['read']
  };
  return permissionMap[role] || ['read'];
};

module.exports = tenantMiddleware;
```

### Task 4.2: Role-Based Access Control

**File:** `server/middleware/rbacMiddleware.js` (CREATE)

```javascript
/**
 * Role-Based Access Control middleware
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.tenant?.permissions?.includes(permission)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: permission,
        current: req.tenant?.permissions || []
      });
    }
    next();
  };
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.tenant?.role)) {
      return res.status(403).json({
        error: 'Insufficient role',
        required: allowedRoles,
        current: req.tenant?.role
      });
    }
    next();
  };
};

module.exports = { requirePermission, requireRole };
```

### Task 4.3: Calculation Versioning & Comparison

**File:** `server/services/versioningService.js` (CREATE)

```javascript
const firestoreService = require('./firestoreService');

class VersioningService {
  /**
   * Save a new version of calculation results
   */
  async saveVersion(organizationId, portfolioId, calculationType, results, metadata) {
    const version = {
      id: `v${Date.now()}`,
      portfolioId,
      calculationType,
      results,
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        assumptions: results.assumptions
      }
    };

    await firestoreService.addDocument(
      `organizations/${organizationId}/portfolios/${portfolioId}/versions`,
      version
    );

    return version;
  }

  /**
   * Compare two calculation versions
   */
  async compareVersions(organizationId, portfolioId, versionId1, versionId2) {
    const v1 = await this.getVersion(organizationId, portfolioId, versionId1);
    const v2 = await this.getVersion(organizationId, portfolioId, versionId2);

    return {
      v1Summary: this.extractSummary(v1),
      v2Summary: this.extractSummary(v2),
      differences: this.calculateDifferences(v1.results, v2.results),
      assumptionChanges: this.compareAssumptions(
        v1.metadata.assumptions,
        v2.metadata.assumptions
      )
    };
  }

  calculateDifferences(results1, results2) {
    return {
      csm: {
        v1: results1.total_csm,
        v2: results2.total_csm,
        change: results2.total_csm - results1.total_csm,
        percentChange: (results2.total_csm - results1.total_csm) / results1.total_csm
      },
      // Add more metrics...
    };
  }
}

module.exports = new VersioningService();
```

### Task 4.4: Export & Reporting Service

**File:** `server/services/exportService.js` (CREATE)

```javascript
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ExportService {
  /**
   * Export calculation results to Excel
   */
  async exportToExcel(results, options = {}) {
    const workbook = new ExcelJS.Workbook();

    // Summary sheet
    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.addRow(['Metric', 'Value']);
    summarySheet.addRow(['Total CSM', results.aggregate_results?.total_csm]);
    summarySheet.addRow(['Total FCF', results.aggregate_results?.total_fcf]);
    summarySheet.addRow(['Total Risk Adjustment', results.aggregate_results?.total_risk_adjustment]);

    // Policy details sheet
    const policySheet = workbook.addWorksheet('Policy Results');
    if (results.policy_results?.length > 0) {
      const headers = Object.keys(results.policy_results[0]);
      policySheet.addRow(headers);
      results.policy_results.forEach(policy => {
        policySheet.addRow(headers.map(h => policy[h]));
      });
    }

    // Audit trail sheet
    const auditSheet = workbook.addWorksheet('Audit Trail');
    auditSheet.addRow(['Step', 'Description', 'Formula', 'Result']);
    results.audit_trail?.calculation_steps?.forEach((step, idx) => {
      auditSheet.addRow([
        idx + 1,
        step.step_name,
        step.formula,
        step.result
      ]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  /**
   * Export calculation results to PDF
   */
  async exportToPDF(results, options = {}) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Title
      doc.fontSize(20).text('IFRS 17 Calculation Report', { align: 'center' });
      doc.moveDown();

      // Summary
      doc.fontSize(14).text('Summary');
      doc.fontSize(10);
      doc.text(`Total CSM: ${results.aggregate_results?.total_csm?.toLocaleString()}`);
      doc.text(`Total FCF: ${results.aggregate_results?.total_fcf?.toLocaleString()}`);
      doc.moveDown();

      // Methodology
      doc.fontSize(14).text('Methodology');
      doc.fontSize(10);
      doc.text(results.audit_trail?.methodology || 'Standard IFRS 17 GMM approach');

      doc.end();
    });
  }
}

module.exports = new ExportService();
```

---

## 7. Phase 5: Performance & Scale

**Priority:** P3 - Optimization
**Goal:** Handle large portfolios, caching, monitoring

### Task 5.1: Redis Caching Layer

**File:** `server/services/cacheService.js` (CREATE)

```javascript
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

class CacheService {
  /**
   * Cache calculation results with TTL
   */
  async cacheResults(key, results, ttlSeconds = 3600) {
    await redis.setex(
      `calc:${key}`,
      ttlSeconds,
      JSON.stringify(results)
    );
  }

  async getCachedResults(key) {
    const cached = await redis.get(`calc:${key}`);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Create cache key from inputs
   */
  createCacheKey(portfolioId, calculationType, assumptions) {
    const assumptionsHash = this.hashObject(assumptions);
    return `${portfolioId}:${calculationType}:${assumptionsHash}`;
  }

  hashObject(obj) {
    const crypto = require('crypto');
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(obj))
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Invalidate cache when portfolio changes
   */
  async invalidatePortfolioCache(portfolioId) {
    const keys = await redis.keys(`calc:${portfolioId}:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

module.exports = new CacheService();
```

### Task 5.2: Batch Processing Queue

**File:** `actuarial-engine/batch/batch_processor.py` (CREATE)

```python
"""
Batch processing for large portfolio calculations.
Uses chunking and parallel processing.
"""
import asyncio
from typing import List, Dict, Any
from concurrent.futures import ProcessPoolExecutor
import numpy as np
from ..calculations.ifrs17 import calculate_portfolio_csm
from ..calculations.solvency import calculate_portfolio_scr

CHUNK_SIZE = 1000
MAX_WORKERS = 4

async def process_portfolio_batch(
    policies: List[Dict],
    calculation_type: str,
    assumptions: Dict
) -> Dict[str, Any]:
    """
    Process large portfolio in batches.

    Args:
        policies: List of policy dictionaries
        calculation_type: 'ifrs17' or 'solvency'
        assumptions: Calculation assumptions

    Returns:
        Aggregated results from all batches
    """
    # Split into chunks
    chunks = [
        policies[i:i + CHUNK_SIZE]
        for i in range(0, len(policies), CHUNK_SIZE)
    ]

    # Process chunks in parallel
    with ProcessPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = []
        for chunk in chunks:
            if calculation_type == 'ifrs17':
                future = executor.submit(
                    calculate_portfolio_csm,
                    chunk,
                    assumptions
                )
            else:
                future = executor.submit(
                    calculate_portfolio_scr,
                    chunk,
                    assumptions
                )
            futures.append(future)

        # Gather results
        chunk_results = [f.result() for f in futures]

    # Aggregate results
    return aggregate_batch_results(chunk_results)


def aggregate_batch_results(chunk_results: List[Dict]) -> Dict:
    """Aggregate results from multiple chunks."""
    aggregated = {
        'total_csm': sum(r.get('aggregate_results', {}).get('total_csm', 0) for r in chunk_results),
        'total_fcf': sum(r.get('aggregate_results', {}).get('total_fcf', 0) for r in chunk_results),
        'total_ra': sum(r.get('aggregate_results', {}).get('total_risk_adjustment', 0) for r in chunk_results),
        'policy_count': sum(r.get('aggregate_results', {}).get('policy_count', 0) for r in chunk_results),
        'policy_results': [],
        'processing_stats': {
            'chunks_processed': len(chunk_results),
            'chunk_size': CHUNK_SIZE
        }
    }

    # Combine policy results
    for r in chunk_results:
        aggregated['policy_results'].extend(r.get('policy_results', []))

    return aggregated
```

### Task 5.3: Monitoring & Observability

**File:** `server/middleware/metricsMiddleware.js` (CREATE)

```javascript
const prometheus = require('prom-client');

// Create metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60, 120]
});

const calculationDuration = new prometheus.Histogram({
  name: 'calculation_duration_seconds',
  help: 'Duration of actuarial calculations in seconds',
  labelNames: ['calculation_type', 'portfolio_size'],
  buckets: [1, 5, 10, 30, 60, 120, 300]
});

const calculationCount = new prometheus.Counter({
  name: 'calculations_total',
  help: 'Total number of calculations',
  labelNames: ['calculation_type', 'status']
});

const activeCalculations = new prometheus.Gauge({
  name: 'active_calculations',
  help: 'Number of currently running calculations'
});

// Middleware
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe(
      { method: req.method, route: req.route?.path || req.path, status: res.statusCode },
      duration
    );
  });

  next();
};

// Metrics endpoint
const metricsEndpoint = async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
};

module.exports = {
  metricsMiddleware,
  metricsEndpoint,
  calculationDuration,
  calculationCount,
  activeCalculations
};
```

### Task 5.4: Health Check Improvements

**File:** `server/routes/health.js` (UPDATE)

```javascript
const router = require('express').Router();
const axios = require('axios');
const firestoreService = require('../services/firestoreService');

router.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {}
  };

  // Check Firestore
  try {
    await firestoreService.healthCheck();
    health.services.firestore = { status: 'healthy' };
  } catch (error) {
    health.services.firestore = { status: 'unhealthy', error: error.message };
    health.status = 'degraded';
  }

  // Check Python Engine
  try {
    const pythonHealth = await axios.get(
      `${process.env.PYTHON_ENGINE_URL}/health`,
      { timeout: 5000 }
    );
    health.services.pythonEngine = {
      status: 'healthy',
      version: pythonHealth.data.version
    };
  } catch (error) {
    health.services.pythonEngine = { status: 'unhealthy', error: error.message };
    health.status = 'degraded';
  }

  // Check Redis (if used)
  if (process.env.REDIS_URL) {
    try {
      await cacheService.ping();
      health.services.redis = { status: 'healthy' };
    } catch (error) {
      health.services.redis = { status: 'unhealthy', error: error.message };
    }
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

router.get('/ready', async (req, res) => {
  // Kubernetes readiness probe
  res.json({ ready: true });
});

router.get('/live', (req, res) => {
  // Kubernetes liveness probe
  res.json({ alive: true });
});

module.exports = router;
```

---

## 8. Coding Standards & Best Practices

### Python (Actuarial Engine)

```python
# Use Pydantic for all request/response models
from pydantic import BaseModel, Field, validator

class CalculationRequest(BaseModel):
    policies: List[PolicyData] = Field(..., min_items=1, max_items=100000)
    assumptions: Assumptions

    @validator('policies')
    def validate_policies(cls, v):
        # Custom validation logic
        return v

# Use NumPy for vectorized calculations (not loops)
# BAD:
for policy in policies:
    pv = calculate_pv(policy)

# GOOD:
face_amounts = np.array([p.face_amount for p in policies])
mortality_rates = np.array([get_mortality(p.age) for p in policies])
pvs = face_amounts * mortality_rates * discount_factors

# Always include audit trail
with AuditContext(calculation_id) as audit:
    audit.log_step("CSM Calculation", inputs, result, formula="CSM = max(0, FCF - RA)")
```

### React/Next.js (Client)

```jsx
// Use functional components with hooks
export default function Calculator({ initialData }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use custom hooks for reusable logic
  const { saveToHistory } = useCalculationHistory();

  // Use Tailwind for styling
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Content */}
    </div>
  );
}

// Use react-katex for LaTeX formulas
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

<BlockMath math="CSM = \max(0, \sum_{t} \frac{CF_t}{(1+r)^t} - RA)" />
```

### Node.js (Server)

```javascript
// Use async/await, not callbacks
// Use proper error handling
const calculateIFRS17 = async (req, res, next) => {
  try {
    const result = await pythonEngine.calculateIFRS17(req.body);
    res.json(result);
  } catch (error) {
    next(error); // Pass to error handler
  }
};

// Use Joi for request validation
const schema = Joi.object({
  portfolioId: Joi.string().required(),
  assumptions: Joi.object({
    discount_rate: Joi.number().min(0).max(1).required(),
    lapse_rate: Joi.number().min(0).max(1).required()
  }).required()
});
```

---

## 9. Testing Strategy

### Unit Tests

```python
# Python: pytest
# File: tests/test_ifrs17.py

import pytest
from actuarial_engine.calculations.ifrs17 import calculate_portfolio_csm

def test_csm_calculation_basic():
    """Test basic CSM calculation."""
    policies = [
        {"policy_id": "P001", "face_amount": 100000, "premium": 5000, ...}
    ]
    assumptions = {"discount_rate": 0.03, "lapse_rate": 0.05, ...}

    result = calculate_portfolio_csm(policies, assumptions)

    assert result["aggregate_results"]["total_csm"] >= 0
    assert "audit_trail" in result

def test_loss_component_onerous_contract():
    """Test loss component for onerous contracts."""
    # When FCF > Premium + RA, should have loss component
    pass
```

```javascript
// Node.js: Jest
// File: server/__tests__/calculations.test.js

describe('Calculation Service', () => {
  it('should connect to Python engine', async () => {
    const result = await pythonEngine.healthCheck();
    expect(result.status).toBe('healthy');
  });

  it('should handle timeout gracefully', async () => {
    // Test with large portfolio
  });
});
```

```jsx
// React: Vitest + Testing Library
// File: client/src/components/__tests__/IFRS17Calculator.test.jsx

import { render, screen, fireEvent } from '@testing-library/react';
import IFRS17Calculator from '../calculators/IFRS17Calculator';

describe('IFRS17Calculator', () => {
  it('renders calculator form', () => {
    render(<IFRS17Calculator />);
    expect(screen.getByText('IFRS 17 Calculator')).toBeInTheDocument();
  });

  it('validates input fields', async () => {
    render(<IFRS17Calculator />);
    fireEvent.click(screen.getByText('Calculate'));
    expect(await screen.findByText(/required/i)).toBeInTheDocument();
  });
});
```

### Integration Tests

```python
# File: tests/integration/test_api.py

import pytest
from httpx import AsyncClient
from actuarial_engine.main import app

@pytest.mark.asyncio
async def test_ifrs17_endpoint():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/v1/calculate/ifrs17", json={
            "policies": [...],
            "assumptions": {...}
        })
        assert response.status_code == 200
        assert "aggregate_results" in response.json()
```

### E2E Tests

```javascript
// File: e2e/calculation-flow.spec.js
// Using Playwright

import { test, expect } from '@playwright/test';

test('complete IFRS 17 calculation flow', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to calculator
  await page.goto('/calculators/ifrs17');

  // Upload portfolio
  await page.setInputFiles('input[type="file"]', 'test-portfolio.csv');

  // Run calculation
  await page.click('text=Calculate');

  // Wait for results
  await expect(page.locator('text=Total CSM')).toBeVisible({ timeout: 120000 });
});
```

---

## 10. File Reference Guide

### Critical Files to Modify

| Priority | File | Purpose |
|----------|------|---------|
| P0 | `server/services/pythonEngineService.js` | CREATE - Backend → Python connection |
| P0 | `server/controllers/calculationController.js` | UPDATE - Use Python engine |
| P0 | `server/routes/dataManagement.js` | UPDATE - Complete TODO |
| P0 | `client/src/utils/api.js` | CREATE - API client |
| P1 | `server/websocket.js` | CREATE - Real-time updates |
| P1 | `client/src/components/calculators/SensitivityAnalysis.jsx` | CREATE |
| P1 | `client/src/components/calculators/StressTestPanel.jsx` | CREATE |
| P2 | `actuarial-engine/reports/qrt_generator.py` | CREATE - Regulatory reports |
| P2 | `actuarial-engine/calculations/monte_carlo_ra.py` | CREATE |
| P3 | `server/services/cacheService.js` | CREATE - Redis caching |

### Key Existing Files

| Component | File | Lines | Status |
|-----------|------|-------|--------|
| IFRS 17 Calculations | `actuarial-engine/calculations/ifrs17.py` | 781 | Complete |
| Solvency II Calculations | `actuarial-engine/calculations/solvency.py` | 684 | Complete |
| Mortality Tables | `actuarial-engine/data/mortality_tables.py` | - | Complete |
| IFRS 17 Calculator UI | `client/src/components/calculators/IFRS17Calculator.jsx` | - | Complete |
| Solvency Calculator UI | `client/src/components/calculators/SolvencyCalculator.jsx` | - | Complete |
| Express Server | `server/index.js` | 250+ | Complete |
| Auth Controller | `server/controllers/authController.js` | - | Complete |

### Environment Variables Required

```env
# Server (.env)
PORT=3001
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
GOOGLE_API_KEY=your-gemini-api-key
CLIENT_URL=http://localhost:3000
PYTHON_ENGINE_URL=http://localhost:8000
REDIS_URL=redis://localhost:6379  # Optional

# Client (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

---

## Development Commands

```bash
# Start all services (from root)
npm run dev

# Individual services
cd actuarial-engine && uvicorn main:app --reload --port 8000
cd client && npm run dev
cd server && npm run dev

# Run tests
cd actuarial-engine && pytest
cd client && npm test
cd server && npm test

# Build for production
cd client && npm run build
cd actuarial-engine && docker build -t actuarial-engine .
```

---

## Notes for Cursor AI

1. **Always read existing code first** before making changes
2. **Follow the existing patterns** in each codebase (Python, React, Node.js)
3. **Include audit trails** for all calculations
4. **Use LaTeX** for mathematical formulas in the UI
5. **Test with realistic data** - actuarial calculations are sensitive
6. **Document regulatory compliance** - IFRS 17 and Solvency II requirements

---

*Generated for Valuact Development Team*
