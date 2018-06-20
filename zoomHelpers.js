// require modules
require('dotenv').config()
let request = require ('request');
let jwt = require('jsonwebtoken');
let qs = require('querystring');
//set keys, accts
let key = process.env.ZOOM_API_KEY;
let secret = process.env.ZOOM_API_SECRET;

// acctIDs and names
let acctMain = [process.env.MAIN_ACCT_ID, 'acctMain'];
let acctBaobob = [process.env.BAOBOB_ACCT_ID, 'acctBaobob'];
let acctCherryblossom = [process.env.CHERRYBLOSSOM_ACCT_ID, 'acctCherryblossom'];
let acctDogwood = [process.env.DOGWOOD_ACCT_ID, 'acctDogwood'];

//set time for token validity
let convertToSeconds = 1000; // 1000 ms in 1 second
let secondsToAdd = 3600; // 3600 seconds in 1 hour
let hour = secondsToAdd * convertToSeconds;

//generate token
let payload = {
  iss: key,
  exp: ((new Date()).getTime() + hour)
};
let token = jwt.sign(payload, secret);

//global results array that gets populated and then handed over to attendanceBuilder
let results = [];

//accts in collection
let acctIdArr = [ acctBaobob, acctCherryblossom, acctDogwood, acctMain ];

//setTimeout helper function
function delay(ms, cb){
  setTimeout(cb,ms)
}

//1 second promise delay helper function. possibly not needed.
function oneSecondDelay() {
  return new Promise(resolve => {
    setTimeout(()=>{resolve()}, 1000)
  })
}

//zoom api call to get live meetings held by acctId
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
//zoom api call to get live participant data given room instance uuid
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
//global counter to help iterate across all live rooms collected
let counter  = 0;
//function blocking loop to get room stats once live room uuids have been collected
function resultsLoop(cb){
   setTimeout(async function () {
     if (results.length === 0 || results[counter] === undefined || results[counter].uuid === undefined) {
       cb([])
       return
     }
      let attendance = await getCurrentRoomStats(results[counter].uuid)
      attendance = JSON.parse(attendance)
      results[counter]['liveAttendance'] = attendance.participants
      counter++;
      if (counter < results.length) {
         resultsLoop(cb);
      } else {
        cb(results)
        return
      }
   }, 1000)
}
//get attendance from all rooms
async function globalAttendance(acctId, uselessNum) {
  let dataCar = "🚐 ... ";
  let dataConvoy = Array(uselessNum).join(dataCar)
  console.log(`${dataConvoy} Asking Zoom for datas from ${acctId[1]}`)
  let allMtgs = await getAllLiveMeetings(acctId[0])
  allMtgs = JSON.parse(allMtgs)
  allMtgs.meetings.forEach(mtg => {
    mtg['host_name'] = acctId[1]
  })
  results = results.concat(allMtgs.meetings)
}
//zoom api call to fetch live attendance
function getLiveAttendance(cb) {
  delay(1000, ()=>{globalAttendance(acctIdArr[0],1)})
  delay(2100, ()=>{globalAttendance(acctIdArr[1],2)})
  delay(3200, ()=>{globalAttendance(acctIdArr[2],3)})
  delay(4300, ()=>{globalAttendance(acctIdArr[3],4)})
  delay(8000, ()=>{resultsLoop(cb)})
}
//zoom api call to fetch all room instances that were held within a certain timeframe
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


module.exports = {
  getLiveAttendance: getLiveAttendance
}
