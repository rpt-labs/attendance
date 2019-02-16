const { query } = require('../index');

module.exports = {
  getAllCohorts: async () => {
    try {
      const cohortQuery = await query('SELECT * FROM cohorts ORDER BY id ASC');
      console.log('cohortQuery', cohortQuery);
      return cohortQuery.rows;
    } catch (err) {
      console.log(err.detal || err);
      return err;
    }
  },
  getCohortById: async (cohortId) => {
    try {
      const cohort = await query(`SELECT * FROM cohorts WHERE id=${cohortId}`);
      return cohort.rows[0];
    } catch (err) {
      console.log(err);
      return err;
    }
  },
};
