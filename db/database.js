const sqlite3 = require('sqlite3').verbose();
const md5 = require('md5');

const DBSOURCE = 'db.sqlite';

const createEnrollmentStatusTable = db => {
  db.run(
    `CREATE TABLE enrollment_status (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      status VARCHAR NOT NULL
    )`,
    err => {
      if (err) {
        // Table already created
      } else {
        // create rows
      }
    }
  );
};

const createCohortsTable = db => {
  db.run(
    `CREATE TABLE cohorts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cohort_id VARCHAR NOT NULL UNIQUE,
      cohort_name VARCHAR NOT NULL UNIQUE,
      phase text,
      status text
    )`,
    err => {
      if (err) {
        // Table already created
      } else {
        // create rows
      }
    }
  );
};

const createStudentsTable = db => {
  db.run(
    `CREATE TABLE students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name VARCHAR NOT NULL,
      last_name VARCHAR NOT NULL,
      zoom_name VARCHAR,
      github text UNIQUE NOT NULL,
      status text NOT NULL,
      cohort_id INTEGER
      CONSTRAINT fk_cohorts
        FOREIGN KEY (cohort_id)
        REFERENCES cohorts(cohort_id)
    )`,
    err => {
      if (err) {
        // Table already created
      } else {
        // create rows
      }
    }
  );
};

const studentAttendanceTable = db => {
  db.run(
    `CREATE TABLE student_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enrollment_id INTEGER,
      zoom_id VARCHAR NOT NULL,
      user_id INTEGER NOT NULL,
      user_name VARCHAR NOT NULL,
      device VARCHAR,
      location VARCHAR,
      data_center VARCHAR,
      join_time DATE NOT NULL,
      leave_time DATE NOT NULL,
      recording boolean,
      pc_name VARCHAR,
      first_name VARCHAR,
      last_name VARCHAR,
      room VARCHAR NOT NULL,
      sqltime TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      CONSTRAINT fk_enrollments
        FOREIGN KEY (enrollment_id)
        REFERENCES enrollment_status(id)
    )`,
    err => {
      if (err) {
        // Table already created
      } else {
        // create rows
      }
    }
  );
};

const db = new sqlite3.Database(DBSOURCE, err => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log('Connected to the SQLite database.');
    createEnrollmentStatusTable();
    createCohortsTable();
    createStudentsTable();
    studentAttendanceTable();
  }
});

module.exports = db;
