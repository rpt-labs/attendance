const flattenZoomResults = require('./flattenZoomResults');
const matchStudents = require('./matchStudents');
const { findAbsentAndPresentStudents } = require('./writeToGoogleSheets');
const formatStudentsByCohort = require('./formatStudentsByCohort')
const filterToStudentsExpected = require('./filterToStudentsExpected')
const { RPT_ATTENDANCE_OUTPUT } = process.env
const { readGoogleSheets } = './sheetsUtil';

async function getAttendanceNoLog (zoomResults, cohorts) {

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
  let studentsExpected = filterToStudentsExpected(allStudents, cohorts);
  // take zoom results and flatten to single array
  let studentsPresent = flattenZoomResults(zoomResults);
  // break if there is no one present in zoom
  if (!studentsPresent) return
  // merge students expected with students present using matching criteria
  let studentsOutput = matchStudents(studentsExpected, studentsPresent);
  // modify output by cohort to print results by cohort
  let attendanceObj = formatStudentsByCohort(studentsOutput);
  let formattedObj = formatAttendanceObj(attendanceObj);
  return sortByCohort(formattedObj);
}

function sortByCohort(formattedAttendance) {
  let results = {}
  for (let student of formattedAttendance.absent) {
    if (!results[student.cohort]) {
      results[student.cohort] = { present:[], absent:[] };
    }
      results[student.cohort]['absent'].push(student);
  };

  for (let student of formattedAttendance.present) {
    if (!results[student.cohort]) {
      results[student.cohort] = { present: [], absent: [] };
    }
      results[student.cohort]['present'].push(student);
  };
  return results;
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