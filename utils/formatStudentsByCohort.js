function formatStudentsByCohort(studentsOutput) {
  let attendanceObj = {}

  studentsOutput.forEach(el=>{
		if (!attendanceObj[el.cohort]) {
			attendanceObj[el.cohort] = [];
		}

		attendanceObj[el.cohort].push(el)
	})

  return attendanceObj
}

module.exports = formatStudentsByCohort
