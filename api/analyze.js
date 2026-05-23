const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  const resultsPath = path.join(__dirname, '..', 'public', 'results.json');
  const cached = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json(cached);
};
