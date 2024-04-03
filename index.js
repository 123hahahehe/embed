const { Client, Intents, MessageEmbed } = require('discord.js');

// Create a new Discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Event listener for when the bot is ready
client.once('ready', () => {
    console.log('Bot is ready!');
});

// Event listener for when a message is sent
client.on('messageCreate', async message => {
    // Check if the message starts with the command prefix and is from a non-bot user
    if (!message.content.startsWith('!') || message.author.bot) return;

    // Parse the command and arguments
    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Handle the log command
    if (command === 'save') {
        // Check if the user has permission to manage messages
        if (!message.member.permissions.has('MANAGE_MESSAGES')) {
            return message.reply('you need admin to use this command');
        }

        // Check if the user specified the number of messages to log
        let numMessages = 30; // Default to 25 messages
        if (args.length > 0) {
            numMessages = parseInt(args[0]);
            if (isNaN(numMessages) || numMessages < 1 || numMessages > 30) {
                return message.reply('specify a number between 1 and 30.');
            }
        }

        // Fetch the last 'numMessages' messages
        const messages = await message.channel.messages.fetch({ limit: numMessages });

        // Filter out bot messages
        const nonBotMessages = messages.filter(msg => !msg.author.bot);

        // Create an embed for the log
        const logEmbed = new MessageEmbed()
            .setTitle(`Last ${numMessages} Messages`)
            .setColor('#0099ff');

        // Add each message as a field in the embed
        nonBotMessages.forEach(msg => {
            logEmbed.addField(
                `**${msg.author.tag}**`, // Bold username
                `**${msg.content}**` // Bold message content
            );
        });

        // Send the log to the user's DM
        try {
            await message.author.send({ embeds: [logEmbed] });
            message.reply(`last ${numMessages} messages saved to your dms.`);
        } catch (error) {
            console.error(`failed to send log to ${message.author.tag}:`, error);
            message.reply('failed to send log to your dms.');
        }
    }
});

// Log in to Discord with your bot token
client.login(process.env.DISCORD_TOKEN);