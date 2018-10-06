const sheetsAuth = require('../sheetsAuth');
//grab absense data
const getAbsenceData = async() => {
  // fetch credentials to authorize
  let credentials = await sheetsAuth.googleSheetsCredentials();
  // authorize using credentials
  let authorize = await sheetsAuth.authorize(credentials);
  // with authorization, fetch absence data
  let absenceData = await sheetsAuth.formatSheetResults(authorize, process.env.RPT_ATTENDANCE_OUTPUT, 'Absences!A:C');
  return absenceData.slice(1);
}

const countAbsences = (absenceData) => {
  let absences = {};
  let values = [];
  for (var i = 0; i < absenceData.length; i++) {
    let student = absenceData[i];
    if (!absences[student]) {
      absences[student[0]] = 1;
    } else {
      absences[student[0]] += 1;
    }
  }
  for (let data in absences) {
    values.push([data, absences[data]]);
  }

  return values;
}



const sortAbsenceData = (absenceData, sortType) => {
  if (sortType === 'cohort') {
    return absenceData.sort((a, b) => {

    });

  } else if (sortType === 'student') {
    return absenceData.sort((a, b) => {

    });

  } else if (sortType === 'date') {
    return absenceData.sort((a, b) => {

    });

  } else {
    throw new Error("sort type must be of type cohort, student, or date");
  }
}

//filter by cohort

//filter by student

//filter by date


// let test = async function() {
//   let hello = await getAbsenceData();
//   countAbsences(hello);
// }

// test();

module.exports = { getAbsenceData, countAbsences };