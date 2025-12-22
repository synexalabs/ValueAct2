/**
 * WebSocket server for real-time calculation updates
 * Provides authenticated socket connections for live progress tracking
 *
 * @module websocket
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./utils/logger');

let io;

/**
 * Initialize WebSocket server with authentication
 * @param {http.Server} httpServer - HTTP server instance
 * @returns {Server} Socket.io server instance
 */
const initializeWebSocket = (httpServer) => {
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
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if (!token) {
            // Allow unauthenticated connections for health checks, but mark them
            socket.userId = null;
            socket.authenticated = false;
            return next();
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.uid || decoded.userId || decoded.id;
            socket.authenticated = true;
            next();
        } catch (error) {
            logger.warn(`WebSocket auth failed for socket ${socket.id}: ${error.message}`);
            socket.userId = null;
            socket.authenticated = false;
            next(); // Allow connection but mark as unauthenticated
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Client connected: ${socket.id} (authenticated: ${socket.authenticated}, userId: ${socket.userId})`);

        // Join user's personal room if authenticated
        if (socket.userId) {
            socket.join(`user:${socket.userId}`);
        }

        // Subscribe to calculation updates
        socket.on('subscribe:calculation', (calculationId) => {
            if (!calculationId) return;
            socket.join(`calculation:${calculationId}`);
            logger.debug(`Socket ${socket.id} subscribed to calculation ${calculationId}`);
        });

        // Unsubscribe from calculation
        socket.on('unsubscribe:calculation', (calculationId) => {
            if (!calculationId) return;
            socket.leave(`calculation:${calculationId}`);
            logger.debug(`Socket ${socket.id} unsubscribed from calculation ${calculationId}`);
        });

        // Subscribe to all user's calculations
        socket.on('subscribe:user', () => {
            if (socket.userId) {
                socket.join(`user:${socket.userId}:calculations`);
                logger.debug(`Socket ${socket.id} subscribed to user calculations`);
            }
        });

        socket.on('disconnect', (reason) => {
            logger.info(`Client disconnected: ${socket.id} (reason: ${reason})`);
        });

        socket.on('error', (error) => {
            logger.error(`Socket error for ${socket.id}: ${error.message}`);
        });
    });

    return io;
};

/**
 * Emit calculation progress update
 * @param {string} calculationId - Calculation ID
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} message - Status message
 */
const emitCalculationProgress = (calculationId, progress, message) => {
    if (!io) {
        logger.warn('WebSocket not initialized, cannot emit progress');
        return;
    }

    io.to(`calculation:${calculationId}`).emit('calculation:progress', {
        calculationId,
        progress,
        message,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Emit calculation completion
 * @param {string} calculationId - Calculation ID
 * @param {Object} results - Calculation results (aggregate only, not full policy data)
 */
const emitCalculationComplete = (calculationId, results) => {
    if (!io) {
        logger.warn('WebSocket not initialized, cannot emit completion');
        return;
    }

    io.to(`calculation:${calculationId}`).emit('calculation:complete', {
        calculationId,
        results: {
            aggregate: results.aggregate_results || results,
        },
        timestamp: new Date().toISOString(),
    });
};

/**
 * Emit calculation error
 * @param {string} calculationId - Calculation ID
 * @param {Error|string} error - Error object or message
 */
const emitCalculationError = (calculationId, error) => {
    if (!io) {
        logger.warn('WebSocket not initialized, cannot emit error');
        return;
    }

    io.to(`calculation:${calculationId}`).emit('calculation:error', {
        calculationId,
        error: typeof error === 'string' ? error : error.message,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Emit notification to a specific user
 * @param {string} userId - User ID
 * @param {Object} notification - Notification data
 */
const emitUserNotification = (userId, notification) => {
    if (!io) {
        logger.warn('WebSocket not initialized, cannot emit notification');
        return;
    }

    io.to(`user:${userId}`).emit('notification', {
        ...notification,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use emitCalculationProgress, emitCalculationComplete, or emitCalculationError instead
 */
const emitCalculationUpdate = (calculationId, status, data) => {
    if (!io) {
        logger.warn('WebSocket not initialized, cannot emit update');
        return;
    }

    logger.info(`Emitting update for calculation ${calculationId}: ${status}`);
    io.to(`calculation:${calculationId}`).emit('calculation:update', {
        calculationId,
        status,
        data,
        timestamp: new Date().toISOString(),
    });
};

/**
 * Get WebSocket server instance
 * @returns {Server|null} Socket.io server instance
 */
const getIO = () => io;

module.exports = {
    initializeWebSocket,
    emitCalculationProgress,
    emitCalculationComplete,
    emitCalculationError,
    emitUserNotification,
    emitCalculationUpdate, // Legacy
    getIO,
};
