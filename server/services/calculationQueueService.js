const Queue = require('bull');
const logger = require('../utils/logger');
const pythonEngine = require('./pythonEngineService');
const firestoreDataService = require('./firestoreDataService');

// Initialize queue
// Redis connection string should be in env, defaulting to localhost for dev
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const calculationQueue = new Queue('calculations', REDIS_URL);

// Job processors
calculationQueue.process(async (job) => {
    const { runId, userId, calculationType, policies, assumptions } = job.data;

    logger.info(`Processing calculation job ${job.id} for run ${runId}`);

    try {
        // Update status to processing
        await firestoreDataService.updateValidationRunStatus(runId, 'processing', {
            started_at: new Date().toISOString(),
            job_id: job.id
        });

        let result;
        if (calculationType === 'ifrs17') {
            result = await pythonEngine.calculateIFRS17(policies, assumptions);
        } else if (calculationType === 'solvency') {
            result = await pythonEngine.calculateSolvency(policies, assumptions);
        } else {
            throw new Error(`Unknown calculation type: ${calculationType}`);
        }

        // Complete job
        await firestoreDataService.updateValidationRunStatus(runId, 'completed', {
            completed_at: new Date().toISOString(),
            results: result
        });

        logger.info(`Job ${job.id} completed successfully`);
        return result;

    } catch (error) {
        logger.error(`Job ${job.id} failed:`, error.message);

        // Fail job
        await firestoreDataService.updateValidationRunStatus(runId, 'failed', {
            error: error.message,
            failed_at: new Date().toISOString()
        });

        throw error;
    }
});

// Queue events
calculationQueue.on('completed', (job, result) => {
    logger.info(`Job ${job.id} completed`);
    const { emitCalculationUpdate } = require('../websocket');
    // job.data.runId is what client is interested in
    emitCalculationUpdate(job.data.runId, 'completed', result);
});

calculationQueue.on('failed', (job, err) => {
    logger.error(`Job ${job.id} failed with error ${err.message}`);
    const { emitCalculationUpdate } = require('../websocket');
    emitCalculationUpdate(job.data.runId, 'failed', { error: err.message });
});

module.exports = {
    /**
     * Add a calculation job to the queue
     * @param {Object} data - Job data
     * @returns {Promise<Job>} The created job
     */
    addJob: async (data) => {
        return calculationQueue.add(data, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            },
            removeOnComplete: true
        });
    },

    /**
     * Get a job by ID
     * @param {string} jobId 
     * @returns {Promise<Job>}
     */
    getJob: (jobId) => calculationQueue.getJob(jobId),

    /**
     * Get queue status
     */
    getQueueStatus: async () => {
        return {
            waiting: await calculationQueue.getWaitingCount(),
            active: await calculationQueue.getActiveCount(),
            completed: await calculationQueue.getCompletedCount(),
            failed: await calculationQueue.getFailedCount()
        };
    }
};
