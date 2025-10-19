const { REST, Routes, ApplicationCommandType, ContextMenuCommandBuilder, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

module.exports = async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(TOKEN);

  const reportContext = new ContextMenuCommandBuilder()
    .setName('Report Message')
    .setType(ApplicationCommandType.Message);

  const setReportChannel = new SlashCommandBuilder()
    .setName('setreportchannel')
    .setDescription('Set the channel where message reports are sent')
    .addChannelOption(opt =>
      opt.setName('channel').setDescription('Channel for reports').setRequired(true)
    );

  const commands = [reportContext.toJSON(), setReportChannel.toJSON()];

  try {
    if (GUILD_ID) {
      console.log(`Registering commands for guild ${GUILD_ID}...`);
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    } else {
      console.log('Registering global commands...');
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    }
    console.log('✅ Commands registered successfully.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
};