const express = require('express');
const multer = require('multer');
const dataController = require('../controllers/dataController');
const { authMiddleware } = require('../middleware/auth');
const { validateRequest, datasetUploadSchema, calculationRequestSchema } = require('../utils/validators');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// All data routes require authentication
router.use(authMiddleware);

// Dataset routes
router.post('/upload',
  validateRequest(datasetUploadSchema),
  dataController.uploadDataset
);

router.post('/upload-file',
  upload.single('file'),
  dataController.uploadCSVFile
);

router.get('/datasets',
  dataController.getUserDatasets
);

router.get('/dataset/:datasetId',
  dataController.getDataset
);

router.get('/dataset/:datasetId/preview',
  dataController.getDatasetPreview
);

router.delete('/dataset/:datasetId',
  dataController.deleteDataset
);

router.put('/dataset/:datasetId',
  dataController.updateDataset
);

// Calculation routes
router.post('/calculation',
  validateRequest(calculationRequestSchema),
  dataController.createCalculation
);

router.get('/calculations',
  dataController.getUserCalculations
);

router.get('/calculation/:calculationId',
  dataController.getCalculation
);

module.exports = router;
