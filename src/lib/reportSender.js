const { EmbedBuilder } = require('discord.js');
const settings = require('./settings');

function clampEmbedFieldValue(value, fallback = 'No reason provided.') {
const normalized = String(value ?? '').trim();
if (!normalized) return fallback;
return normalized.length > 1024 ? `${normalized.slice(0, 1021)}...` : normalized;
}


async function sendReport(guild, reporter, reportedMessageInfo) {
const reportChannelId = settings.getReportChannelId(guild.id);
if (!reportChannelId) throw new Error('No report channel set');


const reportChannel = await guild.channels.fetch(reportChannelId).catch(() => null);
if (!reportChannel || !reportChannel.isTextBased()) throw new Error('Invalid report channel');


const embed = new EmbedBuilder()
.setTitle('New Message Report')
.addFields(
{ name: 'Reporter', value: `${reporter.tag} (<@${reporter.id}>)`, inline: true },
{ name: 'Reported User', value: clampEmbedFieldValue(reportedMessageInfo.authorTag, 'Unknown'), inline: true },
{ name: 'Channel', value: `<#${reportedMessageInfo.channelId}>`, inline: true }
)
.addFields({ name: 'Reason', value: clampEmbedFieldValue(reportedMessageInfo.reason) })
.setTimestamp();


if (reportedMessageInfo.content) {
embed.addFields({ name: 'Message Content', value: clampEmbedFieldValue(reportedMessageInfo.content, '[No text content]') });
}


if (reportedMessageInfo.link) embed.addFields({ name: 'Message Link', value: reportedMessageInfo.link });


await reportChannel.send({ embeds: [embed] });
}


module.exports = { sendReport };
