
let zutils = require('./zoomHelpers');
let flattenZoomResults = require('./utils/flattenZoomResults')
let printAttendance = require('./utils/printAttendance')
let matchStudents = require('./utils/matchStudents')
let { writeAttendanceToGoogleSheets } = require('./utils/writeToGoogleSheets')
let { writeAbsencesToGoogleSheets } = require('./utils/writeToGoogleSheets')
let formatStudentsByCohort = require('./utils/formatStudentsByCohort')
let filterToStudentsExpected = require('./utils/filterToStudentsExpected')
//let sampleData = require('./utils/sampleData.js');
let DEBUG = false;
var optionalParams = process.argv.slice(2)
var recordToGoogle = optionalParams[0] === 'LOG'

const { RPT_ATTENDANCE_OUTPUT } = process.env;
const { readGoogleSheets } = require('./utils/sheetsUtil');

async function runAttendance(zoomResults){
  let studentsUnformatted = await readGoogleSheets(RPT_ATTENDANCE_OUTPUT, 'Attendance Roster!A:E');

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
  // write raw attendance data to googly sheets
  if (recordToGoogle) writeAttendanceToGoogleSheets(studentsPresent);
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
  //write absence data to googly sheets
  if (recordToGoogle) writeAbsencesToGoogleSheets(attendanceObj);
  printAttendance(attendanceObj);
	return
};

if (DEBUG) {
  runAttendance(sampleData)
} else {
  zutils.getLiveAttendance(runAttendance)
}
