const axios = require('axios');
const { SHEETS_UTIL_URL, SHEETS_UTIL_API_KEY } = process.env;

async function readGoogleSheets(spreadsheetId, range) {
  let results;

  try {
    results = await axios({
      method: 'get',
      url: SHEETS_UTIL_URL,
      headers: {
        'x-api-key': SHEETS_UTIL_API_KEY
      },
      params: {
        spreadsheetId,
        range
      }
    });
  } catch (error) {
    console.log('error reading google sheets data');
  }

  return results.data || "error reading google sheets data";
}

async function writeGoogleSheets(spreadsheetId, range, values) {
  let results;

  try {
    results = await axios({
      method: 'post',
      url: SHEETS_UTIL_URL,
      headers: {
        'x-api-key': SHEETS_UTIL_API_KEY
      },
      params: {
        spreadsheetId,
        range
      },
      data: {
        values
      }
    });
  } catch (error) {
    console.log('error writing to google sheets', error)
  }

  return results.data || "error writing google sheets data";
}

module.exports = { readGoogleSheets, writeGoogleSheets };
