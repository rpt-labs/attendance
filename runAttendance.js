const fs = require('fs');
const Papa = require('papaparse');
const zutils = require('./zoomHelpers');
const storeZoomRecords = require('./utils/storeZoomRecords');
const flattenZoomResults = require('./utils/flattenZoomResults');
const { printAttendance, emailAttendance } = require('./utils/printAttendance');
const matchStudents = require('./utils/matchStudents');
const sendEmail = require('./utils/sendEmail');
const { writeAttendanceToGoogleSheets } = require('./utils/writeToGoogleSheets');
const { writeAbsencesToGoogleSheets } = require('./utils/writeToGoogleSheets');
const formatStudentsByCohort = require('./utils/formatStudentsByCohort');
const filterToStudentsExpected = require('./utils/filterToStudentsExpected');
const sheetsAuth = require('./sheetsAuth');
// let sampleData = require('./utils/sampleData.js');
const DEBUG = false;
const optionalParams = process.argv.slice(2);
const recordToGoogle = optionalParams[0] === 'LOG';

async function runAttendance(zoomResults) {
  // fetch credentials to authorize
  const credentials = await sheetsAuth.googleSheetsCredentials();
  // authorize using credentials
  const authorize = await sheetsAuth.authorize(credentials);
  // with authorization, fetch sheets data
  const studentsUnformatted = await sheetsAuth.formatSheetResults(
    authorize,
    process.env.RPT_ATTENDANCE_OUTPUT,
    'Attendance Roster!A:E'
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
  const studentsExpected = filterToStudentsExpected(allStudents, optionalParams);
  // take zoom results and flatten to single array
  const studentsPresent = flattenZoomResults(zoomResults);
  // write raw attendance data to googly sheets
  if (recordToGoogle) writeAttendanceToGoogleSheets(studentsPresent);
  // break if there is no one present in zoom
  if (!studentsPresent) return;
  // log if DEBUG is true
  if (DEBUG) console.log(studentsPresent);
  // storeZoomRecords(studentsPresent) //records to csv
  // merge students expected with students present using matching criteria
  const studentsOutput = matchStudents(studentsExpected, studentsPresent);
  // modify output by cohort to print results by cohort
  const attendanceObj = formatStudentsByCohort(studentsOutput);
  // send for console log
  // write absence data to googly sheets
  if (recordToGoogle) writeAbsencesToGoogleSheets(attendanceObj);
  printAttendance(attendanceObj);
  // emailAttendance(attendanceObj, ['magee.mooney@galvanize.com']);
  sendEmail(attendanceObj);
}

if (DEBUG) {
  runAttendance(sampleData);
} else {
  zutils.getLiveAttendance(runAttendance);
}
