require('dotenv').config();
const { 
    Client, 
    GatewayIntentBits, 
    ApplicationCommandOptionType, 
    EmbedBuilder, 
    PermissionsBitField, 
    AttachmentBuilder,
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle 
} = require('discord.js');
const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const express = require('express');
const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { crearTarjetaBienvenida } = require('./estilosNeko'); 

// --- SERVIDOR WEB ---
const app = express();
app.get('/', (req, res) => res.send('El bot está funcionando🤖'));
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
    console.log(`🎵 Bot listo como ${client.user.tag}!`);
    
    const comandos = [
        // ... TUS COMANDOS DE SIEMPRE ...
        { name: 'borrar', description: 'Borra mensajes', options: [{ name: 'cantidad', description: 'Nº mensajes', type: ApplicationCommandOptionType.Integer, required: true }] },
        { name: 'avatar', description: 'Ver avatar', options: [{ name: 'usuario', description: 'Usuario', type: ApplicationCommandOptionType.User, required: false }] },
        { name: 'bola8', description: 'Pregunta mágica', options: [{ name: 'pregunta', description: 'Duda', type: ApplicationCommandOptionType.String, required: true }] },
        { name: 'ping', description: 'Ver latencia' },
        { name: 'play', description: 'Poner música', options: [{ name: 'cancion', description: 'URL o nombre', type: ApplicationCommandOptionType.String, required: true }] },
        { name: 'skip', description: 'Saltar canción' },
        { name: 'stop', description: 'Desconectar música' },
        { name: 'help', description: 'Ver ayuda' },
        { 
            name: 'setbienvenida', 
            description: 'Configura dónde dar las bienvenidas', 
            options: [{ name: 'canal', description: 'Canal para bienvenidas', type: ApplicationCommandOptionType.Channel, required: true }] 
        },
        { 
            name: 'setdespedida', 
            description: 'Configura dónde dar las despedidas', 
            options: [{ name: 'canal', description: 'Canal para despedidas', type: ApplicationCommandOptionType.Channel, required: true }] 
        }
    ];

    await client.application.commands.set(comandos);
    console.log('💻 Comandos registrados!');
});

