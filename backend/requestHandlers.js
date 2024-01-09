const fs = require('fs');
const database = require('./db.js');
const qs = require('querystring');

const db = new database(); // Starts the database connection for the handlers to use

var handlers = {
    default: function (request, response) { // This is where we will read the request, find the applicable file, and parse to insert anything from the database as needed
        let requestedFile = request.url.split("?")[0] !== "/" ? request.url.split("?")[0] : "/index.html"; // Sets default page to index.html; handles URL arguments by only accepting the text to the left of the first "?" char

        /* FIXME:
         - Read the requestedFile and figure out which page it's asking for
         - Based on which page it's asking for, create and call a new handler
         - In each handler, call the database object (see dbTest for examples) to find all the info needed for that specific page
         - Send the page to the client with response.write()
         - Before ending the connection, also write() a new string containing a `<script>` tag with all the JS needed to
           substitute the values obtained from the database into the HTML doc using `"document.getElementById('stuff').innerHTML = " + varFromDatabase;
         */

        fs.readFile(__dirname + "/../web" + requestedFile, function (err, data) {
            if (err) {
                console.error("Attempted serving \"" + requestedFile + "\" with error \"" + err + "\"");

                response.writeHead(404);
                response.end("<title>iTrakz Error: 404</title><h1 align='center'>404 - No noodles here!</h1>"); // 404 error if file not found
                return
            } else {
                console.log("Serving " + __dirname + "/web" + requestedFile); // Debug
            }

            let jsFromHandler = ""; // This will be filled in by the appropriate request handler and added to the end of the page
            switch (requestedFile) {
                case "/index.html":
                    jsFromHandler = handlers.homepage();
                    break;
            }

            response.writeHead(200);
            response.write(data + "\n" + jsFromHandler);
            response.end();
        })
    },

    homepage: function () {
        //Initialize the Script
        let homePageCode = "<script>\n";

        //Open Tickets Circle
        const totalOpenTickets = db.checkNewOpenTickets();
        homePageCode += "let openCircle = document.getElementById(\'new-open-tickets\');\n";
        homePageCode += "openCircle.innerHTML += \"" + totalOpenTickets + "\";\n";

        //In Progress Tickets Circle
        const totalIPTickets = db.checkInProgressTickets();
        homePageCode += "let ipCircle = document.getElementById(\'ip-tickets\');\n";
        homePageCode += "ipCircle.innerHTML += \"" + totalIPTickets + "\";\n";

        //History Table
        const historyItems = db.getHistory();
        homePageCode += "let historyList = document.getElementById(\'historyList\');\n";
        if (historyItems.length < 1) {
            homePageCode += "table.innerHTML = \'<h3>No History Items</h3>\';\n";
        }
        homePageCode += "let row;\n";
        for (let i = 0; i < Math.min(7, historyItems.length); i++) {
            homePageCode += "row = historyList.insertRow(" + (i) + ");\n";
            homePageCode += "row.insertCell(0).innerHTML = \"" + sanitize(historyItems[i].date) + "\";\n";
            homePageCode += "row.insertCell(1).innerHTML = \"" + sanitize(historyItems[i].description) + "\";\n";
            homePageCode += "row.insertCell(2).innerHTML = \"" + sanitize(historyItems[i].user) + "\";\n";
        }

        //Main Support Tickets Module
        let dashTickets = db.getOpenTickets();

        homePageCode += "let dashTickList = document.getElementById(\'tickList\');\n";

        homePageCode += "dashTickList.innerHTML = \'\';\n";

        for (let i = 0; i < Math.min(3, dashTickets.length); i++) {
            homePageCode += "dashTickList.innerHTML += \"<p class='main-title'>" + sanitize(dashTickets[i].title) + "</p><p class='description'>" + sanitize(dashTickets[i].description) + "</p><hr />\";\n";
        }


        homePageCode += "</script>\n";
        return homePageCode;
    }
}

/**
 * Replaces single quotes with \' and double quotes with \\", for use in preventing XSS
 * @param text
 * @returns {string|*}
 */
function sanitize(text) {
    if (typeof text == "string") {
        return text.split("'").join("\\'").split("\"").join("\\\"").split("\n").join("\\n").split("\r").join("");
    } else {
        return text;
    }
}

module.exports = handlers; // Allows access to internal functions by NodeJS module.exports