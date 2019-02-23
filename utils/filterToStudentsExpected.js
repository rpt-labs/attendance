function filterToStudentsExpected(allStudents, cohortsToCheck) {
  const studentsExpected = allStudents.filter(stu => {
    const filters = [];
    filters.push(cohortsToCheck.includes(stu.cohort));
    filters.push(stu.student_status === 'Enrolled');
    // filters.push(stu.absent_for_next_class === 'FALSE')
    return filters.every(el => el);
  });

  return studentsExpected;
}

module.exports = filterToStudentsExpected;
