require('dotenv').config();
const express = require('express');

const port = process.env.PORT || 3001;
const cors = require('cors');
const { getAttendanceNoLog } = require('./utils/takeAttendanceNoLog');
const { getAbsenceData } = require('./utils/analyzeAbsences');
const zutils = require('./zoomHelpers');
const asyncMiddleware = require('./utils/asyncMiddleware');
const students = require('./server/routes/students');
const cohorts = require('./server/routes/cohorts');

const app = express();
app.use(express.static('public'));
app.get(
  '/absences',
  asyncMiddleware(async (req, res) => {
    const absences = await getAbsenceData();
    res.send(absences);
  })
);

app.get(
  '/takeAttendance/:cohorts',
  cors(),
  asyncMiddleware(async (req, res) => {
    let { cohorts } = req.params;
    cohorts = cohorts.split('+');
    const rawAttendance = await zutils.getLiveAttendanceNoLog();
    const formattedAttendance = await getAttendanceNoLog(rawAttendance, cohorts);
    // TODO: present students by timestamp
    res.send({ results: formattedAttendance });
  })
);

// cohorts
app.use('/attendance/cohorts', cohorts);

// students
app.use('/attendance/students', students);

app.listen(port, () => console.log(`listening on port ${port}`));
