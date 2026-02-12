const { ActivityType } = require("discord.js");

/**
 * Presence Manager
 * @param {import('discord.js').Client} client - Your Discord client
 */
function setupPresence(client) {
  if (!client) throw new Error("Client is required for setupPresence.");

  let currentIndex = 0;
  const version = process.env.VERSION || "1.0";

  const statuses = [
    { name: `v${version}`, type: ActivityType.Playing },
    { name: `reports`, type: ActivityType.Watching },
    { name: `I'm open source!`, type: ActivityType.Listening }
  ];

  const updatePresence = () => {
    const current = statuses[currentIndex % statuses.length];
    client.user.setPresence({
      activities: [{ name: current.name, type: current.type }],
      status: "idle",
    });

    currentIndex = (currentIndex + 1) % statuses.length;
  };

  // Immediately set one, then rotate every 15 seconds
  updatePresence();
  setInterval(updatePresence, 15000);
}

module.exports = { setupPresence };