const sheetsAuth = require('../sheetsAuth');

function findAbsentAndPresentStudents(attendanceObj) {
  const delinquents = [];
  const present = [];

  Object.keys(attendanceObj).forEach(cohort => {
    for (let i = 0; i < attendanceObj[cohort].length; i += 1) {
      const stuObj = attendanceObj[cohort][i];
      if (attendanceObj[cohort][i].absent) {
        delinquents.push(stuObj);
      } else {
        present.push(stuObj);
      }
    }
  });

  return { absent: delinquents, present };
}
async function writeAbsencesToGoogleSheets(attendanceObj) {
  // create global Google Sheets 'values' output
  const values = [];
  const absentees = findAbsentAndPresentStudents(attendanceObj).absent;
  const today = Date();

  absentees.forEach(obj => values.push([obj.name, obj.cohort, today]));
  // fetch credentials to authorize
  const credentials = await sheetsAuth.googleSheetsCredentials();
  // authorize using credentials
  const authorize = await sheetsAuth.authorize(credentials);
  console.log('the absent students, before writing to google sheets', absentees.map(x => x.name));
  sheetsAuth.writeSheetResults(authorize, values, process.env.RPT_ATTENDANCE_OUTPUT, 'Absences!A:C');
}

async function writeAttendanceToGoogleSheets(input) {
  // create global Google Sheets 'values' output
  const values = [];
  // map
  input.forEach(obj => {
    const value = [];
    // create most verbose zoom object
    const zoomObj = {
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
      timestamp: obj.timestamp || 'null'
    };

    Object.keys(zoomObj).forEach(key => {
      value.push(zoomObj[key]);
    });

    values.push(value);
  });

  // fetch credentials to authorize
  const credentials = await sheetsAuth.googleSheetsCredentials();

  // authorize using credentials
  const authorize = await sheetsAuth.authorize(credentials);

  sheetsAuth.writeSheetResults(authorize, values, process.env.RPT_ATTENDANCE_OUTPUT, 'Raw Data!A:AA');
}

module.exports = {
  findAbsentAndPresentStudents,
  writeAttendanceToGoogleSheets,
  writeAbsencesToGoogleSheets
};
