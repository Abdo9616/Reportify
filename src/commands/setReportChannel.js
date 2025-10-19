const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
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


module.exports = {
data: new SlashCommandBuilder()
.setName('setreportchannel')
.setDescription('Set the channel where message reports will be sent')
.addChannelOption(opt => opt.setName('channel').setDescription('Channel for reports').setRequired(true)),


async execute(interaction) {
if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
return interaction.reply({ content: 'You need Administrator permissions to use this command.', flags: 64 });
}


const channel = interaction.options.getChannel('channel');
if (!channel || !channel.isTextBased()) {
return interaction.reply({ content: 'Please select a text-based channel.', flags: 64 });
}


settings[interaction.guildId] = settings[interaction.guildId] || {};
settings[interaction.guildId].reportChannelId = channel.id;
saveSettings();


return interaction.reply({ content: `✅ Report channel set to ${channel}.`, flags: 64 });
}
};