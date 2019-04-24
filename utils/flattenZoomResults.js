function flattenZoomResults(zoomResults) {
  if (zoomResults.length === 0) {
    console.log('No one was in zoom');
    return [];
  }

  if (zoomResults[0].room) {
    console.log('🧚‍ running sample data');
    return zoomResults;
  }

  let studentsPresent = [];

  for (let i = 0; i < zoomResults.length; i += 1) {
    const session = zoomResults[i].liveAttendance.map(student => {
      const name = student.user_name.split(' ');
      student.firstName = name[0];
      student.lastName = name[1];
      student.room = zoomResults[i].topic;
      student.timestamp = new Date(student.join_time).toLocaleString('en-GB', { timezone: 'America/Los_Angeles' });
      if (name.length > 2) {
        student.moreName = name.slice(2);
      }
      student.room = zoomResults[i].topic;
      return student;
    });
    studentsPresent = studentsPresent.concat(session);
  }

  return studentsPresent;
}

module.exports = flattenZoomResults;
