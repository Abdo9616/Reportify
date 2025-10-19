require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('./src/utils/logger.js')();
const registerCommands = require('./src/commands/registerCommands');
const interactionHandler = require('./src/handlers/interactionCreate');
const initializeHealthServer = require('./src/utils/healthHandler');
const { setupPresence } = require('./src/utils/presenceManager.js'); 


const TOKEN = process.env.TOKEN;
if (!TOKEN) {
console.error('Set TOKEN in .env');
process.exit(1);
}


const client = new Client({
intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});


client.once('clientReady', async () => {
console.log(`Logged in as ${client.user.tag}`);
await registerCommands();
setupPresence(client);
});


client.on('interactionCreate', interactionHandler.bind(null, client));


initializeHealthServer(client);

client.login(TOKEN);