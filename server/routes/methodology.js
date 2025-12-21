/**
 * Methodology Routes
 * API endpoints for methodology management
 */

const express = require('express');
const router = express.Router();
const methodologyController = require('../controllers/methodologyController');
const auth = require('../middleware/auth').authMiddleware;
const { body, param, query } = require('express-validator');

// Validation middleware
const validateMethodology = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').isIn(['IFRS17', 'SolvencyII', 'Pricing', 'Mortality', 'General']).withMessage('Invalid category'),
  body('complexity').isIn(['basic', 'intermediate', 'advanced']).withMessage('Invalid complexity level')
];

const validateFormula = [
  body('formulaData.id').notEmpty().withMessage('Formula ID is required'),
  body('formulaData.name').notEmpty().withMessage('Formula name is required'),
  body('formulaData.latex').notEmpty().withMessage('LaTeX formula is required'),
  body('formulaData.description').notEmpty().withMessage('Formula description is required')
];

const validateUpdate = [
  body('changeLog').notEmpty().withMessage('Change log is required')
];

// Public routes (no authentication required)
router.get('/', methodologyController.getAllMethodologies);
router.get('/statistics', methodologyController.getStatistics);
router.get('/:id', param('id').isString().notEmpty(), methodologyController.getMethodology);
router.get('/:id/versions', param('id').isString().notEmpty(), methodologyController.getFormulaVersions);
router.get('/:id/history', param('id').isString().notEmpty(), methodologyController.getVersionHistory);
router.get('/:id/validate', param('id').isString().notEmpty(), methodologyController.validateMethodology);
router.get('/:id/export', param('id').isString().notEmpty(), methodologyController.exportMethodology);

// Protected routes (authentication required)
router.post('/', auth, validateMethodology, methodologyController.createMethodology);
router.put('/:id', auth, param('id').isString().notEmpty(), validateUpdate, methodologyController.updateMethodology);
router.post('/:id/formulas', auth, param('id').isString().notEmpty(), validateFormula, methodologyController.addFormula);
router.delete('/:id', auth, param('id').isString().notEmpty(), methodologyController.deactivateMethodology);

module.exports = router;
