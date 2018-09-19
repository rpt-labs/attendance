function determineColor(matchReliability) {
  var reliability = matchReliability +''

  var color = {
    black   : "\x1b[30m",
    red     : "\x1b[31m",
    green   : "\x1b[32m",
    yellow  : "\x1b[33m",
    blue    : "\x1b[34m",
    magenta : "\x1b[35m",
    cyan    : "\x1b[36m"
  }

  matchColor = {
    'title': color.black,
    '0'    : color.red,
    '50'   : color.yellow,
    '100'  : color.green
  }
  
  return matchColor[reliability] ? matchColor[reliability] : color.magenta
}


function printAttendance(attendanceObj){
  // iterate across cohorts
  let absentStudents = [];
  for (let cohort in attendanceObj) {

    console.log( determineColor('title'), `--------------------- ${cohort} ---------------------`);
    // iterate across students within cohort
    for (let i = 0; i < attendanceObj[cohort].length; i++) {
      let stuObj = attendanceObj[cohort][i]
      // console.log(stuObj);
      if ( !attendanceObj[cohort][i].absent ) {
        let printColor = determineColor(stuObj.matchReliability)
        console.log( printColor, `${stuObj.name}\n matched ${stuObj.match}\n in ${stuObj.room} ✅\n`  )
      } else {
        let stu = attendanceObj[cohort][i];
        let len = 49 - ( attendanceObj[cohort][i].name.length + 4 )
        let buffer = Array(len).join('-')
        console.log( "\x1b[31m", stu.name, `<---${buffer}  ABSENT ❌`  )
        absentStudents.push(stu.name + `<---${buffer}  ABSENT ❌`);
      }
    }
  }
  console.log("ABSENT:");
  absentStudents.forEach(student => console.log("\x1b[31m", student));
  console.log("\x1b[0m", '');
}

module.exports = printAttendance;
