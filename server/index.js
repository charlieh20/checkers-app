const path = require('path');
const express = require('express');
const bodyParser = require("body-parser");
const app = express();

const PORT = process.env.PORT || 3001;

let data = {"squares":[null,null,null,null,null,null,null,null,null], "stepNumber":0};

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(bodyParser.json());

// Handle POST requests to /game
app.post("/game", (req, res) => {
    data = req.body;
    res.end;
});

// Handle GET requests to /game
app.get("/game", (req, res) => {
    res.json(data);
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});