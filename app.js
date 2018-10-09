require('dotenv').config();
const express = require('express');
const port = process.env.SERVER_PORT;
const cors = require('cors');
const { getAttendanceNoLog } = require('./utils/takeAttendanceNoLog');
const { getAbsenceData } = require('./utils/analyzeAbsences');
const zutils = require('./zoomHelpers');
const asyncMiddleware = require('./utils/asyncMiddleware');

var app = express();
app.use(express.static('public'));
app.get('/absences', asyncMiddleware(async(req, res) => {
  let absences = await getAbsenceData();
  res.send(absences);
}));

app.get('/takeAttendance/:cohorts', cors(), asyncMiddleware(async(req, res) => {
  let { cohorts } = req.params;
  cohorts = cohorts.split('+');
  let rawAttendance = await zutils.getLiveAttendanceNoLog();
  let formattedAttendance = await getAttendanceNoLog(rawAttendance, cohorts);
  //let sortedStudents = formattedAttendance.present.sort((a, b) => a.timeJoined > b.timeJoined);
  res.send({ results: formattedAttendance });
}));

app.listen(port, () => console.log(`listening on port ${port}`));
