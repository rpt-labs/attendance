const sqlite3 = require('sqlite3').verbose();

const DBSOURCE = './db/attendance.sqlite3';
const cohorts = require('./cohorts');
const studentsList = require('./students');

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
        const insert = 'INSERT INTO enrollment_status (status) VALUES (?)';
        db.run(insert, ['enrolled']);
        db.run(insert, ['dismissed']);
        db.run(insert, ['deferred']);
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
        const insert = 'INSERT INTO cohorts VALUES (?, ?, ?, ?, ?)';
        cohorts.forEach(cohort => {
          db.run(insert, cohort);
        });
      }
    }
  );
};

const createStudentsTable = db => {
  db.run(
    `CREATE TABLE students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      first_name VARCHAR NOT NULL,
      last_name VARCHAR NOT NULL,
      zoom_name VARCHAR,
      github text,
      status text NOT NULL,
      cohort_id INTEGER,
      CONSTRAINT fk_cohorts
        FOREIGN KEY (cohort_id)
        REFERENCES cohorts(cohort_id)
    )`,
    err => {
      if (err) {
        console.log(err);
      } else {
        const insert = 'INSERT INTO students VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        studentsList.forEach(student => {
          db.run(insert, student);
        });
      }
    }
  );
};

const createEnrollmentsTable = db => {
  db.run(
    `CREATE TABLE enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cohort_id VARCHAR,
      student_id VARCHAR NOT NULL,
      enrollment_status VARCHAR,
      CONSTRAINT fk_cohort_id
        FOREIGN KEY (cohort_id)
        REFERENCES cohorts(id),
      CONSTRAINT fk_student_id
        FOREIGN KEY (student_id)
        REFERENCES students(id)
    )`,
    err => {
      if (err) {
        console.log('error', err);
      } else {
        const insert = 'INSERT INTO enrollments VALUES (?, ?, ?, ?)';
        studentsList.forEach(student => {
          const sql = `select id, status, cohort_id from students where first_name=? and last_name=?`;
          db.get(sql, [student[2], student[3]], (error, rows) => {
            if (error) {
              throw error;
            }
            const studentId = rows.id;
            const { status } = rows;
            const cohortId = rows.cohort_id;
            const cohortSql = `select id from cohorts where cohort_id=?`;
            db.get(cohortSql, cohortId, (error1, row) => {
              if (error1) {
                throw error1;
              }
              const { id } = row;
              db.run(insert, [null, id, studentId, status]);
            });
          });
        });
      }
    }
  );
};

const createStudentAttendanceTable = db => {
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
        REFERENCES enrollments(id)
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
    createEnrollmentStatusTable(db);
    createCohortsTable(db);
    createStudentsTable(db);
    createEnrollmentsTable(db);
    createStudentAttendanceTable(db);
  }
});

module.exports = db;
