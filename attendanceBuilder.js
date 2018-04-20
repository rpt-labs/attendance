let fs = require('fs');
let zutils = require('./zoomUtils');

let rptAll   = '618209372';
let rptStaff = '343215295';

// zoomCall.executeAttendanceReport('2018-03-24','2018-03-24')
// zoomCall.executeLiveAttendance(rptStaff)

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
  let snapshot =  await zutils.executeAllLiveAttendance();
  let activeRooms = snapshot.meetings || 1;


  for (let i = 0; i < activeRooms.length; i++) {
    let students = activeRooms[i].liveAttendance.participants;

    for (let j = 0; j < students.length; j++) {
      let student = {
        zoom_username: students[j].user_name,
        ip_address: students[j].ip_address,
        user_id: students[j].user_id,
        classroom: activeRooms[i].topic,
      }

      studentsPresent.push(student);
    }//end inner for loop
  }//end outer for loop


  // console.log(studentsPresent)
  return studentsPresent;
}

async function buildAttendance() {
  let builtAttendance = [];
  console.log('🚛  Running attendance, please wait...');
  let studentRoster = await getRptRoster();
  studentRoster = JSON.parse(studentRoster);
  let studentsPresent = await whoIsHereNow();

  if (studentsPresent.length === 0) {
    console.log("there are no students in any classroom")
    return;
  }

  //loop through roster
  for (let i = 0; i < studentRoster.length; i++) {
    let sr = studentRoster[i];
    // for each new student, make a student object
    let student = {
      name: sr.full_name,
      cohort: sr.cohort,
      absent: true,
    }
    //  iterate through the students present
    studentsPresent.forEach(stu => {

      if (sr.zoom_username === stu.zoom_username) { // match zoom_username to zoom_username
        student.absent = false;
        student.classroom = stu.classroom;
      } else if (sr.ip1 === stu.ip_address || sr.ip2 === stu.ip_address || sr.ip3 === stu.ip_address) { // match ip1 to ip1/ip2 to ip2
        student.absent = false;
        student.classroom = stu.classroom;
      }

    })

    builtAttendance.push(student);
  }

  reportAbsent(builtAttendance)
  return builtAttendance
}


function reportAbsent(attendance) {

  let cohorts = {
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
}


buildAttendance()

module.exports = {
  reportAbsent: reportAbsent
}
