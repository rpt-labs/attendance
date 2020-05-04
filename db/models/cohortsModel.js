const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, '../attendance.sqlite3'), err => {
  if (err) {
    console.log('Error when creating the database', err);
  } else {
    console.log('Database created!');
  }
});

module.exports = {
  getAllActiveCohorts: () => {
    const cohortQuery = 'SELECT * from cohorts where status = "current"';
    const params = [];
    db.get(cohortQuery, params, (err, rows) => {
      if (err) {
        console.log('err', err);
        return err;
      }
      return rows;
    });
  }
};
