// require modules
require('dotenv').config();
const request = require('request');
const jwt = require('jsonwebtoken');
const qs = require('querystring');
// set keys, accts
const key = process.env.ZOOM_API_KEY;
const secret = process.env.ZOOM_API_SECRET;

// acctIDs and names
const acctMain = [process.env.MAIN_ACCT_ID, 'acctMain'];
const acctBaobob = [process.env.BAOBOB_ACCT_ID, 'acctBaobob'];
const acctCherryblossom = [process.env.CHERRYBLOSSOM_ACCT_ID, 'acctCherryblossom'];
const acctDogwood = [process.env.DOGWOOD_ACCT_ID, 'acctDogwood'];
const acctEucalyptus = [process.env.EUCALYPTUS_ACCT_ID, 'acctEucalyptus'];
const acctFir = [process.env.FIR_ACCT_ID, 'acctFir'];
const acctAcacia = [process.env.ACACIA_ACCT_ID, 'acctAcacia'];

// set time for token validity
const convertToSeconds = 1000; // 1000 ms in 1 second
const secondsToAdd = 3600; // 3600 seconds in 1 hour
const hour = secondsToAdd * convertToSeconds;

// generate token
const payload = {
  iss: key,
  exp: new Date().getTime() + hour
};
const token = jwt.sign(payload, secret);

// global results array that gets populated and then handed over to attendanceBuilder
let results = [];

// accts in collection
const acctIdArr = [acctBaobob, acctCherryblossom, acctDogwood, acctMain, acctEucalyptus, acctFir, acctAcacia];

// setTimeout helper function
function delay(ms, cb) {
  setTimeout(cb, ms);
}

function promiseDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// zoom api call to get live meetings held by acctId
function getAllLiveMeetings(acctId) {
  const zoomOptions = {
    url: `https://api.zoom.us/v2/users/${acctId}/meetings`,
    auth: {
      bearer: token
    },
    method: 'GET',
    headers: {
      'User-Agent': 'request'
    },
    qs: {
      page_size: 300,
      type: 'live'
    }
  };

  return new Promise((resolve, reject) => {
    request(zoomOptions, (error, response, body) => {
      if (error) {
        reject(error);
      } else if (body) {
        resolve(body);
      } else {
        resolve(response);
      }
      // end request
    });
    // end promise
  });
  // end fcn
}
// zoom api call to get live participant data given room instance uuid
function getCurrentRoomStats(roomUUId) {
  const zoomOptions = {
    url: `https://api.zoom.us/v2/metrics/meetings/${roomUUId}/participants`,
    auth: {
      bearer: token
    },
    method: 'GET',
    headers: {
      'User-Agent': 'request'
    },
    qs: {
      page_size: 300
    }
  };

  return new Promise((resolve, reject) => {
    request(zoomOptions, (error, response, body) => {
      if (error) {
        reject(error);
      } else if (body) {
        resolve(body);
      } else {
        resolve(response);
      }
      // end request
    });
    // end promise
  });
  // end fcn
}
// global counter to help iterate across all live rooms collected
let counter = 0;
/*
  function blocking loop to get room stats once live room uuids have been collected
  it takes a callback for console logging only, and otherwise returns for api call
*/
async function resultsLoop(cb) {
  if (results.length === 0 || results[counter] === undefined || results[counter].uuid === undefined) {
    if (cb) {
      cb([]);
    } else {
      return [];
    }
  }

  let attendance = await getCurrentRoomStats(results[counter].uuid);
  attendance = JSON.parse(attendance);
  results[counter].liveAttendance = attendance.participants;
  counter += 1;
  if (counter < results.length) {
    resultsLoop(cb);
  } else if (cb) {
    cb(results);
  } else {
  }
}
// get attendance from all rooms
async function globalAttendance(acctId, uselessNum) {
  const dataCar = '🚐 ... ';
  const dataConvoy = Array(uselessNum).join(dataCar);
  console.log(`${dataConvoy} Asking Zoom for datas from ${acctId[1]}`);
  let allMtgs = await getAllLiveMeetings(acctId[0]);
  allMtgs = JSON.parse(allMtgs);
  allMtgs.meetings.forEach(mtg => {
    mtg.host_name = acctId[1];
  });
  results = results.concat(allMtgs.meetings);
  return `complete ${acctId}, current state of results, ${results}`;
}
async function getLiveAttendanceNoLog() {
  let accountNumber = 0;
  let done = false;
  // gets all live meeting rooms
  while (!done) {
    const account = await globalAttendance(acctIdArr[accountNumber], accountNumber + 1);
    const delay = await promiseDelay(1200);
    accountNumber += 1;
    if (accountNumber === acctIdArr.length) {
      done = true;
    }
  }
  // gets participant information for all current live meetings, updating results
  const findStudents = await resultsLoop();
  return results;
}
// zoom api call to fetch live attendance
function getLiveAttendance(cb) {
  delay(1000, () => {
    globalAttendance(acctIdArr[0], 1);
  });
  delay(2100, () => {
    globalAttendance(acctIdArr[1], 2);
  });
  delay(3200, () => {
    globalAttendance(acctIdArr[2], 3);
  });
  delay(4300, () => {
    globalAttendance(acctIdArr[3], 4);
  });
  delay(5400, () => {
    globalAttendance(acctIdArr[4], 5);
  });
  delay(6500, () => {
    globalAttendance(acctIdArr[5], 6);
  });
  delay(7600, () => {
    globalAttendance(acctIdArr[6], 7);
  });
  delay(8000, () => {
    resultsLoop(cb);
  });
}
// zoom api call to fetch all room instances that were held within a certain timeframe
function getAcctMeetingHistory(startDate, endDate, acctId) {
  const zoomOptions = {
    url: `https://api.zoom.us/v2/report/users/${acctId}/meetings`,
    auth: {
      bearer: token
    },
    method: 'GET',
    headers: {
      'User-Agent': 'request'
    },
    qs: {
      page_size: 300,
      from: startDate,
      to: endDate
    }
  };

  return new Promise((resolve, reject) => {
    request(zoomOptions, (error, response, body) => {
      if (error) {
        reject(error);
      } else if (body) {
        resolve(body);
      } else {
        resolve(response);
      }
      // end request
    });
    // end promise
  });
  // end fcn
}

module.exports = {
  getLiveAttendance,
  getLiveAttendanceNoLog
};
