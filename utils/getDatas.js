const {getAttendanceDatas, googleSheetsCredentials, authorize} = require('../sheetsAuth');

async function getDatas() {
  let credentials = await googleSheetsCredentials();
  // authorize using credentials
  let authorizeFunc = await authorize(credentials);
  // with authorization, fetch sheets data
  let studentsUnformatted = await getAttendanceDatas(authorizeFunc);
}

getDatas();