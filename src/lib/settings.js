const fs = require('fs');
const path = require('path');
const settingsPath = path.join(__dirname, '..', '..', 'settings.json');
let settings = {};
if (fs.existsSync(settingsPath)) {
try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (e) { settings = {}; }
}


function saveSettings() {
fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}


module.exports = {
getReportChannelId(guildId) {
return settings[guildId]?.reportChannelId || null;
},
setReportChannelId(guildId, channelId) {
settings[guildId] = settings[guildId] || {};
settings[guildId].reportChannelId = channelId;
saveSettings();
}
};