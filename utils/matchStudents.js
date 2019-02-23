const DEBUG = false;

function matchStudents(studentsExpected, studentsPresent) {
  const studentsOutput = [];
  if (DEBUG) console.log('----------------- matchStudents.js -----------------');
  // loop through student roster, which was filtered into cohorts expected
  for (let i = 0; i < studentsExpected.length; i++) {
    // create variables
    const student = studentsExpected[i];
    const studentFullName = student.full_name.toLowerCase();
    const studentNameCollection = studentFullName.split(' ');
    const studentOtherName = student.other_zoom_name;
    const studentFirstInitialLastName = studentFullName[0] + studentNameCollection[1];
    const studentConcatName = studentNameCollection.join('');
    const studentEmail = student.email.split('@')[0];
    let studentEmailCollection = null;
    if (studentEmail.indexOf('.') > -1) {
      studentEmailCollection = studentEmail.split('.');
    }

    if (DEBUG) {
      console.log('---------------- vars ----------------');
      console.log('student', student);
      console.log('studentFullName', studentFullName);
      console.log('studentNameCollection', studentNameCollection);
      console.log('studentOtherName', studentOtherName);
      console.log('studentFirstInitialLastName', studentFirstInitialLastName);
      console.log('studentConcatName', studentConcatName);
      console.log('studentEmail', studentEmail);
    }

    // create student output object
    const studentOutput = {
      name: studentFullName,
      cohort: student.cohort,
      room: null,
      match: null,
      matchReliability: null,
      absent: true
    };
    // loop through studentsPresent, a flat collection originating
    // from zutils.getLiveAttendance(runAttendance).
    // this data is the same shape as utils/sampleData.js
    for (let j = 0; j < studentsPresent.length; j++) {
      const studentZoom = studentsPresent[j];

      // convert all names to lowercase where applicable
      studentZoom.firstName = studentZoom.firstName.toLowerCase();
      studentZoom.user_name = studentZoom.user_name.toLowerCase();
      if (studentZoom.lastName) {
        studentZoom.lastName = studentZoom.lastName.toLowerCase();
      }
      const studentZoomName = studentZoom.user_name.toLowerCase().replace('.', '');
      const timeJoined = studentZoom.join_time;

      // first try direct match
      if (studentFullName === studentZoomName) {
        studentOutput.absent = false;
        studentOutput.matchReliability = 100;
        studentOutput.match = `full name: ${studentFullName}`;
        studentOutput.room = studentZoom.room;
        studentOutput.timeJoined = timeJoined;

        // try ther zoom username if different
      } else if (studentOtherName.indexOf(studentZoomName) > -1) {
        studentOutput.absent = false;
        studentOutput.matchReliability = 100;
        studentOutput.match = `other name: ${studentOtherName}`;
        studentOutput.room = studentZoom.room;
        studentOutput.timeJoined = timeJoined;

        // try email before @
      } else if (!studentEmail && studentEmail.indexOf(studentZoomName) > -1) {
        studentOutput.absent = false;
        studentOutput.matchReliability = 100;
        studentOutput.match = `email: ${studentEmail}`;
        studentOutput.room = studentZoom.room;
        studentOutput.timeJoined = timeJoined;

        // try full name concatenated and without spaces
      } else if (studentConcatName.indexOf(studentZoomName) > -1) {
        studentOutput.absent = false;
        studentOutput.matchReliability = 100;
        studentOutput.match = `concatName: ${studentConcatName}`;
        studentOutput.room = studentZoom.room;
        studentOutput.timeJoined = timeJoined;

        // try to match zoom name within full name (this can be problematic)
      } else if (studentFullName.indexOf(studentZoomName) > -1) {
        studentOutput.absent = false;
        studentOutput.matchReliability = 50;
        studentOutput.match = `within full name: ${studentFullName} with ${studentZoomName}`;
        studentOutput.room = studentZoom.room;
        studentOutput.timeJoined = timeJoined;
      }
    }

    studentsOutput.push(studentOutput);
  }

  return studentsOutput;
}

module.exports = matchStudents;
