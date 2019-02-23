const { Router } = require('express');

const studentsRouter = Router();
const cohortsController = require('../controllers/cohortsController');

studentsRouter.get('/', cohortsController.getStudents);

module.exports = studentsRouter;
