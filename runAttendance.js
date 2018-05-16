var fs = require('fs');
var Papa = require('papaparse');
var Fuse = require('fuse.js');
let zutils = require('./zoomHelpers');

var cohortsToCheck = process.argv.slice(2)

console.log(cohortsToCheck)

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
  })
  let studentsPresent = flattenZoomResults(zoomResults);


  let studentsAbsent = [];
  let options = {
  shouldSort: true,
  threshold: 0.7,
  location: 0,
  // includeScore: true,
  // distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 4,
  keys: [
    {name: "user_name", weight: 0.9},
    // {name: "firstName", weight: 0.9},
    // {name: "lastName", weight: 0.7},
    // {name: "moreName", weight: 0.8},
  ],
  id: "user_name"
  };

  console.log("⛱ ⛱ ⛱ ⛱ ⛱ BEGIN STUDENTS PRESENT ⛱ ⛱ ⛱ ⛱ ⛱");
  console.log(studentsPresent);
  console.log("⛱ ⛱ ⛱ ⛱ ⛱ END STUDENTS PRESENT ⛱ ⛱ ⛱ ⛱ ⛱");



  for (var i = 0; i < studentsExpected.length; i++) {
    let student = studentsExpected[i]
    var fuse = new Fuse(studentsPresent, options); // "list" is the item array
    var match = fuse.search(student['full_name']);

    if (match.length > 0) {
      console.log(`${student['full_name']}:   ${JSON.stringify(match)}`);
      console.log('')

    } else {
      console.log(`${student['full_name']}:   no match`);
      console.log('')
    }
  }
}

zutils.getLiveAttendance(runAttendance)
