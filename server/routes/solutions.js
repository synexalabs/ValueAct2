const express = require('express');
const solutionController = require('../controllers/solutionController');

const router = express.Router();

// Define routes
router.post('/', solutionController.submitSolution);
router.get('/:userId', solutionController.getUserSolutions);
router.post('/analyze', solutionController.analyzeSolution);

module.exports = router;
