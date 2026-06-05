const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const express = require('express');

// 1. SETUP RENDER KEEP-ALIVE SERVER
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🔮 Prismbot Welcomer is running 24/7!');
});

app.listen(PORT, () => {
    console.log(`⚓ Render web listener is open on port ${PORT}`);
});

// 2. INITIALIZE DISCORD BOT CLIENT
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// --- DYNAMIC CONFIGURATION MEMORY ---
let WELCOME_CHANNEL_ID = null; 
let LEAVE_CHANNEL_ID = null; 

// 3. BOT READY EVENT
client.once('ready', () => {
    console.log(`🔮 Bot is online as ${client.user.tag} and guarding the gates!`);
});

// 4. MEMBER JOIN EVENT (WELCOME)
client.on('guildMemberAdd', async (member) => {
    if (!WELCOME_CHANNEL_ID) return console.log("❌ Welcome channel has not been set yet.");
    
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return console.log("❌ Welcome channel not found.");

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('✨ Welcome to the Server! ✨')
        .setDescription(`Welcome <@${member.id}> to **${member.guild.name}**!\nWe are thrilled to have you here. 🎉`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields({ name: 'Member Count', value: `You are member #${member.guild.memberCount}!`, inline: true })
        .setTimestamp()
        .setFooter({ text: `ID: ${member.id}` });

    channel.send({ content: `👋 Welcome <@${member.id}>!`, embeds: [welcomeEmbed] });
});

// 5. MEMBER LEAVE EVENT (GOODBYE)
client.on('guildMemberRemove', async (member) => {
    if (!LEAVE_CHANNEL_ID) return console.log("❌ Leave channel has not been set yet.");
    
    const channel = member.guild.channels.cache.get(LEAVE_CHANNEL_ID);
    if (!channel) return console.log("❌ Leave channel not found.");

    const leaveEmbed = new EmbedBuilder()
        .setColor('#ED4245')
        .setTitle('👋 Goodbye!')
        .setDescription(`**${member.user.tag}** has left the server. We'll miss you! 🥺`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .addFields({ name: 'Member Count', value: `We now have ${member.guild.memberCount} members.`, inline: true })
        .setTimestamp();

    channel.send({ embeds: [leaveEmbed] });
});

// 6. ALL WELCOMER COMMANDS HANDLER
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!')) return;

    // Fixed text split regex syntax here:
    const args = message.content.slice(1).trim().split(/\s+/);
    const command = args.shift().toLowerCase();

    // ⚙️ !setwelcome #channel
    if (command === 'setwelcome') {
        if (!message.member.permissions.has('ManageGuild')) return message.reply('❌ Requires "Manage Server" permission.');
        const targetChannel = message.mentions.channels.first();
        if (!targetChannel) return message.reply('❌ Please mention a valid channel! Example: `!setwelcome #welcome-log`');

        WELCOME_CHANNEL_ID = targetChannel.id;
        return message.reply(`✅ **Success!** Welcome messages will now be sent to ${targetChannel}.`);
    }

    // ⚙️ !setleave #channel
    if (command === 'setleave') {
        if (!message.member.permissions.has('ManageGuild')) return message.reply('❌ Requires "Manage Server" permission.');
        const targetChannel = message.mentions.channels.first();
        if (!targetChannel) return message.reply('❌ Please mention a valid channel! Example: `!setleave #leave-log`');

        LEAVE_CHANNEL_ID = targetChannel.id;
        return message.reply(`✅ **Success!** Leave messages will now be sent to ${targetChannel}.`);
    }

    // ℹ️ !welcomehelp
    if (command === 'welcomehelp') {
        const currentWelcome = WELCOME_CHANNEL_ID ? `<#${WELCOME_CHANNEL_ID}>` : '`Not Set ❌`';
        const currentLeave = LEAVE_CHANNEL_ID ? `<#${LEAVE_CHANNEL_ID}>` : '`Not Set ❌`';
        
        const helpEmbed = new EmbedBuilder()
            .setColor('#7289DA')
            .setTitle('🔮 PrismBot Welcomer Command Hub')
            .setDescription(`**Welcome Channel:** ${currentWelcome}\n**Leave Channel:** ${currentLeave}\n\nManage settings with these commands:`)
            .addFields(
                { name: '`!setwelcome #channel`', value: 'Sets the channel for member join logs.' },
                { name: '`!setleave #channel`', value: 'Sets the channel for member leave logs.' },
                { name: '`!welcometest`', value: 'Simulates a join event.' },
                { name: '`!leavetest`', value: 'Simulates a leave event.' },
                { name: '`!stats`', value: 'Shows server total members.' },
                { name: '`!ping`', value: 'Checks the bot latency.' }
            )
            .setFooter({ text: 'PrismBot System Commands' });

        return message.reply({ embeds: [helpEmbed] });
    }

    // 🚀 !welcometest
    if (command === 'welcometest') {
        if (!message.member.permissions.has('ManageGuild')) return message.reply('❌ Requires "Manage Server" permission.');
        if (!WELCOME_CHANNEL_ID) return message.reply('❌ Set a welcome channel first using `!setwelcome #channel`');
        
        message.reply('🔄 Simulating a **Member Join** event...');
        client.emit('guildMemberAdd', message.member);
        return;
    }

    // 🚪 !leavetest
    if (command === 'leavetest') {
        if (!message.member.permissions.has('ManageGuild')) return message.reply('❌ Requires "Manage Server" permission.');
        if (!LEAVE_CHANNEL_ID) return message.reply('❌ Set a leave channel first using `!setleave #channel`');

        message.reply('🔄 Simulating a **Member Leave** event...');
        client.emit('guildMemberRemove', message.member);
        return;
    }

    // 📊 !stats
    if (command === 'stats') {
        return message.reply(`📊 **${message.guild.name} Stats:**\nTotal Members: **${message.guild.memberCount}**`);
    }

    // 🏓 !ping
    if (command === 'ping') {
        return message.reply(`🏓 Pong! Bot latency is **${Date.now() - message.createdTimestamp}ms**.`);
    }
});

client.login(process.env.TOKEN);
            
