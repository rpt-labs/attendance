require('dotenv').config();
var express = require('express');
var port = process.env.SERVER_PORT;
const { getAbsenceData, countAbsences } = require('./utils/analyzeAbsences');

var app = express();
app.get('/absences', async function(req, res) {
  let absences = await getAbsenceData();
  res.send(absences);
});


app.listen(port, () => console.log(`listening on port ${port}`));