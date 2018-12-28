const { readGoogleSheets } = require('./sheetsUtil');
const { RPT_ATTENDANCE_OUTPUT } = process.env;

/*TODO:  Logic for analyzing absence data
  TODO:  Update when absence data is stored in db
*/

//grab absense data
const getAbsenceData = async() => {
  let absenceData = await readGoogleSheets(RPT_ATTENDANCE_OUTPUT, 'Absences!A:C');
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

module.exports = { getAbsenceData, countAbsences };