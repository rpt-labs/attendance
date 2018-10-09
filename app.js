require('dotenv').config();
var express = require('express');
var port = process.env.SERVER_PORT;
const { getAbsenceData } = require('./utils/analyzeAbsences');
const zutils = require('./zoomHelpers');
const { getAttendanceNoLog } = require('./utils/takeAttendanceNoLog');
const asyncMiddleware = require('./utils/asyncMiddleware');

var app = express();
app.use(express.static('public'));
app.get('/absences', asyncMiddleware(async(req, res) => {
  let absences = await getAbsenceData();
  res.send(absences);
}));

app.get('/takeAttendance/:cohorts', asyncMiddleware(async(req, res) => {
  let { cohorts } = req.params;
  cohorts = cohorts.split('+');
  let results = {};
  let rawAttendance = await zutils.getLiveAttendanceNoLog();
  let formattedAttendance = await getAttendanceNoLog(rawAttendance, cohorts);
  //let sortedStudents = formattedAttendance.present.sort((a, b) => a.timeJoined > b.timeJoined);
  res.send({ results: formattedAttendance });
}));

app.listen(port, () => console.log(`listening on port ${port}`));
