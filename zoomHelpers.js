// require modules
let request = require ('request');
let jwt = require('jsonwebtoken');
let qs = require('querystring');
//set keys, accts
let key = 'eCWUVjT_QI21z6r7sltq8A';
let secret = 'lmOeqSkPi1rBLnih1Z6FZy68XT2SxZkDvFMR';

// acctIDs and names
let acctMain = ['-wVNuo2JRFynXliZS92Wpg','acctMain'];
let acctBaobob = ['4wJXp2PtRV-2pJomy4FcfQ','acctBaobob'];
let acctCherryblossom = ['DnSMCDCJQnerUndvwyL9QA','acctCherryblossom'];
let acctDogwood = ['pg5-t-fZRYauwh9gywSn5w','acctDogwood'];

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

function getLiveAttendance(cb) {
  delay(1000, ()=>{globalAttendance(acctIdArr[0],1)})
  delay(2100, ()=>{globalAttendance(acctIdArr[1],2)})
  delay(3200, ()=>{globalAttendance(acctIdArr[2],3)})
  delay(4300, ()=>{globalAttendance(acctIdArr[3],4)})
  delay(8000, ()=>{resultsLoop(cb)})
}

module.exports = {
  getLiveAttendance: getLiveAttendance
}
