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
    
    // 1. SI NO EMPIEZA POR "!", LO IGNORAMOS (Así ahorramos recursos)
    if (!message.content.startsWith('!')) return;

    // 2. PARSEADO (TROCEADO) INTELIGENTE
    // Quitamos el "!" del principio y separamos por espacios
    const args = message.content.slice(1).trim().split(/ +/);
    // Sacamos la primera palabra y la pasamos a minúsculas (el comando)
    const command = args.shift().toLowerCase();
    // Volvemos a juntar el resto para tener el nombre de la canción
    const query = args.join(" ");

    // --- COMANDO: PLAY (!play o !p) ---
    if (command === 'play' || command === 'p') {
        const canalVoz = message.member.voice.channel;
        if (!canalVoz) return message.reply('❌ ¡Entra primero al chat de voz!');

        if (!query) return message.reply('❌ Dime qué canción busco (ej: !p bad bunny)');

        try {
            message.reply(`🔍 Buscando **${query}**...`);
            const { track } = await player.play(canalVoz, query, {
                nodeOptions: {
                    metadata: message,
                    leaveOnEmpty: false, // <--- No te vayas si la cola se vacía
                    leaveOnEnd: false,   // <--- No te vayas cuando acabe la canción
                    leaveOnStop: false   // <--- No te vayas si te doy stop (solo borra la cola)
                }
            });
            return message.channel.send(`🎶 ¡Añadido: **${track.title}**!`);
        } catch (error) {
            return message.reply('❌ No encontré esa canción.');
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
});

// 3. Tu Token
client.login(process.env.DISCORD_TOKEN);