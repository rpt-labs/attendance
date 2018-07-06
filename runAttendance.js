var fs = require('fs');
var Papa = require('papaparse');
let zutils = require('./zoomHelpers');
let storeZoomRecords = require('./utils/storeZoomRecords')
let sheetsAuth = require('./sheetsAuth');
let DEBUG = true;
var cohortsToCheck = process.argv.slice(2)

let getRptRoster = () => {
  return new Promise( resolve => {
    Papa.parse(fs.createReadStream('student-roster.csv'), {
      delimiter: ",",
      header: true,
      complete: function(results) {
        resolve(results.data);
        done();
      }
    });
  })
}

/* expected output:
  { full_name: 'Josh Chen',
    other_zoom_name: '',
    cohort: 'RPT08',
    email: 'josh.jia.chen@gmail.com',
    student_status: 'active',
    absent_for_next_class: 'FALSE' },
*/

//returns collection of students
// async function whoIsHereNow(){
//   let studentsPresent = [];
//   let snapshot =  await zutils.globalAttendance(acctIdArr);
//
//   for (let i = 0; i < snapshot.length; i++) {
//     let students;
//
//     if (snapshot[i].liveAttendance === undefined){
//       console.log("🐸 🐸 🐸 🐸 🐸 🐸 an acct errored in getting live stats ")
//       students = []
//     } else {
//       students = snapshot[i].liveAttendance.participants
//     }
//
//
//     for (let j = 0; j < students.length; j++) {
//       let student = {
//         zoom_username: students[j].user_name,
//         ip_address: students[j].ip_address,
//         user_id: students[j].user_id,
//         classroom: snapshot[i].topic,
//       }
//
//       studentsPresent.push(student);
//     }//end inner for loop
//   }//end outer for loop
//
//   // console.log(studentsPresent)
//   return studentsPresent;
// }

function flattenZoomResults(zoomResults){
  let studentsPresent = []
  // console.log(zoomResults)

  if (zoomResults.length < 1 || zoomResults === undefined) {
    console.log("There are no students in any Zoom Room");
    return false;
  }

  for (var i = 0; i < zoomResults.length; i++) {
    let session = zoomResults[i].liveAttendance.map(student => {
      let name = student['user_name'].split(' ');
      student.firstName = name[0];
      student.lastName = name[1];
      student.room = zoomResults[i].topic
      student.timestamp = new Date(student.join_time).toLocaleString('en-GB', {timezone: "America/Los_Angeles"});
      if (name.length > 2) {
       student.moreName = name.slice(2);
      }
      student.room = zoomResults[i].topic;
      return student
    })
    studentsPresent = studentsPresent.concat(session)
  }

  return studentsPresent
}

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
  let studentsExpected = allStudents.filter( stu => {
			let filters = []
			filters.push(cohortsToCheck.includes(stu.cohort))
			filters.push(stu.student_status === 'Enrolled')
			// filters.push(stu.absent_for_next_class === 'FALSE')
    return filters.every(el=>el)
  });

  let studentsPresent = flattenZoomResults(zoomResults);

  if (!studentsPresent){
    return;
  }

  storeZoomRecords(studentsPresent)
	let studentsOutput = [];

  if (DEBUG) {
    console.log("⛱ ⛱ ⛱ ⛱ ⛱ BEGIN STUDENTS PRESENT ⛱ ⛱ ⛱ ⛱ ⛱");
    console.log(studentsPresent);
    console.log("⛱ ⛱ ⛱ ⛱ ⛱ END STUDENTS PRESENT ⛱ ⛱ ⛱ ⛱ ⛱");
  }

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
      // console.log(studentZoom)
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
			} else {
				//try student's name split by spaces ' '
				studentNameCollection.forEach((el, idx) => {
					if (studentZoomName.indexOf(el) > -1 ) {
            console.log("🏄 trying to match", studentZoomName, 'with', el);
						studentOutput.absent = false;
						studentOutput.match = `name: ${idx} idx (${el}) of ${studentNameCollection.join(' ')}`
            studentOutput.room = studentZoom.room
					}
				})
				if (studentEmailCollection) {
					//try student's email split by periods '.'
					studentEmailCollection.forEach((el, idx) => {
						if (studentZoomName.indexOf(el) > -1 ) {
							studentOutput.absent = false;
							studentOutput.match = `email: ${idx} idx (${el}) of ${studentEmailCollection.join(' ')}`
              studentOutput.room = studentZoom.room
						}
					})
				}
			}
		}

		studentsOutput.push(studentOutput)
  }

	let attendanceObj = {};

	studentsOutput.forEach(el=>{
		if (!attendanceObj[el.cohort]) {
			attendanceObj[el.cohort] = [];
		}

		attendanceObj[el.cohort].push(el)
	})
	// console.log(studentsOutput)
	printAttendance(attendanceObj);
	return
}

function printAttendance(attendanceObj){
  for (let cohort in attendanceObj) {

    console.log(`--------------------- ${cohort} ---------------------`);
    for (let i = 0; i < attendanceObj[cohort].length; i++) {
      let stuObj = attendanceObj[cohort][i]
      if ( !attendanceObj[cohort][i].absent ) {
        console.log( `${stuObj.name}\n matched ${stuObj.match}\n in ${stuObj.room} ✅\n`  )
      } else {
        let stu = attendanceObj[cohort][i];
        let len = 49 - ( attendanceObj[cohort][i].name.length + 4 )
        let buffer = Array(len).join('-')
        console.log( stu.name, `<---${buffer}  ABSENT ❌`  )
      }
    }
  }
}

//NOTE: available for testing
// runAttendance(sampleData)

zutils.getLiveAttendance(runAttendance)
