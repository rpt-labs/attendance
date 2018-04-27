// require modules
let request = require ('request');
let jwt = require('jsonwebtoken');
let qs = require('querystring');
//set keys, accts
let intKey = 'VLTnxlXqS6iEtEy-GtOs3A';
let intSecret = 'NdnxSluTWzIDNdyQZlEDADxHZi8AE80Ic9kP';

let key = 'eCWUVjT_QI21z6r7sltq8A';
let secret = 'lmOeqSkPi1rBLnih1Z6FZy68XT2SxZkDvFMR';

let acctMain = '-wVNuo2JRFynXliZS92Wpg';
let acctBaobob = '4wJXp2PtRV-2pJomy4FcfQ';
let acctCherryblossom = 'DnSMCDCJQnerUndvwyL9QA';
let acctDogwood = 'pg5-t-fZRYauwh9gywSn5w';

let acctIdArr = [ acctBaobob, acctCherryblossom, acctDogwood, acctMain];

let convertToSeconds = 1000; // 1000 ms in 1 second
let secondsToAdd = 3600; // 3600 seconds in 1 hour
let hour = secondsToAdd * convertToSeconds;

//generate token
let payload = {
  iss: key,
  exp: ((new Date()).getTime() + hour)
};

let token = jwt.sign(payload, secret);

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

//this call will get all live meetings with uuid from the acct id passed in
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
function getAcctMeetingHistory(startDate, endDate, acctId) {

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
        // console.log('error')
        // console.log(error)
        reject(error)
      } else if (body) {
        // console.log('body')
        // console.log(body)
        resolve(body)
      } else {
        // console.log('response')
        // console.log(response)
        resolve(response)
      }
      //end request
    })
    //end promise
  })
  //end fcn
}

//this function will return a snapshot of who is in all rooms
function getLiveClassSessions (acctIds) {
  let classSessions = []
  return new Promise ((resolve, reject) => {
    acctIds.forEach( async (id, idx, col) => {
      let singleClass = await getAllLiveMeetings(id);
      singleClass = JSON.parse(singleClass)
      console.log('💎💎💎💎💎💎💎💎💎 singleClass in classSessions 💎💎💎💎💎💎💎💎💎')
      console.log(JSON.stringify(singleClass))
      console.log('💎💎💎💎💎💎💎💎💎 singleClass in classSessions 💎💎💎💎💎💎💎💎💎')

      classSessions = classSessions.concat(singleClass.meetings)
      if (idx === (col.length - 1)) {
        resolve(classSessions)
      }
    })
  })
}

function buildSessionParticipants (classSessions) {
  return new Promise ((resolve, reject) => {
    classSessions.forEach( async (classRoom, index, arr) => {
      classRoom.liveAttendance = await getLiveRoomData(classRoom.id);
      classRoom.liveAttendance = JSON.parse(classRoom.liveAttendance);
      if (index === (arr.length - 1)){
        resolve(classSessions)
      }
    })
  })
}

async function globalAttendance(acctId){
  let liveClassSessions = await getAllLiveMeetings(acctId)
  console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥 RAW DATA for classSessions🔥🔥🔥🔥🔥🔥🔥🔥🔥')
  console.log(JSON.stringify(liveClassSessions))
  console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥 RAW DATA for classSessions🔥🔥🔥🔥🔥🔥🔥🔥🔥')
  let builtAttendance = await buildSessionParticipants(liveClassSessions)
  console.log('🌴🌴🌴🌴🌴🌴🌴🌴🌴 RAW DATA for classSessions with liveAttendance 🌴🌴🌴🌴🌴🌴🌴🌴🌴')
  console.log(JSON.stringify(builtAttendance))
  console.log('🌴🌴🌴🌴🌴🌴🌴🌴🌴 RAW DATA for classSessions with liveAttendance 🌴🌴🌴🌴🌴🌴🌴🌴🌴')
  return builtAttendance
}

module.exports = {
  executeAttendanceReport: executeAttendanceReport, // (startDate, endDate)
  executeLiveAttendance: executeLiveAttendance, // ( roomId as a string )
  globalAttendance: globalAttendance,

}
