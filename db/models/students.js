const { query } = require('../index');

module.exports = {
  getAllStudents: async () => {
    try {
      const studentQuery = await query('SELECT * FROM students ORDER BY first_name ASC');
      return studentQuery.rows;
    } catch (err) {
      console.log(err.detal || err);
      return err.detail;
    }
  },
  getStudentById: async studentId => {
    try {
      const student = await query(`SELECT * FROM students WHERE id=${studentId}`);
      return student.rows[0];
    } catch (err) {
      console.log(err);
      return err;
    }
  },
  getStudentsByCohort: async cohortId => {
    try {
      const studentQuery = await query(`
        SELECT * FROM students WHERE cohort_id=${cohortId}
        ORDER BY id ASC
      `);
      return studentQuery.rows;
    } catch (err) {
      console.log(err);
      return err;
    }
  }
};
