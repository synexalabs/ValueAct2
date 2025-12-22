/**
 * Circuit Breaker Pattern Implementation
 * Prevents cascading failures when external services are down
 * 
 * @module utils/circuitBreaker
 */

const logger = require('./logger');

class CircuitBreaker {
    /**
     * Create a circuit breaker
     * @param {Object} options - Configuration options
     * @param {number} options.failureThreshold - Number of failures before opening circuit (default: 5)
     * @param {number} options.resetTimeout - Time in ms before attempting to close circuit (default: 60000)
     * @param {string} options.name - Name for logging purposes
     */
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 5;
        this.resetTimeout = options.resetTimeout || 60000;
        this.name = options.name || 'default';
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.successCount = 0;
    }

    /**
     * Execute a function with circuit breaker protection
     * @param {Function} fn - Async function to execute
     * @returns {Promise<any>} - Result of the function
     * @throws {Error} - If circuit is open or function fails
     */
    async execute(fn) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
                this.state = 'HALF_OPEN';
                logger.info(`Circuit breaker [${this.name}] entering HALF_OPEN state`);
            } else {
                throw new Error(`Circuit breaker [${this.name}] is OPEN - service unavailable`);
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

    /**
     * Record successful request
     */
    onSuccess() {
        this.failureCount = 0;
        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= 3) {
                this.state = 'CLOSED';
                this.successCount = 0;
                logger.info(`Circuit breaker [${this.name}] closed after successful recovery`);
            }
        }
    }

    /**
     * Record failed request
     */
    onFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
            logger.warn(`Circuit breaker [${this.name}] opened after ${this.failureCount} failures`);
        }
    }

    /**
     * Get current circuit breaker status
     * @returns {Object} - Current state information
     */
    getState() {
        return {
            name: this.name,
            state: this.state,
            failureCount: this.failureCount,
            lastFailureTime: this.lastFailureTime,
            config: {
                failureThreshold: this.failureThreshold,
                resetTimeout: this.resetTimeout,
            },
        };
    }

    /**
     * Manually reset the circuit breaker to closed state
     */
    reset() {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.successCount = 0;
        this.lastFailureTime = null;
        logger.info(`Circuit breaker [${this.name}] manually reset`);
    }
}

module.exports = { CircuitBreaker };
