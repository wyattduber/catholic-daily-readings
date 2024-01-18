// Church Calendar API
const dateURL = 'https://api.wyattduber.com/api/liturgical-day/today/';

// Function to determine liturgical season color and date
fetch(dateURL)
    .then(response => response.json())
    .then(data => {
        var dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        var date = new Date(data.date);

        // Add Header API Info (date, season, week, etc)
        document.getElementById('day-info').innerHTML =
        `
            <h2>Season: ${capFirstLetter(data.season)}</h2>
            <h3>${date.toLocaleDateString("en-US", dateOptions)}</h3>
        `;

        // Set Colors
        var colors = translateColor(data.celebrations[0].colour)
        document.body.style.backgroundImage = 'linear-gradient(240deg, ' + colors[0] + ', ' + colors[1] + ');';
        document.getElementById('day-info').style.backgroundColor = colors[2];
        document.getElementById('reading-content').style.backgroundColor = colors[2];
        //document.body.style.backgroundColor = colors[0];

        // Go through all celebrations for the day and list them
        document.getElementById('day-info').innerHTML += `<h2>Celebrations</h2>`;
        for (var i = 0; i < data.celebrations.length; i++) {
            var celebration = data.celebrations[i];

            document.getElementById('day-info').innerHTML +=
            `
                <dl>
                    <dt>${celebration.title}</dt>
                    <dd>Rank: ${capFirstLetter(celebration.rank)}</dd>
                    <dd>Rank Number: ${celebration.rank_num}</dd>
                    <dd>Color: ${capFirstLetter(celebration.colour)}</dd>
                </dl>
            `;
        }

        // Then do readings page
	getDailyReadings(data.date)
	    .then((dailyReadingsData) => {
        console.log(dailyReadingsData);
        document.getElementById('reading-content').innerHTML = `<h2>${data.title}</h2><p>${data.reading}</p>`;
  })
  .catch((error) => console.error(error));

    })
    .catch(error => {
	console.error('Error fetching data:', error);
	document.getElementById('day-info').innerHTML = `<p>An Error occured while loading the daily readings.</p>`;
    });

function translateColor(color) {
    switch (color) { // Returns Background Gradient 1, Background Gradient 2, and Box Color
        case "violet":
            return ["#4B365F", "#7D5F9B", "#AD80D9"]
        case "green":
            return ["#186420", "#549B5C", "#5FCB6A"]
        case "red":
            return ["#d80707", "#CF3636", "#EE7474"]
        case "gold":
            return ["#d4af37", "#DEC05D", "#DCC681"]
        default:
            return ["white", ""]
    }
}

function capFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function getDailyReadings(dateStr) {
  const url = `http://localhost:7373/getDailyReadings/${dateStr}`;
  const response = await fetch(url);
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const readings = {};

  // Extract first reading
  const firstReading = doc.querySelector('.first-reading');
  if (firstReading) {
    readings.first_reading = firstReading.textContent.trim();
  }

  // Extract second reading
  const secondReading = doc.querySelector('.second-reading');
  if (secondReading) {
    readings.second_reading = secondReading.textContent.trim();
  }

  // Extract responsorial psalm
  const responsorialPsalm = doc.querySelector('.responsorial-psalm');
  if (responsorialPsalm) {
    readings.responsorial_psalm = responsorialPsalm.textContent.trim();
  }

  // Extract gospel reading
  const gospelReading = doc.querySelector('.gospel');
  if (gospelReading) {
    readings.gospel_reading = gospelReading.textContent.trim();
  }

  return readings;
}
