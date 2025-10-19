const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');


module.exports = async function handleReportContext(interaction) {
const targetMsg = interaction.targetMessage;
const modal = new ModalBuilder()
.setCustomId(`report_${targetMsg.id}_${targetMsg.channelId}`)
.setTitle('Report Message');


const reasonInput = new TextInputBuilder()
.setCustomId('reason')
.setLabel('Reason for reporting (required)')
.setStyle(TextInputStyle.Paragraph)
.setPlaceholder('Explain why you are reporting this message')
.setRequired(true);


const row = new ActionRowBuilder().addComponents(reasonInput);
modal.addComponents(row);


await interaction.showModal(modal);
};