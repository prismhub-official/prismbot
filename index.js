const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const http = require('http');

// 1. SNEAKY DUMMY SERVER FOR RENDER
// Render expects a web port to be open, or it will think the bot crashed.
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('PrismHub Bot Matrix is Active!\n');
}).listen(process.env.PORT || 3000, () => {
    console.log("⚓ Render web listener is open and happy.");
});

// 2. DISCORD BOT CODE
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

const BOT_TOKEN = process.env.TOKEN; // Securely pulled from Render
const WELCOME_CHANNEL_ID = 'YOUR_WELCOME_CHANNEL_ID_HERE'; // 🚨 Replace with your channel ID!

client.once('ready', () => {
    console.log(`🔮 ${client.user.tag} is online and guarding the gates!`);
});

client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#a239ea')
        .setTitle('🔮 NEW MANIFESTATION IN THE HUB')
        .setDescription(`Welcome to the matrix, ${member}! We're thrilled to have you here.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
            { name: '⚡ Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
            { name: '🏆 Nexus Member Count', value: `**#${member.guild.memberCount}**`, inline: true }
        )
        .setFooter({ text: `⚡ Owned by XianCarlLopez` })
        .setTimestamp();

    try {
        await channel.send({ content: `Hey ${member}! Welcome to the server! ✨`, embeds: [welcomeEmbed] });
    } catch (error) {
        console.error("Embed error:", error);
    }
});

client.login(BOT_TOKEN);
