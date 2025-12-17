require('dotenv').config();
const { Client, GatewayIntentBits, ApplicationCommandOptionType, EmbedBuilder, PermissionsBitField, AttachmentBuilder } = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const express = require('express');

// 👇 IMPORTAMOS TUS NUEVOS ESTILOS
const { crearTarjetaBienvenida } = require('./estilosNeko'); 

// --- SERVIDOR WEB ---
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
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers 
    ]
});

const player = new Player(client);

// --- DEBUG PLAYER ---
player.events.on('playerError', (queue, error) => console.log(`⚠️ Fallo en el reproductor: ${error.message}`));
player.events.on('error', (queue, error) => console.log(`⚠️ Fallo en la cola: ${error.message}`));

async function cargarExtractores() {
    await player.extractors.loadMulti(DefaultExtractors);
    console.log('✅ Extractores cargados');
}
cargarExtractores();

// =======================
// Registrar los comandos
// =======================
client.on('ready', async () => {
    console.log(`🎵 Bot de música listo como ${client.user.tag}!`);
    const comandos = [
        { name: 'borrar', description: 'Borra mensajes (Admins)', options: [{ name: 'cantidad', description: 'Nº mensajes', type: ApplicationCommandOptionType.Integer, required: true }] },
        { name: 'avatar', description: 'Ver foto de perfil', options: [{ name: 'usuario', description: 'Usuario', type: ApplicationCommandOptionType.User, required: false }] },
        { name: 'bola8', description: 'Pregunta mágica', options: [{ name: 'pregunta', description: 'Tu duda', type: ApplicationCommandOptionType.String, required: true }] },
        { name: 'ping', description: 'Ver latencia' },
        { name: 'play', description: 'Poner música', options: [{ name: 'cancion', description: 'URL o nombre', type: ApplicationCommandOptionType.String, required: true }] },
        { name: 'skip', description: 'Saltar canción' },
        { name: 'stop', description: 'Desconectar música' }
    ];
    await client.application.commands.set(comandos);
    console.log('💻 Comandos Slash (/) registrados!');
});

// ===========================
// Escuchar Slash Commands (/)
// ===========================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'borrar') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return interaction.reply({ content: '⛔ Sin permisos.', ephemeral: true });
        const cantidad = interaction.options.getInteger('cantidad');
        if (cantidad > 100 || cantidad < 1) return interaction.reply({ content: 'Máximo 100 mensajes.', ephemeral: true });
        try { await interaction.channel.bulkDelete(cantidad); return interaction.reply({ content: `🧹 ${cantidad} mensajes borrados.`, ephemeral: true }); } 
        catch (e) { return interaction.reply({ content: '❌ Error borrando mensajes.', ephemeral: true }); }
    }
    if (commandName === 'avatar') {
        const usuario = interaction.options.getUser('usuario') || interaction.user;
        const embed = new EmbedBuilder().setTitle(`Avatar de ${usuario.username}`).setImage(usuario.displayAvatarURL({ size: 1024, dynamic: true })).setColor('Random');
        return interaction.reply({ embeds: [embed] });
    }
    if (commandName === 'bola8') {
        const preg = interaction.options.getString('pregunta');
        const resps = ["Sí ✅", "No ❌", "Quizás 🕵️", "Imposible 🤡", "Pregunta a un adulto 🙈"];
        const azar = resps[Math.floor(Math.random() * resps.length)];
        const embed = new EmbedBuilder().setTitle('🎱 Bola 8').setColor('Purple').addFields({ name: 'Pregunta', value: preg }, { name: 'Respuesta', value: azar });
        return interaction.reply({ embeds: [embed] });
    }
    if (commandName === 'ping') return interaction.reply('¡Pong! 🏓');
    
    if (commandName === 'play') {
        const canal = interaction.member.voice.channel;
        if (!canal) return interaction.reply({ content: '❌ Entra a voz.', ephemeral: true });
        await interaction.deferReply();
        try {
            const { track } = await player.play(canal, interaction.options.getString('cancion'), { nodeOptions: { metadata: interaction } });
            return interaction.editReply(`🎶 Añadido: **${track.title}**`);
        } catch (e) { return interaction.editReply('❌ No encontrada.'); }
    }
    if (commandName === 'skip') {
        const queue = player.nodes.get(interaction.guild);
        if (queue && queue.isPlaying()) { queue.node.skip(); return interaction.reply('⏩ Saltada.'); }
        return interaction.reply({ content: '❌ Nada sonando.', ephemeral: true });
    }
    if (commandName === 'stop') {
        const queue = player.nodes.get(interaction.guild);
        if (queue) queue.delete();
        return interaction.reply('🛑 Desconectado.');
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
        const canal = message.member.voice.channel;
        if (!canal) return message.reply('❌ Entra a voz.');
        if (!query) return message.reply('❌ Dime qué buscar.');
        try {
            const { track } = await player.play(canal, query, { nodeOptions: { metadata: message } });
            return message.channel.send(`🎶 Añadido: **${track.title}**`);
        } catch (e) { return message.reply('❌ Error.'); }
    }
    if (command === 'stop' || command === 'e') {
        const queue = player.nodes.get(message.guild);
        if (queue) queue.delete();
        message.reply('🛑 Adiós.');
    }
    if (command === 'skip' || command === 's') {
        const queue = player.nodes.get(message.guild);
        if (queue && queue.isPlaying()) { queue.node.skip(); message.reply('⏩ Saltada.'); }
        else message.reply('❌ Nada sonando.');
    }
    if (command === 'bola8') {
        if (!query) return message.reply('🔮 Pregunta algo.');
        const resps = ["Sí", "No", "Quizás", "Pregunta a un adulto 🙈"];
        message.reply(`🎱 **${resps[Math.floor(Math.random() * resps.length)]}**`);
    }
    if (command === 'avatar') {
        const user = message.mentions.users.first() || message.author;
        message.reply(user.displayAvatarURL({ size: 1024, dynamic: true }));
    }
});

// ==========================================
// 4. SISTEMA DE BIENVENIDA Y DESPEDIDA
// ==========================================

const ID_CANAL_BIENVENIDA = '1009204515481854002';
const ID_CANAL_DESPEDIDA = '1009752137363894343'; 

client.on('guildMemberAdd', async (member) => {
    try {
        const channel = await member.guild.channels.fetch(ID_CANAL_BIENVENIDA);
        if (!channel) return;

        await channel.sendTyping();
        
        const tarjetaImagen = await crearTarjetaBienvenida(member); 

        await channel.send({ 
            content: `Bienvenido <@${member.id}>! Suerte con salir cuerdo de aquí. 😺`, 
            files: [tarjetaImagen] 
        });

    } catch (e) {
        console.error('❌ Error bienvenida:', e);
    }
});

client.on('guildMemberRemove', async (member) => {
    try {
        const channel = await member.guild.channels.fetch(ID_CANAL_DESPEDIDA);
        if (channel) channel.send(`**${member.user.username}** no pudo aguantar más. 🐱`);
    } catch (e) { console.error('❌ Error despedida.'); }
});

client.login(process.env.DISCORD_TOKEN);