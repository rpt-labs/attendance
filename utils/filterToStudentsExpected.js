function filterToStudentsExpected(allStudents, cohortsToCheck) {
  let studentsExpected = allStudents.filter( stu => {
			let filters = []
			filters.push(cohortsToCheck.includes(stu.cohort))
			filters.push(stu.student_status === 'Enrolled')
			// filters.push(stu.absent_for_next_class === 'FALSE')
    return filters.every(el=>el)
  });

  return studentsExpected
}

module.exports = filterToStudentsExpected
