import * as denoDom from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";

const express = require('express');
const app = express();
const PORT = 7373;

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

app.get('/getDailyReadings/:date', async (req, res) => {
  const { date } = req.params;
  const url = `https://dailygospel.org/AM/gospel/${date}`;

  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new denoDom();
    const doc = parser.parseFromString(html, 'text/html');
    res.send(doc);
  } catch (error) {
    console.error('Error fetching daily readings: ' + error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/getLiturgicalDay/today', async (req, res) => {
  const dateURL = 'https://api.wyattduber.com/api/liturgical-day/today/';

  try {
    const response = await fetch(dateURL);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching liturgical day:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/getLiturgicalDay/:year/:month/:day', async (req, res) => {
  const { year, month, day } = req.params;
  const dateURL = 'https://api.wyattduber.com/api/liturgical-day/today/';

  try {
    const response = await fetch(dateURL);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching liturgical day:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
