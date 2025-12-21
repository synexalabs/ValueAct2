const prometheus = require('prom-client');
const logger = require('../utils/logger');

// Initialize registry
const register = new prometheus.Registry();

// Add default metrics (cpu, memory, event loop lag, etc.)
prometheus.collectDefaultMetrics({ register, prefix: 'valuact_' });

// Create custom metrics
const httpRequestDuration = new prometheus.Histogram({
    name: 'valuact_http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60],
    registers: [register]
});

const calculationDuration = new prometheus.Histogram({
    name: 'valuact_calculation_duration_seconds',
    help: 'Duration of actuarial calculations in seconds',
    labelNames: ['calculation_type', 'portfolio_size_bucket'],
    buckets: [1, 5, 10, 30, 60, 120, 300, 600],
    registers: [register]
});

const calculationCount = new prometheus.Counter({
    name: 'valuact_calculations_total',
    help: 'Total number of calculations initiated',
    labelNames: ['calculation_type', 'status'],
    registers: [register]
});

const activeCalculations = new prometheus.Gauge({
    name: 'valuact_active_calculations',
    help: 'Number of currently running calculations',
    registers: [register]
});

// Middleware to track request duration
const metricsMiddleware = (req, res, next) => {
    const start = Date.now();

    // Hook into response finish to calculate duration
    res.on('finish', () => {
        const durationSeconds = (Date.now() - start) / 1000;

        // Normalize route to avoid high cardinality (e.g. remove IDs)
        // Simple regex or usage of req.route.path if available
        const route = req.route ? req.route.path : req.path;

        httpRequestDuration.observe(
            { method: req.method, route: route, status: res.statusCode },
            durationSeconds
        );
    });

    next();
};

// Endpoint to expose metrics to Prometheus
const metricsEndpoint = async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        logger.error('Error generating metrics:', error);
        res.status(500).send('Error generating metrics');
    }
};

module.exports = {
    metricsMiddleware,
    metricsEndpoint,
    calculationDuration,
    calculationCount,
    activeCalculations
};
