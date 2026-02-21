const {
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ChannelType,
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const settings = require('../data/sendreportchannel');

const settingsPath = path.resolve(__dirname, '..', 'data', 'sendreportchannel.json');
const allowedReportChannelTypes = new Set([ChannelType.GuildText, ChannelType.GuildAnnouncement]);

function isValidReportChannel(channel) {
  return Boolean(channel && channel.isTextBased() && allowedReportChannelTypes.has(channel.type));
}

function clampEmbedFieldValue(value, fallback = 'No reason provided.') {
  const normalized = String(value ?? '').trim();
  if (!normalized) return fallback;
  return normalized.length > 1024 ? `${normalized.slice(0, 1021)}...` : normalized;
}

module.exports = async (client, interaction) => {
  try {
    // Handle /setreportchannel command
    if (interaction.isChatInputCommand() && interaction.commandName === 'setreportchannel') {
      if (!interaction.inGuild()) {
        return interaction.reply({ content: '❌ This command can only be used in a server.', flags: 64 });
      }

      if (!interaction.memberPermissions.has('Administrator')) {
        return interaction.reply({ content: '❌ You must be an administrator to use this command.', flags: 64 });
      }

      const selectedChannel = interaction.options.getChannel('channel');
      const targetChannel = selectedChannel ?? interaction.channel;
      if (!isValidReportChannel(targetChannel)) {
        return interaction.reply({ content: '❌ Please select a valid text or announcement channel.', flags: 64 });
      }

      settings[interaction.guild.id] = settings[interaction.guild.id] || {};
      settings[interaction.guild.id].reportChannelId = targetChannel.id;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

      return interaction.reply({ content: `✅ Reports will now be sent to ${targetChannel}`, flags: 64 });
    }

    // Handle "Report Message" context menu
    if (interaction.isMessageContextMenuCommand() && interaction.commandName === 'Report Message') {
      if (!interaction.inGuild()) {
        return interaction.reply({ content: '❌ Reporting is only available in servers.', flags: 64 });
      }

      if (interaction.targetMessage?.author?.id === interaction.user.id) {
        return interaction.reply({ content: '❌ You cannot report your own message.', flags: 64 });
      }

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
      if (!interaction.inGuild()) {
        return interaction.reply({ content: '❌ Reporting is only available in servers.', flags: 64 });
      }

      await interaction.deferReply({ flags: 64 });

      const [_, messageId, channelId] = interaction.customId.split('_');
      if (!messageId || !channelId) {
        return interaction.editReply({ content: 'Invalid report payload. Please try again.' });
      }

      const reason = clampEmbedFieldValue(interaction.fields.getTextInputValue('reason'));
      const guild = interaction.guild;
      const reporter = interaction.user;

      const reportChannelId = settings[guild.id]?.reportChannelId;
      if (!reportChannelId) {
        return interaction.editReply({ content: 'No report channel set. Ask an admin to run /setreportchannel.' });
      }

      const reportChannel = await guild.channels.fetch(reportChannelId).catch(() => null);
      if (!isValidReportChannel(reportChannel)) {
        return interaction.editReply({ content: 'Report channel is invalid or missing.' });
      }

      let reportedMessage = null;
      try {
        const ch = await guild.channels.fetch(channelId);
        if (ch && ch.isTextBased()) reportedMessage = await ch.messages.fetch(messageId);
      } catch {}

      if (reportedMessage?.author?.id === reporter.id) {
        return interaction.editReply({ content: '❌ You cannot report your own message.' });
      }

      const reportedAuthor = reportedMessage?.author;
      const reportedUserText = reportedAuthor ? `${reportedAuthor.tag} (<@${reportedAuthor.id}>)` : 'Unknown';

      const embed = new EmbedBuilder()
        .setTitle('📣 New Message Report')
        .addFields(
          { name: 'Reporter', value: `${reporter.tag} (<@${reporter.id}>)`, inline: true },
          { name: 'Reported User', value: reportedUserText, inline: true },
          { name: 'Channel', value: `<#${channelId}>`, inline: true },
          { name: 'Reason', value: reason },
        )
        .setTimestamp();

      if (reportedMessage?.content) {
        embed.addFields({ name: 'Message Content', value: clampEmbedFieldValue(reportedMessage.content, '[No text content]') });
      }

      const link = `https://discord.com/channels/${guild.id}/${channelId}/${messageId}`;
      embed.addFields({ name: 'Message Link', value: link });

      await reportChannel.send({ embeds: [embed] });
      return interaction.editReply({ content: '✅ Your report has been sent to the moderators.' });
    }
  } catch (err) {
    console.error('interactionCreate error:', err);
    if (interaction.deferred && !interaction.replied) {
      interaction.editReply({ content: 'An error occurred while processing this interaction.' }).catch(() => {});
      return;
    }

    if (!interaction.replied) {
      interaction.reply({ content: 'An error occurred while processing this interaction.', flags: 64 }).catch(() => {});
    }
  }
};
