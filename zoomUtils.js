// require modules
let request = require ('request');
let jwt = require('jsonwebtoken');
let qs = require('querystring');
//set keys, accts
let intKey = 'VLTnxlXqS6iEtEy-GtOs3A';
let intSecret = 'NdnxSluTWzIDNdyQZlEDADxHZi8AE80Ic9kP';

let key = 'eCWUVjT_QI21z6r7sltq8A';
let secret = 'lmOeqSkPi1rBLnih1Z6rptMZy68XT2SxZkDvFMR';

let acctMain = '-wVNuo2JRFynXliZS92Wpg';
let acctBaobob = '4wJXp2PtRV-2pJomy4FcfQ';
let acctCherryblossom = 'DnSMCDCJQnerUndvwyL9QA';
let acctDogwood = 'pg5-t-fZRYauwh9gywSn5w';

let convertToSeconds = 1000; // 1000 ms in 1 second
let secondsToAdd = 3600; // 3600 seconds in 1 hour
let hour = secondsToAdd * convertToSeconds;

//generate token
let payload = {
  iss: key,
  exp: ((new Date()).getTime() + hour)
};

let token = jwt.sign(payload, secret);
console.log(token);

getLiveRoomData('618209372')
//this call will get a live snapshot of who is in the room if given a room ID
function getLiveRoomData(roomId) {

  let zoomOptions = {
    url: `https://api.zoom.us/v2/metrics/meetings/${roomId}/participants`,
    auth: {
      bearer: token,
    },
    method: 'GET',
    headers: {
      'User-Agent': 'request'
    },
    qs: {
      page_size: 300,
      type: 'live'
    },
  };

  return new Promise( (resolve, reject) => {
    request(zoomOptions, (error, response, body) => {
      if (error) {
        console.log('error')
        console.log(error)
        reject(error)
      } else if (body) {
        console.log('body')
        console.log(body)
        resolve(body)
      } else {
        console.log('response')
        console.log(response)
        resolve(response)
      }
      //end request
    })
    //end promise
  })
  //end fcn
}

//this call will fetch a single meeting's stats
function getCurrentRoomStats(roomUUId) {

  let zoomOptions = {
    url: `https://api.zoom.us/v2/report/meetings/${roomUUId}/participants`,
    auth: {
      bearer: token,
    },
    method: 'GET',
    headers: {
      'User-Agent': 'request'
    },
    qs: {
      page_size: 300,
    },
  };

  return new Promise( (resolve, reject) => {
    request(zoomOptions, (error, response, body) => {
      if (error) {
        reject(error)
      } else if (body) {
        resolve(body)
      } else {
        resolve(response)
      }
      //end request
    })
    //end promise
  })
  //end fcn
}



function getAllLiveMeetings(acctId) {
  let zoomOptions = {
    url: `https://api.zoom.us/v2/users/${acctId}/meetings`,
    auth: {
      bearer: token,
    },
    method: 'GET',
    headers: {
      'User-Agent': 'request'
    },
    qs: {
      page_size: 300,
      type: 'live',
    },
  };

  return new Promise( (resolve, reject) => {
    request(zoomOptions, (error, response, body) => {
      if (error) {
        reject(error)
      } else if (body) {
        resolve(body)
      } else {
        resolve(response)
      }
      //end request
    })
    //end promise
  })
  //end fcn
}


//this call will fetch all room instances that were held within a certain timeframe
function getRoomUUIds(startDate, endDate, acctId) {

  let zoomOptions = {
    url: `https://api.zoom.us/v2/report/users/${acctId}/meetings`,
    auth: {
      bearer: token,
    },
    method: 'GET',
    headers: {
      'User-Agent': 'request'
    },
    qs: {
      page_size: 300,
      from: startDate,
      to: endDate,
    },
  };

  return new Promise( (resolve, reject) => {
    request(zoomOptions, (error, response, body) => {
      if (error) {
        reject(error)
      } else if (body) {
        resolve(body)
      } else {
        resolve(response)
      }
      //end request
    })
    //end promise
  })
  //end fcn
}


//this function will return an entire attendance report based on start/end date formatted as "YYYY-MM-DD"
async function executeAttendanceReport (startDate, endDate) {

  let classSession = await getRoomUUIds(startDate, endDate);
  classSession = JSON.parse(classSession);

  for (let i = 0; i < classSession.meetings.length; i++) {
    let classroom = classSession.meetings[i];
    classroom.attendance = await getCurrentRoomStats(classroom.uuid);
    classroom.attendance = JSON.parse(classroom.attendance);
  }
  // console.log(JSON.stringify(classSession))
  return classSession
}

//this function will return a snapshot of who is in a room given roomid as a string
async function executeLiveAttendance (roomId) {
  let liveZoom = await getLiveRoomData(roomId)
  return liveZoom
}


//this function will return a snapshot of who is in all rooms
async function executeAllLiveAttendance (acctIds) {
  console.log("acct IDs:" ,acctIds)
  let classSession;
  if ( Array.isArray(acctIds) ) {
     classSession = [];


  } else {
    classSession = await getAllLiveMeetings(acctIds);
  }
  // console.log(classSession)
  classSession = JSON.parse(classSession);
  console.log(classSession)
  for (let i = 0; i < classSession.meetings.length; i++) {
    let classRoom = classSession.meetings[i];

    classRoom.liveAttendance = await executeLiveAttendance(classRoom.uuid);
    classRoom.liveAttendance = JSON.parse(classRoom.liveAttendance);
  }
  // console.log(' 🚥  🚥  🚥  COPY ME IM RAW DATA 🚥  🚥  🚥  ')
  // console.log(JSON.stringify(classSession))
  // console.log(' 🚥  🚥  🚥  🚥  🚥  🚥  🚥  🚥  🚥  🚥  🚥  🚥 ')
  return classSession
}

module.exports = {
  executeAttendanceReport: executeAttendanceReport, // (startDate, endDate)
  executeLiveAttendance: executeLiveAttendance, // ( roomId as a string )
  executeAllLiveAttendance: executeAllLiveAttendance, // (no args)
}
