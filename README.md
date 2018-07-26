### Before getting started:
1. `npm install`
2. ensure you have `credentials.json`, `google_secret.json`, `.env` in project root
3. either remove require for `sampleData` in `runAttendance.js` or ensure you have one in `utils/sampleData.js` (only used when `DEBUG = true` in `runAttendance.js`)
4. run script for the first time (see below) and copy the authorization link to a browser to authenticate


### To run script, from project root...

👉 run `node runAttendance.js RPT0x RPT0y RPT0z` to take live attendance of a specific cohort

### To log raw zoom results to google sheets

👉 run `node runAttendance.js LOG RPT0x RPT0y RPT0z` where `LOG` is the first argument. Errythang is case sensitive so keep it caps.

### Example Usage:
`node runAttendance.js RPT05 RPT06` _// returns attendance for cohorts RPT05 and RPT06_
`node runAttendance.js LOG RPT05 RPT06` _// logs all zoom data fetched to google sheets and returns attendance for cohorts RPT05 and RPT06_

NOTE: you must be running node 8.11 and above for this script to work


### Known Problems/Inefficiencies:
1. matchStudents.js is very basic in its matching. It goes for exact matches but if not it will look for parts of matches within full names. This means a common name like 'John' might be matched across several names 'Johnny Boy', as well as 'John The Great'. These matches will output as yellow, and print out what the match was for manual verification of accuracy.
2. zoomHelpers.js is not clean code. One of the main constraints with Zoom API is that requests are throttled to 1 request per second. For that reason, the function `getLiveAttendance` throttles the rate at which each query is made. It could definitely be written better `¯\_(ツ)_/¯`

### How it works:

This script basically does the following:
1. Fetch cohort data from `https://docs.google.com/spreadsheets/d/1zoCbN_cev7pUy-yHlIw7xpnkgsqYOTR7_8GNL6Uryok/edit#gid=1037917149` where sheet `Attendance Data` pulls in enrolled, active students along with their zoom name if its particularly unique
2. Fetch live zoom participant data from the RPT zoom accounts hosting the zoom sessions
3. Flattens zoom data and writes raw data fetched from zoom to `https://docs.google.com/spreadsheets/d/13QoBe1gt_bEBPp_7snEBY96xguLtjmtuVhETAUgV-O8/edit#gid=0`
4. Matches the students present against the students we expect based on a basic matching logic
5. Prints to the console who is here with emphasis to who is ABSENT. Precarious matches are `yellow`
