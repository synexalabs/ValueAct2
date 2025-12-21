const Redis = require('ioredis');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Retrieve Redis URL from env or default to local
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class CacheService {
    constructor() {
        this.redis = new Redis(REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                if (times > 3) {
                    logger.error('Redis connection retries exhausted');
                    return null; // Stop retrying
                }
                return Math.min(times * 100, 2000);
            }
        });

        this.redis.on('error', (err) => {
            logger.error('Redis connection error:', err);
        });

        this.redis.on('connect', () => {
            logger.info('Connected to Redis cache');
        });
    }

    /**
     * Cache calculation results with TTL
     */
    async cacheResults(key, results, ttlSeconds = 3600) {
        try {
            if (this.redis.status !== 'ready') return;

            await this.redis.setex(
                `calc:${key}`,
                ttlSeconds,
                JSON.stringify(results)
            );
            logger.debug(`Cached results for key: ${key}`);
        } catch (error) {
            logger.warn('Failed to cache results:', error);
        }
    }

    /**
     * Retrieve cached results
     */
    async getCachedResults(key) {
        try {
            if (this.redis.status !== 'ready') return null;

            const cached = await this.redis.get(`calc:${key}`);
            if (cached) {
                logger.debug(`Cache hit for key: ${key}`);
                return JSON.parse(cached);
            }
            return null;
        } catch (error) {
            logger.warn('Failed to retrieve cached results:', error);
            return null;
        }
    }

    /**
     * Create deterministic cache key from inputs
     */
    createCacheKey(portfolioId, calculationType, assumptions) {
        const assumptionsHash = this._hashObject(assumptions);
        return `${portfolioId}:${calculationType}:${assumptionsHash}`;
    }

    _hashObject(obj) {
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(obj || {}))
            .digest('hex')
            .substring(0, 16);
    }

    /**
     * Invalidate cache for a specific portfolio (e.g. after upload/update)
     */
    async invalidatePortfolioCache(portfolioId) {
        try {
            if (this.redis.status !== 'ready') return;

            // Scan for keys matching pattern to avoid blocking with KEYS
            const stream = this.redis.scanStream({
                match: `calc:${portfolioId}:*`,
                count: 100
            });

            stream.on('data', async (keys) => {
                if (keys.length) {
                    await this.redis.del(...keys);
                }
            });

            logger.info(`Invalidated cache for portfolio ${portfolioId}`);
        } catch (error) {
            logger.error('Failed to invalidate cache:', error);
        }
    }
}

module.exports = new CacheService();
