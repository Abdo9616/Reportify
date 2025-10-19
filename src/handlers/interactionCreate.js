const {
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ApplicationCommandType,
} = require('discord.js');
const settings = require('../data/sendreportchannel');

module.exports = async (client, interaction) => {
  try {
    // Handle /setreportchannel command
    if (interaction.isChatInputCommand() && interaction.commandName === 'setreportchannel') {
      if (!interaction.memberPermissions.has('Administrator')) {
        return interaction.reply({ content: '❌ You must be an administrator to use this command.', flags: 64 });
      }

      const channel = interaction.options.getChannel('channel');
      if (!channel || !channel.isTextBased()) {
        return interaction.reply({ content: '❌ Please select a valid text channel.', flags: 64 });
      }

      settings[interaction.guild.id] = { reportChannelId: channel.id };
      require('fs').writeFileSync('./src/data/sendreportchannel.json', JSON.stringify(settings, null, 2));

      return interaction.reply({ content: `✅ Reports will now be sent to ${channel}`, flags: 64 });
    }

    // Handle "Report Message" context menu
    if (interaction.isMessageContextMenuCommand() && interaction.commandName === 'Report Message') {
      const modal = new ModalBuilder()
        .setCustomId(`report_${interaction.targetMessage.id}_${interaction.targetMessage.channelId}`)
        .setTitle('Report Message');

      const reasonInput = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Reason for reporting')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const actionRow = new ActionRowBuilder().addComponents(reasonInput);
      modal.addComponents(actionRow);

      return interaction.showModal(modal);
    }

    // Handle modal submit
    if (interaction.isModalSubmit() && interaction.customId.startsWith('report_')) {
      const [_, messageId, channelId] = interaction.customId.split('_');
      const reason = interaction.fields.getTextInputValue('reason');
      const guild = interaction.guild;
      const reporter = interaction.user;

      const reportChannelId = settings[guild.id]?.reportChannelId;
      if (!reportChannelId) {
        return interaction.reply({ content: 'No report channel set. Ask an admin to run /setreportchannel.', flags: 64 });
      }

      const reportChannel = await guild.channels.fetch(reportChannelId).catch(() => null);
      if (!reportChannel || !reportChannel.isTextBased()) {
        return interaction.reply({ content: 'Report channel is invalid or missing.', flags: 64 });
      }

      let reportedMessage = null;
      try {
        const ch = await guild.channels.fetch(channelId);
        if (ch && ch.isTextBased()) reportedMessage = await ch.messages.fetch(messageId);
      } catch {}

      const embed = new EmbedBuilder()
        .setTitle('📣 New Message Report')
        .addFields(
          { name: 'Reporter', value: `${reporter.tag} (<@${reporter.id}>)`, inline: true },
          { name: 'Reported User', value: reportedMessage ? `${reportedMessage.author.tag} (<@${reportedMessage.author.id}>)` : 'Unknown', inline: true },
          { name: 'Channel', value: `<#${channelId}>`, inline: true },
          { name: 'Reason', value: reason },
        )
        .setTimestamp();

      if (reportedMessage?.content) {
        let content = reportedMessage.content;
        if (content.length > 1024) content = content.slice(0, 1021) + '...';
        embed.addFields({ name: 'Message Content', value: content });
      }

      const link = `https://discord.com/channels/${guild.id}/${channelId}/${messageId}`;
      embed.addFields({ name: 'Message Link', value: link });

      await reportChannel.send({ embeds: [embed] });
      return interaction.reply({ content: '✅ Your report has been sent to the moderators.', flags: 64 });
    }
  } catch (err) {
    console.error('interactionCreate error:', err);
    if (!interaction.replied) {
      interaction.reply({ content: 'An error occurred while processing this interaction.', flags: 64 }).catch(() => {});
    }
  }
};
