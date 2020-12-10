// Dependencies

const express = require("express");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Sets up the Express App

const app = express();
const PORT = 3000;

// Sets up the Express app to handle data parsing
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//path to DB
const dbPath = path.join(__dirname, "./db/db.json");

// Routes

//Sends user to the notes page
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "./public/notes.html"))
);

// Displays all notes as raw JSON
app.get("/api/notes", (req, res) => res.json(injestJSONFile()));

//post new note
// note format is {"title":"Test Title","text":"Test text"}
app.post("/api/notes", function (request, response) {
  console.log(request.body); // your JSON
  appendJSONFile(request.body);
  response.send(request.body); // echo the result back
});

//handles delete requests
app.delete("/api/notes/*", function (request, response) {
  fs.readFile(dbPath, function (err, data) {
    var newJson = [];
    var json = JSON.parse(data);
    json.forEach((note) => {
      if (note.id !== request.params[0]) {
        newJson.push(note);
      }
    });
    fs.writeFile(dbPath, JSON.stringify(newJson), function (err) {
      if (err) throw err;
    });
  });
  response.send(request.body); // echo the result back
});

//handles any request outside of the allowed ones by returning to index
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "./public/index.html"))
);

//reads the file provided
function injestJSONFile() {
  var file = fs.readFileSync(dbPath, "utf-8");
  return JSON.parse(file);
}

//used to append data to the database
function appendJSONFile(request) {
  fs.readFile(dbPath, function (err, data) {
    var json = JSON.parse(data);
    request.id = uuidv4();
    json.push(request);
    fs.writeFile(dbPath, JSON.stringify(json), function (err) {
      if (err) throw err;
    });
  });
}

// Starts the server to begin listening
app.listen(process.env.PORT || 3000, () =>
  console.log(`App listening on PORT ${PORT}`)
);
