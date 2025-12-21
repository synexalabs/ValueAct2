const express = require('express');
const multer = require('multer');
const logger = require('../utils/logger');
const fileParser = require('../services/fileParser');
const schemaValidator = require('../services/schemaValidator');
const jsonConverter = require('../services/jsonConverter');
const firestoreDataService = require('../services/firestoreDataService');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 4 // Maximum 4 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = file.originalname.toLowerCase().split('.').pop();
    
    if (allowedTypes.includes(`.${fileExtension}`)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${fileExtension}`), false);
    }
  }
});

/**
 * POST /api/data-management/upload
 * Upload and parse files
 */
router.post('/upload', upload.array('files', 4), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    logger.info(`Processing ${req.files.length} uploaded files`);

    // Convert multer files to our format
    const files = req.files.map(file => ({
      buffer: file.buffer,
      filename: file.originalname
    }));

    // Parse files
    const parsedFiles = await fileParser.parseFiles(files);

    // Validate file structures
    const validationResults = {};
    for (const [fileType, parsedFile] of Object.entries(parsedFiles)) {
      if (parsedFile && fileType !== 'errors') {
        validationResults[fileType] = fileParser.validateFileStructure(parsedFile);
      }
    }

    res.json({
      success: true,
      parsedFiles,
      validationResults,
      errors: parsedFiles.errors
    });

  } catch (error) {
    logger.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/data-management/validate
 * Validate parsed data
 */
router.post('/validate', async (req, res) => {
  try {
    const { parsedFiles } = req.body;

    if (!parsedFiles) {
      return res.status(400).json({
        success: false,
        error: 'No parsed files provided'
      });
    }

    logger.info('Validating parsed data');

    // Validate each file type
    const validationResults = {};
    for (const [fileType, parsedFile] of Object.entries(parsedFiles)) {
      if (parsedFile && fileType !== 'errors') {
        validationResults[fileType] = schemaValidator.validateTermLifeData(parsedFile.data, fileType);
      }
    }

    // Validate complete dataset
    const completeValidation = schemaValidator.validateCompleteDataset(parsedFiles);

    res.json({
      success: true,
      validationResults,
      completeValidation
    });

  } catch (error) {
    logger.error('Data validation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/data-management/convert
 * Convert validated data to unified JSON
 */
router.post('/convert', async (req, res) => {
  try {
    const { parsedFiles } = req.body;

    if (!parsedFiles) {
      return res.status(400).json({
        success: false,
        error: 'No parsed files provided'
      });
    }

    logger.info('Converting to unified JSON');

    // Convert to unified JSON
    const unifiedJson = jsonConverter.convertToUnifiedJson(parsedFiles);

    // Validate converted JSON
    const conversionValidation = jsonConverter.validateConvertedJson(unifiedJson);

    res.json({
      success: true,
      unifiedJson,
      conversionValidation
    });

  } catch (error) {
    logger.error('JSON conversion error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/data-management/save
 * Save validated data to Firestore
 */
router.post('/save', async (req, res) => {
  try {
    const { unifiedJson, userId = 'anonymous' } = req.body;

    if (!unifiedJson) {
      return res.status(400).json({
        success: false,
        error: 'No unified JSON provided'
      });
    }

    logger.info('Saving validation run to Firestore');

    // Generate run ID if not present
    const runId = unifiedJson.meta.run_id || jsonConverter.generateRunId();
    unifiedJson.meta.run_id = runId;

    // Save to Firestore
    const saveResult = await firestoreDataService.saveValidationRun(runId, unifiedJson, userId);

    res.json({
      success: true,
      runId,
      metadata: saveResult.metadata
    });

  } catch (error) {
    logger.error('Data save error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/data-management/run-valuation
 * Trigger IFRS 17 computation
 */
router.post('/run-valuation', async (req, res) => {
  try {
    const { runId, userId = 'anonymous' } = req.body;

    if (!runId) {
      return res.status(400).json({
        success: false,
        error: 'No run ID provided'
      });
    }

    logger.info(`Triggering valuation for run: ${runId}`);

    // Update status to running
    await firestoreDataService.updateValidationRunStatus(runId, 'running', {
      started_at: new Date().toISOString(),
      user_id: userId
    });

    // TODO: Implement actual IFRS 17 computation
    // For now, simulate computation
    setTimeout(async () => {
      try {
        await firestoreDataService.updateValidationRunStatus(runId, 'completed', {
          completed_at: new Date().toISOString(),
          results: {
            csm: 150000,
            ra: 50000,
            fcf: 800000
          }
        });
        logger.info(`Valuation completed for run: ${runId}`);
      } catch (error) {
        logger.error(`Error completing valuation for run ${runId}:`, error);
        await firestoreDataService.updateValidationRunStatus(runId, 'failed', {
          error: error.message,
          failed_at: new Date().toISOString()
        });
      }
    }, 5000); // Simulate 5 second computation

    res.json({
      success: true,
      runId,
      status: 'running',
      message: 'Valuation started'
    });

  } catch (error) {
    logger.error('Valuation trigger error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/data-management/status/:runId
 * Check computation status
 */
router.get('/status/:runId', async (req, res) => {
  try {
    const { runId } = req.params;

    logger.info(`Checking status for run: ${runId}`);

    const metadata = await firestoreDataService.getValidationRunMetadata(runId);

    res.json({
      success: true,
      runId,
      status: metadata.status || 'unknown',
      metadata
    });

  } catch (error) {
    logger.error(`Status check error for run ${req.params.runId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/data-management/runs/:userId
 * List validation runs for user
 */
router.get('/runs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    logger.info(`Listing runs for user: ${userId}`);

    const runs = await firestoreDataService.listUserValidationRuns(userId, parseInt(limit));

    res.json({
      success: true,
      runs,
      count: runs.length
    });

  } catch (error) {
    logger.error(`Error listing runs for user ${req.params.userId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/data-management/run/:runId
 * Get validation run data
 */
router.get('/run/:runId', async (req, res) => {
  try {
    const { runId } = req.params;

    logger.info(`Retrieving run: ${runId}`);

    const runData = await firestoreDataService.getValidationRun(runId);

    res.json({
      success: true,
      runData
    });

  } catch (error) {
    logger.error(`Error retrieving run ${req.params.runId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/data-management/run/:runId
 * Delete validation run
 */
router.delete('/run/:runId', async (req, res) => {
  try {
    const { runId } = req.params;
    const { userId = 'anonymous' } = req.body;

    logger.info(`Deleting run: ${runId}`);

    const deleteResult = await firestoreDataService.deleteValidationRun(runId, userId);

    res.json({
      success: true,
      deleteResult
    });

  } catch (error) {
    logger.error(`Error deleting run ${req.params.runId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/data-management/stats/:userId
 * Get validation run statistics
 */
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    logger.info(`Getting stats for user: ${userId}`);

    const stats = await firestoreDataService.getValidationRunStats(userId);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error(`Error getting stats for user ${req.params.userId}:`, error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/data-management/templates
 * Get CSV templates
 */
router.get('/templates', (req, res) => {
  try {
    const templates = {
      meta: {
        filename: 'meta_template.csv',
        description: 'Run metadata and configuration',
        required: true
      },
      assumptions: {
        filename: 'assumptions_template.csv',
        description: 'Economic and actuarial assumptions',
        required: true
      },
      policies: {
        filename: 'policies_template.csv',
        description: 'Policy master data',
        required: true
      },
      actuals: {
        filename: 'actuals_template.csv',
        description: 'Historical cash flows and transactions',
        required: false
      }
    };

    res.json({
      success: true,
      templates
    });

  } catch (error) {
    logger.error('Error getting templates:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
