// ==========================================
// 🎨 ESTILOS NEKO REDISEÑADO (estilosNeko.js)
// ==========================================
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

// 1. NUEVA PALETA DE COLORES OSCURA Y AZUL
const COLORES = {
    fondoInicio: '#0a0a2a', // Azul muy oscuro casi negro
    fondoFin: '#1c1c3c',    // Un tono ligeramente más claro para el degradado
    texto: '#ffffff',       // Texto blanco
    borde: '#4169e1',       // Borde azul real (Royal Blue)
    huellas: 'rgba(0, 191, 255, 0.15)' // Huellas azul cielo (DeepSkyBlue) semitransparentes
};

// Función auxiliar para dibujar una huella (NO CAMBIA)
function dibujarHuella(ctx, x, y, tamaño, angulo) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angulo);
    ctx.fillStyle = COLORES.huellas;
    ctx.beginPath();
    ctx.ellipse(0, 0, tamaño, tamaño * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    const distanciaDedos = tamaño * 1.2;
    const tamañoDedo = tamaño * 0.35;
    const angulosDedos = [-0.6, -0.2, 0.2, 0.6];
    angulosDedos.forEach(rad => {
        ctx.beginPath();
        const dx = Math.sin(rad) * distanciaDedos;
        const dy = -Math.cos(rad) * distanciaDedos;
        ctx.arc(dx, dy, tamañoDedo, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
}

// --- FUNCIÓN PRINCIPAL REDISEÑADA ---
async function crearTarjetaBienvenida(member) {
    const canvasWidth = 700;
    const canvasHeight = 250;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // --- FONDO Y DECORACIÓN ---
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, COLORES.fondoInicio);
    gradient.addColorStop(1, COLORES.fondoFin);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Dibujamos más huellas (15) azules para que se noten más en el fondo oscuro
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        const tamaño = Math.random() * 12 + 8; 
        const angulo = Math.random() * Math.PI * 2;
        dibujarHuella(ctx, x, y, tamaño, angulo);
    }

    // Borde azul
    ctx.strokeStyle = COLORES.borde;
    ctx.lineWidth = 8; // Un poco más fino
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    // --- TEXTO (CENTRADOS Y MÁS PEQUEÑOS) ---
    // IMPORTANTE: Dibujamos el texto ANTES de recortar el círculo del avatar.
    ctx.fillStyle = COLORES.texto;
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.textAlign = 'center'; // ¡Truco para centrar el texto horizontalmente!

    // Título pequeño
    ctx.font = 'bold 24px sans-serif'; // Tamaño reducido (antes era ~35-40)
    // Lo colocamos en el centro horizontal (350) y abajo (Y=205)
    ctx.fillText('¡Un nuevo Neko ha llegado!', canvasWidth / 2, 205); 

    // Nombre del usuario
    ctx.font = 'bold 32px sans-serif'; // Tamaño reducido (antes era ~55-60)
    // Permitimos nombres un poco más largos al ser la letra más pequeña
    let nombreDisplay = member.user.username.length > 20 ? member.user.username.substring(0, 20) + '...' : member.user.username;
    // Lo colocamos debajo del título (Y=235)
    ctx.fillText(nombreDisplay, canvasWidth / 2, 235);


    // --- AVATAR (CENTRADO ARRIBA) ---
    ctx.shadowBlur = 0; 
    ctx.beginPath();
    
    // Cálculos para centrar:
    // Centro X = canvasWidth / 2 = 350
    // Centro Y = Lo subimos un poco, por ejemplo a Y=90
    // Radio = Reducimos un poco el círculo a 75px
    const avatarRadio = 75;
    const avatarCenterX = canvasWidth / 2;
    const avatarCenterY = 90;

    // Dibujamos el círculo de recorte
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadio, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip(); // ¡RECORTE ACTIVADO!

    // Cargar y dibujar la imagen
    const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarURL);
    
    // Para dibujar la imagen cuadrada centrada sobre el círculo:
    // X de inicio = CentroX - Radio
    // Y de inicio = CentroY - Radio
    // Ancho/Alto = Radio * 2
    ctx.drawImage(
        avatar, 
        avatarCenterX - avatarRadio, // X: 350 - 75 = 275
        avatarCenterY - avatarRadio, // Y: 90 - 75 = 15
        avatarRadio * 2,             // Ancho: 150
        avatarRadio * 2              // Alto: 150
    );

    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'bienvenida-neko.png' });
}

module.exports = { crearTarjetaBienvenida };