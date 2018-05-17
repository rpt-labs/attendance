var fs = require('fs');
var Papa = require('papaparse');
var Fuse = require('fuse.js');
let zutils = require('./zoomHelpers');
let sampleData = require('./sample-data')

var cohortsToCheck = process.argv.slice(2)

// console.log(cohortsToCheck)

var options = {
	delimiter: ",",	// auto-detect
	newline: "",	// auto-detect
	quoteChar: '"',
	escapeChar: '"',
	header: false,
	trimHeader: false,
	dynamicTyping: false,
	preview: 0,
	encoding: "",
	worker: false,
	comments: false,
	step: undefined,
	complete: undefined,
	error: undefined,
	download: false,
	skipEmptyLines: false,
	chunk: undefined,
	fastMode: undefined,
	beforeFirstChunk: undefined,
	withCredentials: undefined
}

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

//returns collection of students
async function whoIsHereNow(){
  let studentsPresent = [];
  let snapshot =  await zutils.globalAttendance(acctIdArr);

  for (let i = 0; i < snapshot.length; i++) {
    let students;

    if (snapshot[i].liveAttendance === undefined){
      console.log("🐸 🐸 🐸 🐸 🐸 🐸 an acct errored in getting live stats ")
      students = []
    } else {
      students = snapshot[i].liveAttendance.participants
    }


    for (let j = 0; j < students.length; j++) {
      let student = {
        zoom_username: students[j].user_name,
        ip_address: students[j].ip_address,
        user_id: students[j].user_id,
        classroom: snapshot[i].topic,
      }

      studentsPresent.push(student);
    }//end inner for loop
  }//end outer for loop

  // console.log(studentsPresent)
  return studentsPresent;
}

function flattenZoomResults(zoomResults){
  let studentsPresent = []
  // console.log(zoomResults)

  if (zoomResults.length < 1) {
    console.log("There are no students in any Zoom Room");
    return;
  }

  for (var i = 0; i < zoomResults.length; i++) {
    let session = zoomResults[i].liveAttendance.map(student => {
      let name = student['user_name'].split(' ');
      student.firstName = name[0];
      student.lastName = name[1];
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

  let allStudents = await getRptRoster();

  let studentsExpected = allStudents.filter( stu => {
    return cohortsToCheck.includes(stu.cohort)
  });

  let studentsPresent = flattenZoomResults(zoomResults);

	let studentsOutput = [];
  let studentsAbsent = [];

  // console.log("⛱ ⛱ ⛱ ⛱ ⛱ BEGIN STUDENTS PRESENT ⛱ ⛱ ⛱ ⛱ ⛱");
  // console.log(studentsExpected);
  // console.log("⛱ ⛱ ⛱ ⛱ ⛱ END STUDENTS PRESENT ⛱ ⛱ ⛱ ⛱ ⛱");

	// loop through student roster, which was filtered into cohorts expected
  for (var i = 0; i < studentsExpected.length; i++) {
		// create variables
    let student = studentsExpected[i];
		let studentFullName = student.full_name.toLowerCase();
		let studentNameCollection = studentFullName.split(' ');
		let studentConcatName = studentNameCollection.join('')
		let studentEmail = student.email.split('@')[0];
		let studentEmailCollection = null;
		if (studentEmail.indexOf('.') > -1) {
			studentEmailCollection = studentEmail.split('.');
		}
		// console.log(student)
		//create student output object
		let studentOutput = {
			name: studentFullName,
			cohort: student.cohort,
			match: null,
			absent: true,
		}
		// loop through studentsPresent, a flat collection originating
		// from zutils.getLiveAttendance(runAttendance)
		for (var j = 0; j < studentsPresent.length; j++) {
			let studentZoom = studentsPresent[j];
			let studentZoomName = studentZoom.user_name.toLowerCase();
			// see if zoom name can be found in students full name
			// first try direct match
			if (studentFullName.indexOf(studentZoomName) > -1 ) {
					studentOutput.absent = false;
					studentOutput.match = `full name: ${studentFullName}`
			//try email before @
			} else if (!studentEmail && studentEmail.indexOf(studentZoomName) > -1 ) {
					studentOutput.absent = false;
					studentOutput.match = `email: ${studentEmail}`
			} else if (studentConcatName.indexOf(studentZoomName) > -1) {
					studentOutput.absent = false;
					studentOutput.match = `concatName: ${studentConcatName}`
			} else {
				//try student's name split by spaces ' '
				studentNameCollection.forEach((el, idx) => {
					if (el.indexOf(studentZoomName) > -1) {
						studentOutput.absent = false;
						studentOutput.match = `name: ${idx} idx (${el}) of ${studentNameCollection.join(' ')}`
					}
				})
				if (studentEmailCollection) {
					//try student's email split by periods '.'
					studentEmailCollection.forEach((el, idx) => {
						if (el.indexOf(studentZoomName) > -1) {
							studentOutput.absent = false;
							studentOutput.match = `email: ${idx} idx (${el}) of ${studentEmailCollection.join(' ')}`
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
	// console.log(attendanceObj)
	printAttendance(attendanceObj);
	return
}

function printAttendance(attendanceObj){
  for (let cohort in attendanceObj) {
    console.log(' ')
    console.log(`--------------------- ${cohort} ---------------------`);
    for (let i = 0; i < attendanceObj[cohort].length; i++) {
      if ( !attendanceObj[cohort][i].absent ) {
        console.log( `${attendanceObj[cohort][i].name} matched ${attendanceObj[cohort][i].match} √`  )
      } else {
        let stu = attendanceObj[cohort][i];
        let len = 49 - ( attendanceObj[cohort][i].name.length + 4 )
        let buffer = Array(len).join('-')
        console.log( stu.name, `<---${buffer}  ABSENT`  )
      }
    }
  }
}

//NOTE: available for testing
// runAttendance(sampleData)

zutils.getLiveAttendance(runAttendance)
