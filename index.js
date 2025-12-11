require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
// 1. IMPORTANTE: Importamos los extractores nuevos
const { DefaultExtractors } = require('@discord-player/extractor');
// --- CÓDIGO PARA MANTENER VIVO EL BOT EN RENDER ---
const express = require('express');
const app = express();

// Creamos una ruta simple que diga "Hola"
app.get('/', (req, res) => {
    res.send('¡El bot está vivo! 🤖');
});

// Le decimos que escuche en el puerto que Render nos asigne (o 3000)
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`🌐 Servidor web listo en el puerto ${port}`);
});
// --------------------------------------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const player = new Player(client);
// --- CHIVATOS DE ERROR (DEBUG) ---
player.events.on('playerError', (queue, error) => {
    console.log(`⚠️ Fallo en el reproductor: ${error.message}`);
});

player.events.on('error', (queue, error) => {
    console.log(`⚠️ Fallo en la cola: ${error.message}`);
});
// --------------------------------
// 2. Función corregida para cargar extractores (Versión Nueva)
async function cargarExtractores() {
    // Antes usábamos loadDefault(), ahora usamos loadMulti()
    await player.extractors.loadMulti(DefaultExtractors);
    console.log('✅ Extractores de audio cargados correctamente');
}

// Llamamos a la función
cargarExtractores();

client.on('ready', () => {
    console.log(`🎵 Bot de música listo como ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith('!')) return;

    // Leemos en qué MODO está configurado este bot (si no hay nada, hace TODO)
    const MODO_ACTUAL = process.env.BOT_MODE || 'TODO';

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const query = args.join(" ");

    // --- BLOQUE DE COMANDOS DE TEXTO (Ping, Hola, Moderación) ---
    // Si el bot está en modo "SOLO MUSICA", ignoramos este bloque
    if (MODO_ACTUAL !== 'MUSICA') {

        if (command === 'ping') {
            return message.reply('¡Pong! 🏓');
        }

        if (command === 'hola') {
            return message.reply('¡Hola! Soy tu bot 24/7.');
        }

        // Aquí irían tus futuros comandos de !borrar, !ban, etc.
    }

    // --- BLOQUE DE COMANDOS DE MÚSICA (Play, Stop, Skip) ---
    // Si el bot está en modo "SOLO TEXTO", ignoramos este bloque
    if (MODO_ACTUAL !== 'TEXTO') {

        if (command === 'play' || command === 'p') {
            const canalVoz = message.member.voice.channel;
            if (!canalVoz) return message.reply('❌ ¡Entra primero al chat de voz!');
            if (!query) return message.reply('❌ Dime qué canción busco.');

            try {
                // Mensaje simple para no spamear
                // message.reply(`🔍 Buscando **${query}**...`); 
                const { track } = await player.play(canalVoz, query, {
                    nodeOptions: { metadata: message, leaveOnEmpty: false, leaveOnEnd: false, leaveOnStop: false }
                });
                return message.channel.send(`🎶 ¡Añadido: **${track.title}**!`);
            } catch (error) {
                return message.reply('❌ Error al poner música (¿Quizás YouTube bloqueó la IP?).');
            }
        }
        // --- COMANDO: SKIP (!skip o !s) ---
        if (command === 'skip' || command === 's') {
            const queue = player.nodes.get(message.guild);
            if (!queue || !queue.isPlaying()) return message.reply('❌ No hay música sonando.');

            queue.node.skip();
            return message.reply('⏩ ¡Siguiente tema!');
        }

        // --- COMANDO: STOP (!stop, !exit o !e) ---
        if (command === 'stop' || command === 'exit' || command === 'e') {
            const queue = player.nodes.get(message.guild);
            if (queue) queue.delete();
            return message.reply('🛑 ¡Desconectando! Nos vemos.');
        }
    }
});

// 3. Tu Token
client.login(process.env.DISCORD_TOKEN);