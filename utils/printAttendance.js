function determineColor(matchReliability) {
  const reliability = `${matchReliability}`;

  const color = {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
  };

  const matchColor = {
    title: color.black,
    '0': color.red,
    '50': color.yellow,
    '100': color.green
  };

  return matchColor[reliability] ? matchColor[reliability] : color.magenta;
}

function printAttendance(attendanceObj) {
  // iterate across cohorts
  const absentStudents = [];
  for (const cohort in attendanceObj) {
    console.log(determineColor('title'), `--------------------- ${cohort} ---------------------`);
    // iterate across students within cohort
    for (let i = 0; i < attendanceObj[cohort].length; i++) {
      const stuObj = attendanceObj[cohort][i];
      if (!attendanceObj[cohort][i].absent) {
        const printColor = determineColor(stuObj.matchReliability);
        console.log(printColor, `${stuObj.name}\n matched ${stuObj.match}\n in ${stuObj.room} ✅\n`);
      } else {
        const stu = attendanceObj[cohort][i];
        const len = 49 - (attendanceObj[cohort][i].name.length + 4);
        const buffer = Array(len).join('-');
        console.log('\x1b[31m', stu.name, `<---${buffer}  ABSENT ❌`);
        absentStudents.push(stu.name);
      }
    }
  }
  console.log('ABSENT:');
  absentStudents.forEach(student => console.log('\x1b[31m', student));
  console.log('\x1b[0m', '');
}

module.exports = printAttendance;
