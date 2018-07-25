function matchStudents(studentsExpected, studentsPresent) {

  let studentsOutput = [];
  // loop through student roster, which was filtered into cohorts expected
  for (var i = 0; i < studentsExpected.length; i++) {
		// create variables
    let student = studentsExpected[i];
		let studentFullName = student.full_name.toLowerCase();
		let studentNameCollection = studentFullName.split(' ');
		let studentOtherName = student.other_zoom_name;
		let studentFirstInitialLastName = studentFullName[0] + studentNameCollection[1];
		let studentConcatName = studentNameCollection.join('')
		let studentEmail = student.email.split('@')[0];
		let studentEmailCollection = null;
		if (studentEmail.indexOf('.') > -1) {
			studentEmailCollection = studentEmail.split('.');
		}

    console.log('student', student);
    console.log('studentFullName', studentFullName);
    console.log('studentNameCollection', studentNameCollection);
    console.log('studentOtherName', studentOtherName);
    console.log('studentFirstInitialLastName', studentFirstInitialLastName);
    console.log('studentConcatName', studentConcatName);
    console.log('studentEmail', studentEmail);
    console.log('studentEmailCollection', studentEmailCollection);

		//create student output object
		let studentOutput = {
			name: studentFullName,
			cohort: student.cohort,
      room: null,
			match: null,
			absent: true,
		}
		// loop through studentsPresent, a flat collection originating
		// from zutils.getLiveAttendance(runAttendance)
		for (var j = 0; j < studentsPresent.length; j++) {
			let studentZoom = studentsPresent[j];

      console.log('studentZoom 🏄🏄🏄🏄🏄🏄🏄')
      console.log(studentZoom)
      studentZoom.firstName = studentZoom.firstName.toLowerCase();
      studentZoom.user_name = studentZoom.user_name.toLowerCase();
      if (studentZoom.lastName) {
        studentZoom.lastName = studentZoom.lastName.toLowerCase();
      }
			let studentZoomName = studentZoom.user_name.toLowerCase().replace('.','');
      // console.log(studentZoomName);
			// see if zoom name can be found in students full name
			// first try direct match
			if (studentFullName.indexOf(studentZoomName) > -1 ) {
					studentOutput.absent = false;
					studentOutput.match = `full name: ${studentFullName}`
          studentOutput.room = studentZoom.room
			//try other name field in CSV
			} else if (studentOtherName.indexOf(studentZoomName) > -1 ) {
					studentOutput.absent = false;
					studentOutput.match = `other name: ${studentOtherName}`
          studentOutput.room = studentZoom.room
			//try email before @
			} else if (!studentEmail && studentEmail.indexOf(studentZoomName) > -1 ) {
					studentOutput.absent = false;
					studentOutput.match = `email: ${studentEmail}`
          studentOutput.room = studentZoom.room
			} else if (studentConcatName.indexOf(studentZoomName) > -1 ) {
					studentOutput.absent = false;
					studentOutput.match = `concatName: ${studentConcatName}`
          studentOutput.room = studentZoom.room
      }
			// } else {
			// 	//try student's name split by spaces ' '
			// 	studentNameCollection.forEach((el, idx) => {
			// 		if (studentZoomName.indexOf(el) > -1 ) {
      //       console.log("🏄 trying to match", studentZoomName, 'with', el);
			// 			studentOutput.absent = false;
			// 			studentOutput.match = `name: ${idx} idx (${el}) of ${studentNameCollection.join(' ')}`
      //       studentOutput.room = studentZoom.room
			// 		}
			// 	})
			// 	if (studentEmailCollection) {
			// 		//try student's email split by periods '.'
			// 		studentEmailCollection.forEach((el, idx) => {
			// 			if (studentZoomName.indexOf(el) > -1 ) {
			// 				studentOutput.absent = false;
			// 				studentOutput.match = `email: ${idx} idx (${el}) of ${studentEmailCollection.join(' ')}`
      //         studentOutput.room = studentZoom.room
			// 			}
			// 		})
			// 	}
			// }
		}

		studentsOutput.push(studentOutput)
  }

  return studentsOutput
}

module.exports = matchStudents
