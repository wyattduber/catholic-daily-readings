const express = require('express');

const app = express();
const PORT = 7373;

app.use(express.json());

app.get('/getDailyReadings/:date', async (req, res) => {
  const { date } = req.params;
  const url = `https://dailygospel.org/AM/gospel/${date}`;

  try {
    const response = await fetch(url);
    const html = await response.text();
    res.send(html);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
