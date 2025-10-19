const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, 'sendreportchannel.json');

// Load existing data or create empty file
if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}');

module.exports = JSON.parse(fs.readFileSync(filePath, 'utf8'));
