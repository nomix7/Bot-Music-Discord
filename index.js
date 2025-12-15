require('dotenv').config();
const { Client, GatewayIntentBits, ApplicationCommandOptionType } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const express = require('express');

// --- SERVIDOR WEB (KEEP ALIVE) ---
const app = express();
app.get('/', (req, res) => res.send('¡El bot está vivo! 🤖'));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`🌐 Servidor web listo en el puerto ${port}`));

// --- CLIENTE DISCORD ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const player = new Player(client);

// --- DEBUG ---
player.events.on('playerError', (queue, error) => console.log(`⚠️ Fallo en el reproductor: ${error.message}`));
player.events.on('error', (queue, error) => console.log(`⚠️ Fallo en la cola: ${error.message}`));

async function cargarExtractores() {
    await player.extractors.loadMulti(DefaultExtractors);
    console.log('✅ Extractores de audio cargados correctamente');
}
cargarExtractores();

// =======================
// Registrar los comandos
// =======================
client.on('ready', async () => {
    console.log(`🎵 Bot de música listo como ${client.user.tag}!`);

    // Definimos la lista de comandos Slash
    const comandos = [
        {
            name: 'ping',
            description: 'Comprueba la latencia del bot'
        },
        {
            name: 'play',
            description: 'Reproduce una canción',
            options: [
                {
                    name: 'cancion',
                    description: 'URL o nombre de la canción',
                    type: ApplicationCommandOptionType.String, // Esto pide texto
                    required: true
                }
            ]
        },
        {
            name: 'skip',
            description: 'Salta la canción actual'
        },
        {
            name: 'stop',
            description: 'Detiene la música y desconecta al bot'
        }
    ];
    await client.application.commands.set(comandos);
    console.log('💻 Comandos Slash (/) registrados!');
});

// ===========================
// Escuchar Slash Commands (/)
// ===========================
client.on('interactionCreate', async (interaction) => {
    // Si no es un comando de chat, ignoramos
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    // --- COMANDO /PING ---
    if (commandName === 'ping') {
        return interaction.reply('¡Pong! 🏓');
    }

    // --- COMANDO /PLAY ---
    if (commandName === 'play') {
        const canalVoz = interaction.member.voice.channel;
        if (!canalVoz) return interaction.reply({ content: '❌ ¡Entra primero a un canal de voz!', ephemeral: true });

        // Como buscar música tarda un poco, usamos "deferReply" para que el bot diga "Pensando..."
        await interaction.deferReply();

        const query = interaction.options.getString('cancion');

        try {
            const { track } = await player.play(canalVoz, query, {
                nodeOptions: { metadata: interaction, leaveOnEmpty: false, leaveOnEnd: false, leaveOnStop: false }
            });
            
            // Usamos editReply porque ya usamos deferReply antes
            return interaction.editReply(`🎶 ¡Añadido a la cola: **${track.title}**!`);
        } catch (error) {
            console.error(error);
            return interaction.editReply('❌ No pude encontrar o reproducir esa canción.');
        }
    }

    // --- COMANDO /SKIP ---
    if (commandName === 'skip') {
        const queue = player.nodes.get(interaction.guild);
        if (!queue || !queue.isPlaying()) return interaction.reply({ content: '❌ No hay música sonando.', ephemeral: true });

        queue.node.skip();
        return interaction.reply('⏩ ¡Canción saltada!');
    }

    // --- COMANDO /STOP ---
    if (commandName === 'stop') {
        const queue = player.nodes.get(interaction.guild);
        if (queue) queue.delete();
        return interaction.reply('🛑 ¡Música detenida y desconectado!');
    }
});

// ================
// Comandos con "!"
// ================
client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const query = args.join(" ");

    if (command === 'play' || command === 'p') {
        const canalVoz = message.member.voice.channel;
        if (!canalVoz) return message.reply('❌ ¡Entra primero al chat de voz!');
        if (!query) return message.reply('❌ Dime qué canción busco.');
        try {
            const { track } = await player.play(canalVoz, query, {
                nodeOptions: { metadata: message, leaveOnEmpty: false, leaveOnEnd: false, leaveOnStop: false }
            });
            return message.channel.send(`🎶 ¡Añadido: **${track.title}**!`);
        } catch (e) { return message.reply('❌ Error.'); }
    }
    
    if (command === 'stop') {
         const queue = player.nodes.get(message.guild);
         if (queue) queue.delete();
         message.reply('🛑 Adiós.');
    }
});

client.login(process.env.DISCORD_TOKEN);