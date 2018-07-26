### from project root...

👉 run `node runAttendance.js RPT0x RPT0y RPT0z` to take live attendance of a specific cohort

### to log raw zoom results to google sheets

👉 run `node runAttendance.js LOG RPT0x RPT0y RPT0z` where `LOG` is the first argument. Errythang is case sensitive so keep it caps.

### example:
`node runAttendance.js RPT05 RPT06` _// returns attendance for cohorts RPT05 and RPT06_

NOTE: you must be running node 8.11 and above for this script to work
