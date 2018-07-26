var fs = require('fs');
var Papa = require('papaparse');
let zutils = require('./zoomHelpers');
let storeZoomRecords = require('./utils/storeZoomRecords')
let flattenZoomResults = require('./utils/flattenZoomResults')
let printAttendance = require('./utils/printAttendance')
let matchStudents = require('./utils/matchStudents')
let writeToGoogleSheets = require('./utils/writeToGoogleSheets')
let formatStudentsByCohort = require('./utils/formatStudentsByCohort')
let filterToStudentsExpected = require('./utils/filterToStudentsExpected')
let sheetsAuth = require('./sheetsAuth');
let sampleData = require('./utils/sampleData.js');
let DEBUG = true;
var optionalParams = process.argv.slice(2)
var recordToGoogle = optionalParams[0] === 'LOG'



async function runAttendance(zoomResults){
  // fetch credentials to authorize
  let credentials = await sheetsAuth.googleSheetsCredentials();
  // authorize using credentials
  let authorize = await sheetsAuth.authorize(credentials);
  // with authorization, fetch sheets data
  let studentsUnformatted = await sheetsAuth.formatSheetResults(authorize);
  // format returned data for attendance
  let studentsFormatted = studentsUnformatted.map(el => {
    return   {
        full_name: el[0],
        other_zoom_name: el[1],
        cohort: el[2],
        email: el[3],
        student_status: el[4],
        // absent_for_next_class: el[5]
      }
  })
  // remove headers
  let allStudents = studentsFormatted.slice(1)
  // filter students by cohorts input in terminal
  let studentsExpected = filterToStudentsExpected(allStudents, optionalParams)
  // take zoom results and flatten to single array
  let studentsPresent = flattenZoomResults(zoomResults);
  // write raw data to googly sheets
  if (recordToGoogle) writeToGoogleSheets(studentsPresent)
  // break if there is no one present in zoom
  if (!studentsPresent) return
  // log if DEBUG is true
  if (DEBUG) console.log(studentsPresent);
  // storeZoomRecords(studentsPresent) //records to csv
  // merge students expected with students present using matching criteria
  let studentsOutput = matchStudents(studentsExpected, studentsPresent)
  // modify output by cohort to print results by cohort
	let attendanceObj = formatStudentsByCohort(studentsOutput);
  // send for console log
	printAttendance(attendanceObj);
	return
}

if (DEBUG) {
  runAttendance(sampleData)
} else {
  zutils.getLiveAttendance(runAttendance)
}
