let flattenZoomResults = require('./flattenZoomResults');
let matchStudents = require('./matchStudents');
let { findAbsentAndPresentStudents } = require('./writeToGoogleSheets');
let formatStudentsByCohort = require('./formatStudentsByCohort')
let filterToStudentsExpected = require('./filterToStudentsExpected')
let sheetsAuth = require('../sheetsAuth');

async function getAttendanceNoLog (zoomResults, cohorts) {
  // fetch credentials to authorize
  let credentials = await sheetsAuth.googleSheetsCredentials();
  // authorize using credentials
  let authorize = await sheetsAuth.authorize(credentials);
  // with authorization, fetch sheets data
  let studentsUnformatted = await sheetsAuth.formatSheetResults(authorize, process.env.RPT_ROSTER_SHEET_ID, 'Attendance Data!A:E');
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
  let studentsExpected = filterToStudentsExpected(allStudents, cohorts);
  // take zoom results and flatten to single array
  let studentsPresent = flattenZoomResults(zoomResults);
  // break if there is no one present in zoom
  if (!studentsPresent) return
  // merge students expected with students present using matching criteria
  let studentsOutput = matchStudents(studentsExpected, studentsPresent);
  // modify output by cohort to print results by cohort
  let attendanceObj = formatStudentsByCohort(studentsOutput);
  //console.log(attendanceObj);
  return formatAttendanceObj(attendanceObj);
}

function formatAttendanceObj(attendanceObj) {
   let attendance = findAbsentAndPresentStudents(attendanceObj);
   let present = attendance.present.map((stuObj) => {
     return {
       name: stuObj.name,
       cohort: stuObj.cohort,
       timeJoined: stuObj.timeJoined,
       absent: stuObj.absent
     }
   });
   let absent = attendance.absent.map((stuObj) => {
     return {
       name: stuObj.name,
       cohort: stuObj.cohort,
       absent: stuObj.absent
     }
   });

   return { present, absent }
}

module.exports = { getAttendanceNoLog, formatAttendanceObj }