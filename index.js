const express = require('express');
const cors = require('cors');
const { google } = require("googleapis");
const app = express();


app.use(cors({
  origin: 'https://json-sheet-api.vercel.app'
}));
// GOOGLE_SERVICE_ACCOUNT
const mySecret = process.env.TOKEN;


app.get('/', (req, res) => {
	res.send('Status: 200 (OK)');
  // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    //res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));
});

app.get('/:start/:end', async function (req, res) {
  // Set CORS headers: allow all origins, methods, and headers: you may want to lock this down in a production environment
    res.header("Access-Control-Allow-Origin", "*");
    //res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
  res.header("Access-Control-Allow-Methods", "GET");
    res.header("Access-Control-Allow-Headers", req.header('access-control-request-headers'));
  
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(mySecret),
        scopes: "https://www.googleapis.com/auth/spreadsheets",
      });
	
          // Create client instance for auth
  const client = await auth.getClient();

  // Instance of Google Sheets API
const googleSheets = google.sheets({ version: "v4", auth: client });

  // Change to your spreadsheet ID
  const spreadsheetId = req.params['start'];
  // Get metadata about spreadsheet
  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });
// Read rows from spreadsheet
const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: req.params['end'],
  });
  const rows = [];

  const rawRows = getRows.data.values || [];
  const headers = rawRows.shift();

  rawRows.forEach((row) => {
    const rowData = {};
    row.forEach((item, index) => {
      rowData[headers[index]] = item;
    });
    rows.push(rowData);
  });
//console.log(rows);

res.send(rows);
});


app.listen(1337, (req, res) => console.log("running on 1337")); // run nodemon index.js in the terminal: http://127.0.0.1:1337/

// I will add credit or inspiration later.
// Avoid a single error from crashing the server in production.
process.on("uncaughtException", (...args) => console.error(args));
process.on("unhandledRejection", (...args) => console.error(args));
