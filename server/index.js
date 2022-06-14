const path = require('path');
const express = require('express');
const bodyParser = require("body-parser");
const app = express();

const PORT = process.env.PORT || 3001;

//let data = {"squares":[null,null,null,null,null,null,null,null,null], "step":0};

const defaultData = {
  squares: [null, 'O', null, 'O', null, 'O', null, 'O',
    'O', null, 'O', null, 'O', null, 'O', null,
    null, 'O', null, 'O', null, 'O', null, 'O',
    null, null, null, null, null, null, null, null,
    null, null, null, null, null, null, null, null,
    'X', null, 'X', null, 'X', null, 'X', null,
    null, 'X', null, 'X', null, 'X', null, 'X',
    'X', null, 'X', null, 'X', null, 'X', null],
  step: 0
};

let activePlayers = 0;
let data = null;

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(bodyParser.json());

// Handle join requests
app.post("/join", (req, res) => {
  if (activePlayers == 1) {
    activePlayers = 2;
    res.json({id: 1});
  }
  else if (activePlayers == 0) {
    activePlayers = 1;
    res.json({id: 0});
    data = defaultData;
  }
  else {
   res.json({id: -1}); 
  }
});

// Handle join monitoring
app.get("/join", (req, res) => {
  res.json({players: activePlayers});
});

// Handle POST requests to /game
app.post("/game", (req, res) => {
  newData = req.body;
  if (newData.id == -1) {
    activePlayers = 0;
    data = defaultData;
  } else {
    data.squares = newData.squares;
    data.step = newData.step;
    res.end();
  }
});

// Handle GET requests to /game
app.get("/game", (req, res) => {
  if (activePlayers == 2) {
    res.json(data);
  } else {
    res.json({step: -1});
  }
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});