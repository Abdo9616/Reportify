const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');


const settingsPath = path.join(__dirname, '../../settings.json');
let settings = {};
if (fs.existsSync(settingsPath)) {
try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8')); } catch (e) { settings = {}; }
}


function saveSettings() {
fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

const allowedReportChannelTypes = new Set([ChannelType.GuildText, ChannelType.GuildAnnouncement]);

function isValidReportChannel(channel) {
return Boolean(channel && channel.isTextBased() && allowedReportChannelTypes.has(channel.type));
}


module.exports = {
data: new SlashCommandBuilder()
.setName('setreportchannel')
.setDescription('Set the channel where message reports will be sent')
.addChannelOption(opt =>
opt
.setName('channel')
.setDescription('Channel for reports (defaults to current channel)')
.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
.setRequired(false)
),


async execute(interaction) {
if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
return interaction.reply({ content: 'You need Administrator permissions to use this command.', flags: 64 });
}


const selectedChannel = interaction.options.getChannel('channel');
const channel = selectedChannel || interaction.channel;
if (!isValidReportChannel(channel)) {
return interaction.reply({ content: 'Please select a valid text or announcement channel.', flags: 64 });
}


settings[interaction.guildId] = settings[interaction.guildId] || {};
settings[interaction.guildId].reportChannelId = channel.id;
saveSettings();


return interaction.reply({ content: `✅ Report channel set to ${channel}.`, flags: 64 });
}
};
