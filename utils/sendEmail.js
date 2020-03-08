require('dotenv').config();
const AWS = require('aws-sdk');

const SESConfig = {
  apiVersion: '2010-12-01',
  accessKeyId: process.env.AWS_SES_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  region: process.env.AWS_SES_REGION
};

const params = {
  Source: process.env.AWS_SES_SOURCE_EMAIL,
  Destination: {
    ToAddresses: [process.env.AWS_SES_DESTINATION_EMAIL]
  },
  ReplyToAddresses: [process.env.AWS_SES_SOURCE_EMAIL],
  Message: {
    Body: {
      Html: {
        Charset: 'UTF-8',
        Data: ''
      }
    },
    Subject: {
      Charset: 'UTF-8',
      Data: `Absence Report - ${new Date()}`
    }
  }
};

function filterAbsentStudents(attendanceObj) {
  const studentsObj = {};
  Object.keys(attendanceObj).forEach(key => {
    if (!studentsObj[key]) {
      const filteredStudents = attendanceObj[key]
        .filter(student => student.absent === true)
        .map(student => student.name)
      studentsObj[key] = filteredStudents;
    }
  });
  return studentsObj;
}

function constructFormattedMessageBody(studentsList) {
  let messageBody = '';
  if (Object.keys(studentsList).length) {
    Object.keys(studentsList).forEach(key => {
      messageBody += `<h1 style="color:brown;font-size:20px;">${key}</h1>
      <li style="list-style-type: square;">${studentsList[key].join('</li><li>')}</li>
      `;
    });
  }

  return messageBody;
}

function sendEmail(attendanceObj) {
  const absentStudents = filterAbsentStudents(attendanceObj);

  const messageBody = constructFormattedMessageBody(absentStudents);

  params.Message.Body.Html.Data = messageBody.length
    ? messageBody
    : '<h1 style="color:Green;font-size:30px;">No Reported Absence!!!!</h1>';

  if (!messageBody.length) params.Message.Subject.Data = `No Reported Absence on ${new Date()} `;

  new AWS.SES(SESConfig)
    .sendEmail(params)
    .promise()
    .then(res => console.log(res));
}

module.exports = sendEmail;
