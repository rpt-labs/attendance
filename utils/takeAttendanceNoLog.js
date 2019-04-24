const flattenZoomResults = require('./flattenZoomResults');
const matchStudents = require('./matchStudents');
const { findAbsentAndPresentStudents } = require('./writeToGoogleSheets');
const formatStudentsByCohort = require('./formatStudentsByCohort');
const filterToStudentsExpected = require('./filterToStudentsExpected');
const sheetsAuth = require('../sheetsAuth');

async function getAttendanceNoLog(zoomResults, cohorts) {
  // fetch credentials to authorize
  const credentials = await sheetsAuth.googleSheetsCredentials();
  // authorize using credentials
  const authorize = await sheetsAuth.authorize(credentials);
  // with authorization, fetch sheets data
  const studentsUnformatted = await sheetsAuth.formatSheetResults(
    authorize,
    process.env.RPT_ROSTER_SHEET_ID,
    'Attendance Data!A:E'
  );
  // format returned data for attendance
  const studentsFormatted = studentsUnformatted.map(el => {
    return {
      full_name: el[0],
      other_zoom_name: el[1],
      cohort: el[2],
      email: el[3],
      student_status: el[4]
      // absent_for_next_class: el[5]
    };
  });
  // remove headers
  const allStudents = studentsFormatted.slice(1);
  // filter students by cohorts input in terminal
  const studentsExpected = filterToStudentsExpected(allStudents, cohorts);
  // take zoom results and flatten to single array
  const studentsPresent = flattenZoomResults(zoomResults);
  // break if there is no one present in zoom
  if (!studentsPresent) return;
  // merge students expected with students present using matching criteria
  const studentsOutput = matchStudents(studentsExpected, studentsPresent);
  // modify output by cohort to print results by cohort
  const attendanceObj = formatStudentsByCohort(studentsOutput);
  const formattedObj = formatAttendanceObj(attendanceObj);
  return sortByCohort(formattedObj);
}

function sortByCohort(formattedAttendance) {
  const results = {};
  for (const student of formattedAttendance.absent) {
    if (!results[student.cohort]) {
      results[student.cohort] = { present: [], absent: [] };
    }
    results[student.cohort].absent.push(student);
  }

  for (const student of formattedAttendance.present) {
    if (!results[student.cohort]) {
      results[student.cohort] = { present: [], absent: [] };
    }
    results[student.cohort].present.push(student);
  }
  return results;
}

function formatAttendanceObj(attendanceObj) {
  const attendance = findAbsentAndPresentStudents(attendanceObj);
  const present = attendance.present.map(stuObj => {
    return {
      name: stuObj.name,
      cohort: stuObj.cohort,
      timeJoined: stuObj.timeJoined,
      absent: stuObj.absent
    };
  });
  const absent = attendance.absent.map(stuObj => {
    return {
      name: stuObj.name,
      cohort: stuObj.cohort,
      absent: stuObj.absent
    };
  });

  return { present, absent };
}

module.exports = { getAttendanceNoLog, formatAttendanceObj };
