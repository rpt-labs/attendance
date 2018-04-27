// require modules
let request = require ('request');
let jwt = require('jsonwebtoken');
let qs = require('querystring');
//set keys, accts
let key = 'eCWUVjT_QI21z6r7sltq8A';
let secret = 'lmOeqSkPi1rBLnih1Z6FZy68XT2SxZkDvFMR';

let acctMain = ['-wVNuo2JRFynXliZS92Wpg','acctMain'];
let acctBaobob = ['4wJXp2PtRV-2pJomy4FcfQ','acctBaobob'];
let acctCherryblossom = ['DnSMCDCJQnerUndvwyL9QA','acctCherryblossom'];
let acctDogwood = ['pg5-t-fZRYauwh9gywSn5w','acctDogwood'];


let convertToSeconds = 1000; // 1000 ms in 1 second
let secondsToAdd = 3600; // 3600 seconds in 1 hour
let hour = secondsToAdd * convertToSeconds;

//generate token
let payload = {
  iss: key,
  exp: ((new Date()).getTime() + hour)
};

let token = jwt.sign(payload, secret);

let results = [];

let acctIdArr = [ acctBaobob, acctCherryblossom, acctDogwood, acctMain ];

function delay(ms, cb){
  setTimeout(cb,ms)
}

function oneSecondDelay() {
  return new Promise(resolve => {
    setTimeout(()=>{resolve()}, 1000)
  })
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

function getCurrentRoomStats(roomUUId) {

  let zoomOptions = {
    url: `https://api.zoom.us/v2/metrics/meetings/${roomUUId}/participants`,
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

let counter  = 0;

function resultsLoop(cb){
   setTimeout(async function () {
      let attendance = await getCurrentRoomStats(results[counter].uuid)
      attendance = JSON.parse(attendance)
      results[counter]['liveAttendance'] = attendance.participants
      counter++;
      if (counter < results.length) {
         resultsLoop(cb);
      } else {
        cb(results)
      }
   }, 1000)
}

async function globalAttendance(acctId) {
  let allMtgs = await getAllLiveMeetings(acctId[0])
  allMtgs = JSON.parse(allMtgs)
  allMtgs.meetings.forEach(mtg => {
    mtg['host_name'] = acctId[1]
  })
  results = results.concat(allMtgs.meetings)
  await oneSecondDelay()


}

function getLiveAttendance(cb) {
  delay(1000, ()=>{globalAttendance(acctIdArr[0])})
  delay(2100, ()=>{globalAttendance(acctIdArr[1])})
  delay(3200, ()=>{globalAttendance(acctIdArr[2])})
  delay(4300, ()=>{globalAttendance(acctIdArr[3])})
  delay(8000, ()=>{resultsLoop(cb)})
}

module.exports = {
  getLiveAttendance: getLiveAttendance
}
