const sheetsAuth = require('../sheetsAuth');
// grab absense data
const getAbsenceData = async () => {
  // fetch credentials to authorize
  const credentials = await sheetsAuth.googleSheetsCredentials();
  // authorize using credentials
  const authorize = await sheetsAuth.authorize(credentials);
  // with authorization, fetch absence data
  const absenceData = await sheetsAuth.formatSheetResults(authorize, process.env.RPT_ATTENDANCE_OUTPUT, 'Absences!A:C');
  return absenceData.slice(1);
};

const countAbsences = absenceData => {
  const absences = {};
  const values = [];
  for (let i = 0; i < absenceData.length; i++) {
    const student = absenceData[i];
    if (!absences[student]) {
      absences[student[0]] = 1;
    } else {
      absences[student[0]] += 1;
    }
  }
  for (const data in absences) {
    values.push([data, absences[data]]);
  }

  return values;
};

const sortAbsenceData = (absenceData, sortType) => {
  if (sortType === 'cohort') {
    return absenceData.sort((a, b) => {});
  }
  if (sortType === 'student') {
    return absenceData.sort((a, b) => {});
  }
  if (sortType === 'date') {
    return absenceData.sort((a, b) => {});
  }
  throw new Error('sort type must be of type cohort, student, or date');
};

// filter by cohort

// filter by student

// filter by date

// let test = async function() {
//   let hello = await getAbsenceData();
//   countAbsences(hello);
// }

// test();

module.exports = { getAbsenceData, countAbsences };
