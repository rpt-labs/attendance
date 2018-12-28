const { writeGoogleSheets } = require('./sheetsUtil');
const { RPT_ATTENDANCE_OUTPUT } = process.env;

function findAbsentAndPresentStudents(attendanceObj) {
  let delinquents = [];
  let present = [];
  for (let cohort in attendanceObj) {
    for (let i = 0; i < attendanceObj[cohort].length; i++) {
      let stuObj = attendanceObj[cohort][i]
      if (attendanceObj[cohort][i].absent) {
        delinquents.push(stuObj);
      } else {
        present.push(stuObj);
      }
    }
  }
  return { absent: delinquents, present }
};

async function writeAbsencesToGoogleSheets(attendanceObj) {
  // create global Google Sheets 'values' output
  var values = [];
  let absentees = findAbsentAndPresentStudents(attendanceObj).absent;
  let today = Date();

  absentees.forEach((obj) => values.push([obj.name, obj.cohort, today]));
  writeGoogleSheets(RPT_ATTENDANCE_OUTPUT, 'Absences!A:C', values);
}

async function writeAttendanceToGoogleSheets(input) {
  // create global Google Sheets 'values' output
  var values = [];
  // map
  input.forEach(obj => {
    var value = []
    // create most verbose zoom object
    var zoomObj = {
      id: obj.id || 'null',
      user_id: obj.user_id || 'null',
      user_name: obj.user_name || 'null',
      device: obj.device || 'null',
      ip_address: obj.ip_address || 'null',
      location: obj.location || 'null',
      network_type: obj.network_type || 'null',
      microphone: obj.microphone || 'null',
      speaker: obj.speaker || 'null',
      camera: obj.camera || 'null',
      data_center: obj.data_center || 'null',
      connection_type: obj.connection_type || 'null',
      join_time: obj.join_time || 'null',
      leave_time: obj.leave_time || 'null',
      share_application: obj.share_application || 'null',
      share_desktop: obj.share_desktop || 'null',
      share_whiteboard: obj.share_whiteboard || 'null',
      recording: obj.recording || 'null',
      pc_name: obj.pc_name || 'null',
      domain: obj.domain || 'null',
      mac_addr: obj.mac_addr || 'null',
      harddisk_id: obj.harddisk_id || 'null',
      version: obj.version || 'null',
      firstName: obj.firstName || 'null',
      lastName: obj.lastName || 'null',
      room: obj.room || 'null',
      timestamp: obj.timestamp || 'null',
    }

    for (var key in zoomObj) {
      value.push(zoomObj[key])
    }

    values.push(value)
  });

  writeGoogleSheets(RPT_ATTENDANCE_OUTPUT, 'Raw Data!A:AA', values);
}

module.exports = {
  writeAttendanceToGoogleSheets,
  writeAbsencesToGoogleSheets
}
