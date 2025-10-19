const { EmbedBuilder } = require('discord.js');
const settings = require('./settings');


async function sendReport(guild, reporter, reportedMessageInfo) {
const reportChannelId = settings.getReportChannelId(guild.id);
if (!reportChannelId) throw new Error('No report channel set');


const reportChannel = await guild.channels.fetch(reportChannelId).catch(() => null);
if (!reportChannel || !reportChannel.isTextBased()) throw new Error('Invalid report channel');


const embed = new EmbedBuilder()
.setTitle('New Message Report')
.addFields(
{ name: 'Reporter', value: `${reporter.tag} (<@${reporter.id}>)`, inline: true },
{ name: 'Reported User', value: reportedMessageInfo.authorTag || 'Unknown', inline: true },
{ name: 'Channel', value: `<#${reportedMessageInfo.channelId}>`, inline: true }
)
.addFields({ name: 'Reason', value: reportedMessageInfo.reason || 'No reason provided.' })
.setTimestamp();


if (reportedMessageInfo.content) {
let content = reportedMessageInfo.content;
if (content.length > 1024) content = content.slice(0, 1021) + '...';
embed.addFields({ name: 'Message Content', value: content });
}


if (reportedMessageInfo.link) embed.addFields({ name: 'Message Link', value: reportedMessageInfo.link });


await reportChannel.send({ embeds: [embed] });
}


module.exports = { sendReport };