require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete credentials.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'credentials.json';

function googleSheetsCredentials() {
    // Load client secrets from a local file.
    return new Promise( (resolve, reject) => {
    fs.readFile('google_secret.json', (err, content) => {
      if (err) reject('Error loading client secret file:', err);
      // Authorize a client with credentials, then call the Google Sheets API.
      resolve(JSON.parse(content));
    });
  });
}

async function authorize(credentials) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);
  // Check if we have previously stored a token.
  return new Promise( (resolve, reject) => {
    fs.readFile(TOKEN_PATH, async (err, token) => {
      if (err) {
        console.log('🐸');
        console.log(err);
        let newToken = await getNewToken(oAuth2Client);
        resolve(newToken);
      } else {
        oAuth2Client.setCredentials(JSON.parse(token));
        resolve(oAuth2Client);
      }
    });
  });
}

function getNewToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('😎 Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise( (resolve, reject) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) reject(err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) reject(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        resolve(oAuth2Client);
      });
    });
  });
}

function formatSheetResults(auth, spreadsheetId, range) {
  return new Promise( (resolve, reject) => {
    const sheets = google.sheets({version: 'v4', auth});
    sheets.spreadsheets.values.get({
      //spreadsheetId: process.env.RPT_ROSTER_SHEET_ID,
      // range: 'Attendance Data!A:E',
      spreadsheetId,
      range
    }, (err, {data}) => {
      if (err) reject('The API returned an error: ' + err);
      const rows = data.values;
      if (rows.length) {
        resolve(rows)
      } else {
        resolve('No data found.');
      }
    });
  })
}

function writeSheetResults(auth, body, spreadsheetId, range) {
  const sheets = google.sheets({version: 'v4', auth});
  sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    // spreadsheetId: process.env.RPT_ATTENDANCE_OUTPUT,
    // range: 'Raw Data!A:AA',
    valueInputOption: 'RAW',
    resource: {values: body}
  })
}



module.exports = {
  googleSheetsCredentials: googleSheetsCredentials,
  authorize: authorize,
  formatSheetResults: formatSheetResults,
  writeSheetResults: writeSheetResults,
}
