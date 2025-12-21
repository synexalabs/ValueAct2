const express = require('express');
const router = express.Router();
const axios = require('axios');
const cacheService = require('../services/cacheService');
const pythonEngineService = require('../services/pythonEngineService'); // Assuming this exposes a health check URL or method
const logger = require('../utils/logger');

// Retrieve Python Engine URL if not in service
const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || 'http://localhost:8000';

router.get('/health', async (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            server: { status: 'up' },
            redis: { status: 'unknown' },
            python_engine: { status: 'unknown' }
        }
    };

    // Check Redis
    try {
        if (cacheService.redis.status === 'ready') {
            health.services.redis.status = 'up';
        } else {
            health.services.redis.status = 'down';
            health.services.redis.details = cacheService.redis.status;
            health.status = 'degraded';
        }
    } catch (err) {
        health.services.redis.status = 'error';
        health.status = 'degraded';
    }

    // Check Python Engine
    try {
        // Assuming Python engine has a /health endpoint
        // Timeout short to avoid hanging
        const pyResponse = await axios.get(`${PYTHON_ENGINE_URL}/health`, { timeout: 2000 });
        if (pyResponse.status === 200) {
            health.services.python_engine.status = 'up';
        } else {
            health.services.python_engine.status = 'degraded';
            health.status = 'degraded';
        }
    } catch (err) {
        health.services.python_engine.status = 'down';
        health.services.python_engine.error = err.message;
        health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
});

module.exports = router;
