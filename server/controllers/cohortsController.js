// db
const students = require('../../db/models/students');
const cohorts = require('../../db/models/cohorts');

// COHORT requests TODO: error handling for all functions

const handleError = error => {
  console.warn(error);
  return null;
};

exports.getCohorts = async (req, res) => {
  const allCohorts = await cohorts.getAllCohorts().catch(handleError);
  res.send({ data: { cohorts: allCohorts } });
};

// STUDENT requests
exports.getStudents = async (req, res) => {
  const { cohortId } = req.query;
  const studentData = cohortId
    ? await students.getStudentsByCohort(cohort_id).catch(handleError)
    : await students.getAllStudents().catch(handleError);

  studentData.length
    ? res.status(200).json({ students: studentData })
    : res.status(400).json({ error: 'error retrieving students.  check that cohort_id is a valid cohort id' });
};
