/**
 * Health Check Routes
 * Endpoints for monitoring service health and dependencies
 *
 * @module routes/healthRoutes
 */

const express = require('express');
const router = express.Router();
const pythonEngineService = require('../services/pythonEngineService');
const logger = require('../utils/logger');

/**
 * GET /api/health
 * Basic health check - returns server status
 */
router.get('/', async (req, res) => {
    const startTime = Date.now();

    try {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                unit: 'MB',
            },
            version: process.env.npm_package_version || '1.0.0',
        };

        res.json(health);
    } catch (error) {
        logger.error('Health check error:', error.message);
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});

/**
 * GET /api/health/engine
 * Check Python actuarial engine health
 */
router.get('/engine', async (req, res) => {
    try {
        const engineHealth = await pythonEngineService.healthCheck();
        const circuitStatus = pythonEngineService.getCircuitStatus();

        const status = engineHealth.status === 'healthy' && circuitStatus.state === 'CLOSED'
            ? 'healthy'
            : 'degraded';

        res.status(status === 'healthy' ? 200 : 503).json({
            status,
            engine: engineHealth,
            circuit_breaker: circuitStatus,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        logger.error('Engine health check error:', error.message);
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString(),
        });
    }
});

/**
 * GET /api/health/circuit
 * Get circuit breaker status
 */
router.get('/circuit', (req, res) => {
    const circuitStatus = pythonEngineService.getCircuitStatus();

    res.json({
        circuit_breaker: circuitStatus,
        timestamp: new Date().toISOString(),
    });
});

/**
 * GET /api/health/detailed
 * Comprehensive health check of all dependencies
 */
router.get('/detailed', async (req, res) => {
    const checks = {
        server: { status: 'healthy' },
        python_engine: { status: 'unknown' },
        circuit_breaker: { status: 'unknown' },
    };

    try {
        // Check Python engine
        const engineHealth = await pythonEngineService.healthCheck();
        checks.python_engine = {
            status: engineHealth.status,
            details: engineHealth,
        };

        // Check circuit breaker
        const circuitStatus = pythonEngineService.getCircuitStatus();
        checks.circuit_breaker = {
            status: circuitStatus.state === 'CLOSED' ? 'healthy' : 'degraded',
            state: circuitStatus.state,
            failures: circuitStatus.failures,
        };

        // Overall status
        const overallStatus = Object.values(checks).every(c => c.status === 'healthy')
            ? 'healthy'
            : 'degraded';

        res.status(overallStatus === 'healthy' ? 200 : 503).json({
            status: overallStatus,
            checks,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    } catch (error) {
        logger.error('Detailed health check error:', error.message);
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            checks,
            timestamp: new Date().toISOString(),
        });
    }
});

module.exports = router;
