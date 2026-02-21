const settings = require('../lib/settings');
const { sendReport } = require('../lib/reportSender');


module.exports = async function handleReportSlash(interaction) {
await interaction.deferReply({ flags: 64 });
const msgLink = interaction.options.getString('message_link', true);
const reason = interaction.options.getString('reason') || 'No reason provided.';


const m = msgLink.match(/https?:\/\/discord(?:app)?\.com\/channels\/(\d+)\/(\d+)\/(\d+)/);
if (!m) {
await interaction.editReply({ content: 'Invalid message link format.' });
return;
}


const [_, linkGuildId, linkChannelId, linkMessageId] = m;
if (linkGuildId !== interaction.guildId) {
await interaction.editReply({ content: 'Message link must be from this server.' });
return;
}


let reportedMessage = null;
try {
const ch = await interaction.guild.channels.fetch(linkChannelId);
if (ch && ch.isTextBased()) reportedMessage = await ch.messages.fetch(linkMessageId);
} catch (e) {
// ignore
}


const info = {
channelId: linkChannelId,
messageId: linkMessageId,
authorId: reportedMessage?.author?.id || null,
authorTag: reportedMessage?.author ? `${reportedMessage.author.tag} (<@${reportedMessage.author.id}>)` : 'Unknown',
content: reportedMessage ? reportedMessage.content : null,
reason,
link: `https://discord.com/channels/${linkGuildId}/${linkChannelId}/${linkMessageId}`
};

if (info.authorId && info.authorId === interaction.user.id) {
await interaction.editReply({ content: 'You cannot report your own message.' });
return;
}


try {
await sendReport(interaction.guild, interaction.user, info);
await interaction.editReply({ content: 'Your report has been submitted to the moderators.' });
} catch (e) {
await interaction.editReply({ content: 'Failed to submit report: ' + e.message });
}
};
