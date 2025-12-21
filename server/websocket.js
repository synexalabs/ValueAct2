const { Server } = require('socket.io');
const logger = require('./utils/logger');

let io;

const initializeWebSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Client connected: ${socket.id}`);

        // Allow clients to subscribe to specific calculation updates
        socket.on('subscribe:calculation', (calculationId) => {
            logger.info(`Client ${socket.id} subscribed to calculation: ${calculationId}`);
            socket.join(`calculation:${calculationId}`);
        });

        // Unsubscribe
        socket.on('unsubscribe:calculation', (calculationId) => {
            logger.info(`Client ${socket.id} unsubscribed from calculation: ${calculationId}`);
            socket.leave(`calculation:${calculationId}`);
        });

        socket.on('disconnect', () => {
            logger.info(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

const emitCalculationUpdate = (calculationId, status, data) => {
    if (io) {
        logger.info(`Emitting update for calculation ${calculationId}: ${status}`);
        io.to(`calculation:${calculationId}`).emit('calculation:update', {
            calculationId,
            status,
            data,
            timestamp: new Date().toISOString()
        });
    } else {
        logger.warn('WebSocket not initialized, cannot emit update');
    }
};

module.exports = { initializeWebSocket, emitCalculationUpdate };
