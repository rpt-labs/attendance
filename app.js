require('dotenv').config();
var express = require('express');
var port = process.env.SERVER_PORT;
const { getAbsenceData } = require('./utils/analyzeAbsences');
const { students, absenceRecords } = require('./db/fakeStudentData');
const bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

//can use real data from the absence tab, or the fake student data above for developement
app.get('/absences', async function(req, res) {
  //let absences = await getAbsenceData();
  res.send(absenceRecords);
});

app.get('/absences/student/:id', function(req, res) {
  let { id } = req.params;
  let matchingRecords = absenceRecords.filter((record) => record.studentId === parseInt(id));
  res.send(matchingRecords);
});

app.listen(port, () => console.log(`listening on port ${port}`));
