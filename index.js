
const { 
    Client, 
    GatewayIntentBits, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelType, 
    PermissionFlagsBits 
} = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

// التوكن الخاص بك تم وضعه هنا
const TOKEN = 'MTU1ODUzMjc1ODc5MDIwOTY0OQ.G6sTPs.ZzW9L4rCcsIp2y4mzd-Rm3TAn4on3S8g8AswHo'; 

client.once('ready', () => {
    console.log(`تم التشغيل بنجاح باسم: ${client.user.tag}`);
});

// أمر إنشاء تذكرة جديدة
client.on('messageCreate', async (message) => {
    if (message.content === '!setup-ticket') {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('فتح تذكرة 📩')
                    .setStyle(ButtonStyle.Primary)
            );

        await message.channel.send({
            content: 'إضغط على الزر أدناه لفتح تذكرة جديدة للدعم الفني:',
            components: [row]
        });
    }
});

// التعامل مع الضغط على الأزرار
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    // زر فتح التذكرة
    if (interaction.customId === 'create_ticket') {
        const guild = interaction.guild;
        const user = interaction.user;

        // إنشاء روم خاص للتذكرة
        const channel = await guild.channels.create({
            name: `ticket-${user.username}`,
            type: ChannelType.GuildText,
            permissionOverwrites: [
                {
                    id: guild.id,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: user.id,
                    allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                },
            ],
        });

        const closeRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('close_ticket')
                    .setLabel('إغلاق التذكرة 🔒')
                    .setStyle(ButtonStyle.Danger)
            );

        await channel.send({
            content: `مرحباً بك ${user}! سيقوم فريق الدعم بالرد عليك قريباً.`,
            components: [closeRow]
        });

        await interaction.reply({ content: `تم إنشاء تذكرتك بنجاح: ${channel}`, ephemeral: true });
    }

    // زر إغلاق التذكرة وإرسال إشعار للخاص
    if (interaction.customId === 'close_ticket') {
        const channel = interaction.channel;
        const user = interaction.user;

        await interaction.reply({ content: 'سيتم إغلاق التذكرة خلال 5 ثوانٍ...' });

        try {
            await user.send(`تم إغلاق تذكرتك في سيرفر **${interaction.guild.name}**. شكراً لتواصلك معنا!`);
        } catch (err) {
            console.log('تعذر إرسال رسالة في الخاص للمستخدم.');
        }

        setTimeout(() => {
            channel.delete().catch(console.error);
        }, 5000);
    }
});

client.login(TOKEN);