// ===========================
// Escuchar Slash Commands (/)
// ===========================
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const { commandName } = interaction;

    if (commandName === 'help') {
        const embed = new EmbedBuilder()
            .setTitle('🐱 Ayuda de NekoBot')
            .setDescription('Aquí tienes la lista de comandos disponibles:')
            .setColor('#7289da')
            .addFields(
                { name: '🎵 Música', value: '`/play`, `/stop`, `/skip`', inline: true },
                { name: '🎲 Diversión', value: '`/bola8`, `/avatar`', inline: true },
                { name: '⚙️ Utilidad', value: '`/ping`, `/borrar`', inline: true }
            )
            .setFooter({ text: 'También funcionan con ! (ej: !play)' });
            
        return interaction.reply({ embeds: [embed] });
    }

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
        const embed = new EmbedBuilder().setTitle('🎱 Bola 8').setColor('#7289da').addFields({ name: 'Pregunta', value: preg }, { name: 'Respuesta', value: azar });
        return interaction.reply({ embeds: [embed] });
    }
    if (commandName === 'ping') return interaction.reply('¡Pong! 🏓');
    
    if (commandName === 'play') {
        const canal = interaction.member.voice.channel;
        if (!canal) return interaction.reply({ content: '❌ Entra a voz.', ephemeral: true });
        await interaction.deferReply();
        try {
            // Reproducimos la canción
            const { track } = await player.play(canal, interaction.options.getString('cancion'), { 
                nodeOptions: { metadata: interaction } 
            });

            // --- CREACIÓN DE BOTONES ---
            const row1 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('prev').setEmoji('⏮️').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('pause').setEmoji('⏯️').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('stop').setEmoji('⏹️').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('skip').setEmoji('⏭️').setStyle(ButtonStyle.Secondary)
            );

            const row2 = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('voldown').setEmoji('🔉').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('volup').setEmoji('🔊').setStyle(ButtonStyle.Secondary)
            );

            // --- CREACIÓN DEL EMBED (DISEÑO BONITO) ---
            const embed = new EmbedBuilder()
                .setTitle(`🎶 Reproduciendo ahora`)
                .setDescription(`**[${track.title}](${track.url})**\n\n👤 **Autor:** ${track.author}\n⏳ **Duración:** ${track.duration}`)
                .setThumbnail(track.thumbnail)
                .setColor('#7289da')
                .setFooter({ text: `Pedido por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            // Enviamos el mensaje con el embed y los botones
            return interaction.editReply({ embeds: [embed], components: [row1, row2] });

        } catch (e) { 
            console.error(e);
            return interaction.editReply('❌ No encontré la canción o hubo un error.'); 
        }
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

    // GUARDAR CANAL DE BIENVENIDA
    if (commandName === 'setbienvenida') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) 
            return interaction.reply({ content: '⛔ Solo administradores.', ephemeral: true });

        const canal = interaction.options.getChannel('canal');
        // Guardamos en la base de datos: "en el servidor X, el canal de bienvenida es Y"
        await db.set(`wel_${interaction.guild.id}`, canal.id);
        
        return interaction.reply(`✅ Canal de bienvenidas establecido en ${canal}`);
    }

    // GUARDAR CANAL DE DESPEDIDA
    if (commandName === 'setdespedida') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) 
            return interaction.reply({ content: '⛔ Solo administradores.', ephemeral: true });

        const canal = interaction.options.getChannel('canal');
        // Guardamos en la base de datos
        await db.set(`bye_${interaction.guild.id}`, canal.id);
        
        return interaction.reply(`👋 Canal de despedidas establecido en ${canal}`);
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

    if (command === 'help' || command === 'ayuda') {
        const embed = new EmbedBuilder()
            .setTitle('🐱 Ayuda de NekoBot')
            .setDescription('Aquí tienes la lista de comandos disponibles:')
            .setColor('#7289da')
            .addFields(
                { name: '🎵 Música', value: '`!play`, `!stop`, `!skip`', inline: true },
                { name: '🎲 Diversión', value: '`!bola8`, `!avatar`', inline: true },
                { name: '⚙️ Utilidad', value: '`!ping`', inline: true }
            )
            .setFooter({ text: 'También funcionan con / (ej: /play)' });

        return message.reply({ embeds: [embed] });
    }

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
// 4. SISTEMA DE BIENVENIDA Y DESPEDIDA (DINÁMICO)
// ==========================================

client.on('guildMemberAdd', async (member) => {
    try {
        // 1. Preguntamos a la base de datos: "¿Hay canal configurado para ESTE servidor?"
        const canalId = await db.get(`wel_${member.guild.id}`);
        
        // Si no hay canal configurado, no hacemos nada (y no damos error)
        if (!canalId) return;

        const channel = await member.guild.channels.fetch(canalId);
        if (!channel) return;

        await channel.sendTyping();
        
        // Creamos la imagen
        const tarjetaImagen = await crearTarjetaBienvenida(member); 

        await channel.send({ 
            content: `Bienvenido <@${member.id}>! Suerte con salir cuerdo de aquí. 😺`, 
            files: [tarjetaImagen] 
        });

    } catch (e) {
        console.error('❌ Error enviando bienvenida:', e);
    }
});

client.on('guildMemberRemove', async (member) => {
    try {
        // 1. Preguntamos a la base de datos por el canal de despedida
        const canalId = await db.get(`bye_${member.guild.id}`);

        if (!canalId) return; // Si no hay configuración, adiós

        const channel = await member.guild.channels.fetch(canalId);
        if (channel) channel.send(`**${member.user.username}** no pudo aguantar más. 🐱`);

    } catch (e) { 
        console.error('❌ Error enviando despedida.'); 
    }
});
// ==========================================
// 5. MANEJADOR DE BOTONES DE MÚSICA
// ==========================================
client.on('interactionCreate', async (interaction) => {
    // Si no es un botón, ignoramos
    if (!interaction.isButton()) return;

    // Obtenemos la cola de música del servidor
    const queue = player.nodes.get(interaction.guild);
    if (!queue || !queue.isPlaying()) {
        return interaction.reply({ content: '❌ No hay música sonando ahora mismo.', ephemeral: true });
    }

    // Identificamos qué botón se pulsó
    const action = interaction.customId;

    try {
        await interaction.deferUpdate(); // Evita que el botón diga "Error de interacción"

        switch (action) {
            case 'pause':
                // Alternar pausa/reproducir
                queue.node.setPaused(!queue.node.isPaused());
                break;
            
            case 'stop':
                queue.delete();
                break;

            case 'skip':
                queue.node.skip();
                break;

            case 'prev':
                // Nota: Solo funciona si el historial está habilitado y hay canciones antes
                if (queue.history.previousTrack) {
                    await queue.history.previous();
                } else {
                    interaction.followUp({ content: '❌ No hay canción anterior.', ephemeral: true });
                }
                break;

            case 'volup':
                // Subir volumen 10% (max 100)
                let volUp = queue.node.volume + 10;
                if (volUp > 100) volUp = 100;
                queue.node.setVolume(volUp);
                break;

            case 'voldown':
                // Bajar volumen 10% (min 0)
                let volDown = queue.node.volume - 10;
                if (volDown < 0) volDown = 0;
                queue.node.setVolume(volDown);
                break;
        }
    } catch (e) {
        console.error("Error en botones:", e);
    }
});

client.login(process.env.DISCORD_TOKEN);