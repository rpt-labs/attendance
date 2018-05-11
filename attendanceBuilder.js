let fs = require('fs');
let zutils = require('./zoomHelpers');
let Fuse = require('fuse.js');


//returns rptRoster.json collection
function getRptRoster () {
  return new Promise( (resolve, reject) => {
    fs.readFile('rptRoster.json', 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
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
//compares student roster to whoIsHereNow and passes on to reportAbsent
async function buildAttendance(liveSnapshot) {
  let builtAttendance = [];
  let unrecognizedStudents = [];
  console.log('🚛  Running attendance, please wait...');
  let studentRoster = await getRptRoster();
  studentRoster = JSON.parse(studentRoster);


  if (liveSnapshot.length === 0) {
    console.log("there are no students in any classroom")
    return;
  }


  //loop through roster
  for (let i = 0; i < studentRoster.length; i++) {
    let sr = studentRoster[i];
    // for each student in roster, make a student object
    let student = {
      name: sr.full_name,
      cohort: sr.cohort,
      absent: true,
    }

    let options = {
      keys: ['user_name']
    }

    //iterate through the active classrooms
    for (let j = 0; j < liveSnapshot.length; j++) {
      //iterate through classroom participants
      let fuse = new Fuse(liveSnapshot[j].liveAttendance.participants, options)
      fuse.search('user_name')

      // for (let k = 0; k < liveSnapshot[j].liveAttendance.length; k++) {
      //   //student from zoom room is stu
      //   let stu = liveSnapshot[j].liveAttendance[k]
      //   //prepare student roster record ips
      //   let ips = [sr.ip1, sr.ip2, sr.ip3, sr.ip4, sr.ip5];
      //   //determine if ip matches
      //   let containsIp = ips.some((el) => {
      //     return el === stu.ip_address
      //   })
      //
      //
      //
      //   if (sr.zoom_username === stu.zoom_username) { // match zoom_username to zoom_username
      //     student.absent = false;
      //     student.classroom = liveSnapshot[j].topic
      //   } else if (containsIp) { // match ip1 to ip1/ip2 to ip2
      //     student.absent = false;
      //     student.classroom = liveSnapshot[j].topic;
      //   }
      // }
    }
    // builtAttendance.push(student);
  }

  //iterate through the active classrooms
  for (let a = 0; a < liveSnapshot.length; a++) {
    //iterate through classroom participants
    for (let b = 0; b < liveSnapshot[a].liveAttendance.length; b++) {
      let stu = liveSnapshot[a].liveAttendance[b];
      let exists = false;
      //iterate through roster
      for (let c = 0; c < studentRoster.length; c++) {
        let sr =  studentRoster[c]
        if (sr.zoom_username === stu.zoom_username) { // match zoom_username to zoom_username
          exists = true
        } else if (sr.ip1 === stu.ip_address || sr.ip2 === stu.ip_address || sr.ip3 === stu.ip_address || sr.ip4 === stu.ip_address) { // match ip1 to ip1/ip2 to ip2
          exists = true
        }
      }
      if (!exists) {
        if (!unrecognizedStudents.includes(stu)){
          unrecognizedStudents.push(stu)
        }
      }
    }
  }

  reportAbsent(builtAttendance, unrecognizedStudents)
  return
}
//gets called by buildAttendance to print absent students
function reportAbsent(attendance, unrecognizedStudents) {

  let cohorts = {
    'RPT01':[],
    'RPT03':[],
    'RPT04':[],
    'RPT05':[],
    'RPT06':[],
    'RPT07':[],
    'RPT08':[],
  };

  for (let i = 0; i < attendance.length; i++) {
    let a =  attendance[i];
    cohorts[a.cohort].push(a)
  }

  for (let key in cohorts) {
    console.log(' ')
    console.log(`--------------------- ${key} ---------------------`);
    for (let j = 0; j < cohorts[key].length; j++) {
      if ( !cohorts[key][j].absent ) {
        console.log( `${cohorts[key][j].name} is in ${cohorts[key][j].classroom} √`  )
      } else {
        let stu = cohorts[key][j];
        let len = 49 - ( cohorts[key][j].name.length + 4 )
        let buffer = Array(len).join('-')
        console.log( stu.name, `<---${buffer}  ABSENT`  )
      }
    }
  }

  if (unrecognizedStudents.length && unrecognizedStudents.length > 0) {
    unrecognizedStudents.forEach(student => {
      console.log('unrecognized', JSON.stringify(student))
    })
  }

}
//starting function invokation, cb is buildAttendance above
zutils.getLiveAttendance(buildAttendance)

module.exports = {
  reportAbsent: reportAbsent
}
