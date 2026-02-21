const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');


module.exports = async function handleReportContext(interaction) {
const targetMsg = interaction.targetMessage;
if (targetMsg?.author?.id === interaction.user.id) {
await interaction.reply({ content: 'You cannot report your own message.', flags: 64 });
return;
}

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
