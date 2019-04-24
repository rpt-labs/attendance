const { Router } = require('express');

const cohortsRouter = Router();
const cohortsController = require('../controllers/cohortsController');

// cohort information TODO: delete functionality
cohortsRouter.get('/', cohortsController.getCohorts);

module.exports = cohortsRouter;
