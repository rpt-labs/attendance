### Before getting started:
1. `npm install`
2. Get the SHEETS_UTIL_URL and SHEETS_UTIL_API_KEY from lead tech mentor and place in .env folder at the root of the app.
3. either remove require for `sampleData` in `runAttendance.js` or ensure you have one in `utils/sampleData.js` (only used when `DEBUG = true` in `runAttendance.js`)
4. run script for the first time (see below)


### To run script, from project root...

👉 run `node runAttendance.js RPT0x RPT0y RPT0z` to take live attendance of a specific cohort

### To log raw zoom results to google sheets

👉 run `node runAttendance.js LOG RPT0x RPT0y RPT0z` where `LOG` is the first argument. Errythang is case sensitive so keep it caps.

### Example Usage:
`node runAttendance.js RPT05 RPT06` _// returns attendance for cohorts RPT05 and RPT06_

`node runAttendance.js LOG RPT05 RPT06` _// logs all zoom data fetched to google sheets and returns attendance for cohorts RPT05 and RPT06_

NOTE: you must be running node 8.11 and above for this script to work
NOTE: currently, the LOG command is being executed automatically.  You can run the script with no log command any time without interfering with the automated attendance taking.


### Known Problems/Inefficiencies:
1. matchStudents.js is very basic in its matching. It goes for exact matches but if not it will look for parts of matches within full names. This means a common name like 'John' might be matched across several names 'Johnny Boy', as well as 'John The Great'. These matches will output as yellow, and print out what the match was for manual verification of accuracy.
2. zoomHelpers.js is not clean code. One of the main constraints with Zoom API is that requests are throttled to 1 request per second. For that reason, the function `getLiveAttendance` throttles the rate at which each query is made. It could definitely be written better `¯\_(ツ)_/¯`

### How it works:

This script basically does the following:
1. Fetch cohort data from the RPT Attendnace Data spreadsheet, which pulls in enrolled, active students along with their zoom name
2. Fetch live zoom participant data from the RPT zoom accounts hosting the zoom sessions
3. Flattens zoom data and writes raw data fetched from zoom to RPT Attendance Data spreadsheet (if in LOG mode)
4. Matches the students present against the students we expect based on a basic matching logic
5. Prints to the console who is here with emphasis to who is ABSENT. Precarious matches are `yellow`
6.  Writes the absent student data to RPT Attendance Data spreadsheet (if in LOG mode)
