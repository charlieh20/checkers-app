const path = require('path');
const express = require('express');

const PORT = process.env.PORT || 3001;

const app = express();

const state = { history: [] };

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Handle POST requests to /game
app.post("/game", (req, res) => {
    state = req.body;
});

// Handle GET requests to /game
app.get("/game", (req, res) => {
  res.json(state);
});

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});