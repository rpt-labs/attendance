function flattenZoomResults(zoomResults){
  if (!zoomResults.length) {
    return zoomResults;
  }
  if (zoomResults[0].room) {
    console.log('🧚‍ running sample data');
    return zoomResults
  }

  let studentsPresent = []
  // console.log(zoomResults)

  if (zoomResults.length < 1 || zoomResults === undefined) {
    console.log("There are no students in any Zoom Room");
    return false;
  }

  for (var i = 0; i < zoomResults.length; i++) {
    let session = zoomResults[i].liveAttendance.map(student => {
      let name = student['user_name'].split(' ');
      student.firstName = name[0];
      student.lastName = name[1];
      student.room = zoomResults[i].topic
      student.timestamp = new Date(student.join_time).toLocaleString('en-GB', {timezone: "America/Los_Angeles"});
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

module.exports = flattenZoomResults
