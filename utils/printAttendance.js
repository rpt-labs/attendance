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

module.exports = printAttendance;
