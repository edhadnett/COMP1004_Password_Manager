// server.js
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const dataFile = './data/users.json';

// Load user data
app.get('/users', (req, res) => {
  if (fs.existsSync(dataFile)) {
    const data = fs.readFileSync(dataFile);
    res.json(JSON.parse(data));
  } else {
    res.json([]);
  }
});

// Save new user data
app.post('/users', (req, res) => {
  const newUser = req.body;
  let users = [];

  if (fs.existsSync(dataFile)) {
    users = JSON.parse(fs.readFileSync(dataFile));
  }

  users.push(newUser);
  fs.writeFileSync(dataFile, JSON.stringify(users, null, 2));
  res.json({ message: 'User saved' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
