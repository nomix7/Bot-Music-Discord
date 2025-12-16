require('dotenv').config();
// 1. AÑADIDO: Importamos 'GatewayIntentBits.GuildMembers' en la lista de intents
const { Client, GatewayIntentBits, ApplicationCommandOptionType, EmbedBuilder, PermissionsBitField } = require('discord.js');
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
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers // <--- ¡NUEVO! Necesario para ver quién entra/sale
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
            name: 'borrar',
            description: 'Borra una cantidad de mensajes (Admins)',
            options: [
                {
                    name: 'cantidad',
                    description: 'Número de mensajes a borrar (max 100)',
                    type: ApplicationCommandOptionType.Integer, // Tipo Número entero
                    required: true
                }
            ]
        },
        {
            name: 'avatar',
            description: 'Muestra la foto de perfil de un usuario',
            options: [
                {
                    name: 'usuario',
                    description: 'De quién quieres ver la foto',
                    type: ApplicationCommandOptionType.User, // Tipo Usuario
                    required: false // Si no pone nada, muestra la suya
                }
            ]
        },
        {
            name: 'bola8',
            description: 'Responde a tus preguntas existenciales',
            options: [
                {
                    name: 'pregunta',
                    description: '¿Qué quieres saber?',
                    type: ApplicationCommandOptionType.String,
                    required: true
                }
            ]
        },
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

    // --- COMANDO /BORRAR ---
    if (commandName === 'borrar') {
    // 1. SEGURIDAD: Comprobamos si el usuario tiene permisos para manejar mensajes
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return interaction.reply({ content: '⛔ ¡No tienes permisos para hacer esto!', ephemeral: true });
    }

    const cantidad = interaction.options.getInteger('cantidad');

    // Discord no deja borrar más de 100 de golpe ni mensajes de hace más de 14 días
    if (cantidad > 100 || cantidad < 1) {
        return interaction.reply({ content: 'Solo puedo borrar entre 1 y 100 mensajes.', ephemeral: true });
    }

    // Borramos
    try {
        await interaction.channel.bulkDelete(cantidad);
        return interaction.reply({ content: `**${cantidad}** mensajes eliminados.`, ephemeral: true });
    } catch (error) {
        return interaction.reply({ content: '❌ No puedo borrar mensajes antiguos (más de 14 días) o no tengo permisos.', ephemeral: true });
    }
}
    // --- COMANDO /AVATAR ---
    if (commandName === 'avatar') {
        // Si ha mencionado a alguien, usamos ese. Si no, usamos al que escribió el comando.
        const usuario = interaction.options.getUser('usuario') || interaction.user;

        const embed = new EmbedBuilder()
            .setTitle(`Avatar de ${usuario.username}`)
            .setImage(usuario.displayAvatarURL({ size: 1024, dynamic: true })) // dynamic: true permite gifs
            .setColor('Random')
            .setFooter({ text: 'Solicitado por ' + interaction.user.username });

        return interaction.reply({ embeds: [embed] });
    }
    // --- COMANDO /BOLA8 ---
    if (commandName === 'bola8') {
        const pregunta = interaction.options.getString('pregunta');

        // Array de respuestas posibles
        const respuestas = [
            "Sí, definitivamente. ✅",
            "No lo creo. ❌",
            "Es muy probable. 🌟",
            "Ni en tus sueños. 🤡",
            "Pregunta mañana. 😴",
            "Preguntale a un adulto responsable. 🙈"
        ];

        // Magia matemática para elegir una al azar
        const respuestaRandom = respuestas[Math.floor(Math.random() * respuestas.length)];

        // Creamos un Embed (tarjeta bonita)
        const embed = new EmbedBuilder()
            .setTitle('🎱 La Bola Mágica dice...')
            .setColor('Purple') // Puedes poner 'Red', 'Blue', etc.
            .addFields(
                { name: 'Tu pregunta', value: pregunta },
                { name: 'Mi respuesta', value: respuestaRandom }
            );

        return interaction.reply({ embeds: [embed] });
    }
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
    // Ignorar bots y mensajes que no empiecen por "!"
    if (message.author.bot || !message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const query = args.join(" ");

    // --- COMANDO: !PLAY ---
    if (command === 'play' || command === 'p') {
        const canalVoz = message.member.voice.channel;
        if (!canalVoz) return message.reply('❌ ¡Entra primero al chat de voz!');
        if (!query) return message.reply('❌ Dime qué canción busco.');
        try {
            const { track } = await player.play(canalVoz, query, {
                nodeOptions: { metadata: message, leaveOnEmpty: false, leaveOnEnd: false, leaveOnStop: false }
            });
            return message.channel.send(`🎶 ¡Añadido: **${track.title}**!`);
        } catch (e) { return message.reply('❌ Error buscando la canción.'); }
    }
    
    // --- COMANDO: !STOP ---
    if (command === 'stop' || command === 'e') {
         const queue = player.nodes.get(message.guild);
         if (queue) queue.delete();
         message.reply('🛑 Adiós.');
    }

    // --- COMANDO: !SKIP ---
    if (command === 'skip' || command === 's') {
        const queue = player.nodes.get(message.guild);
        if (!queue || !queue.isPlaying()) return message.reply('❌ No hay música sonando.');
        
        queue.node.skip();
        return message.reply('⏩ ¡Siguiente canción!');
    }

    // --- COMANDO: !BOLA8 ---
    if (command === 'bola8') {
        if (!query) return message.reply('🔮 Pregúntame algo.');

        const respuestas = [
            "Sí, claro. ✅", "No lo creo. ❌", "Quizás... 🕵️", 
            "Definitivamente sí. 🌟", "Pregunta mañana. 😴", 
            "Preguntale a un adulto responsable. 🙈"
        ];
        // Elegir respuesta al azar
        const azar = respuestas[Math.floor(Math.random() * respuestas.length)];

        // Crear la tarjeta bonita (Embed)
        const embed = new EmbedBuilder()
            .setTitle('🎱 La Bola Mágica')
            .setColor('Purple')
            .addFields(
                { name: 'Pregunta', value: query },
                { name: 'Respuesta', value: azar }
            );

        return message.channel.send({ embeds: [embed] });
    }

    // --- COMANDO: !AVATAR ---
    if (command === 'avatar') {
        // Coge el usuario mencionado O el autor del mensaje
        const usuario = message.mentions.users.first() || message.author;

        const embed = new EmbedBuilder()
            .setTitle(`Avatar de ${usuario.username}`)
            .setImage(usuario.displayAvatarURL({ size: 1024, dynamic: true }))
            .setColor('Blue');

        return message.channel.send({ embeds: [embed] });
    }

    // --- COMANDO DE DIAGNÓSTICO ---
    if (command === 'testbienvenida') {
        try {
            // Intentamos buscar el canal con la ID que has puesto arriba
            const channel = await client.channels.fetch(ID_CANAL_BIENVENIDA);
            
            if (channel) {
                channel.send('✅ **DIAGNÓSTICO:** La ID es correcta y tengo permisos para escribir.');
                message.reply('Test enviado al canal de bienvenida. ¿Lo ves?');
            }
        } catch (error) {
            message.reply(`❌ **ERROR:** No encuentro el canal. \nCausa: La ID ${ID_CANAL_BIENVENIDA} está mal O no tengo permiso "Ver Canal" en ese chat.`);
            console.error(error);
        }
    }

});

// ==========================================
// 4. SISTEMA DE BIENVENIDA Y DESPEDIDA
// ==========================================

//  AQUI PEGA LA ID DE TU CANAL 
const ID_CANAL_BIENVENIDA = '1009204515481854002'; 
const ID_CANAL_DESPEDIDA = '1009752137363894343'; 

client.on('guildMemberAdd', async (member) => {
    try {
        const channel = await member.guild.channels.fetch(ID_CANAL_BIENVENIDA);
        if (channel) {
            channel.send(`Bienvenido <@${member.id}>, suerte con salir cuerdo de aquí. 😃`);
        }
    } catch (e) {
        console.error('❌ Error Bienvenida: ID incorrecta o falta permiso "Ver Canal".');
    }
});

client.on('guildMemberRemove', async (member) => {
    try {
        const channel = await member.guild.channels.fetch(ID_CANAL_DESPEDIDA);
        if (channel) {
            channel.send(`@${member.user.username} No pudo aguantar más 😃.`);
        }
    } catch (e) {
        console.error('❌ Error Despedida.');
    }
});

client.login(process.env.DISCORD_TOKEN);