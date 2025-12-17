// ==========================================
// 🎨 ESTILOS NEKO: VERSIÓN FINAL - OREJAS CENTRADAS
// ==========================================
const { createCanvas, loadImage, registerFont } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

// Paleta de colores exacta
const COLORES = {
    fondoCanvas: '#2f3136',
    marcoExterior: '#202225',
    orejas: '#202225',
    marcoInterior: '#18191c',
    sombraGlow: '#000000',
    textoPrincipal: '#ffffff',
    textoSecundario: '#b9bbbe',
    bordeAvatar: '#202225'
};

// Función para rectángulos redondeados
function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// Función para dibujar las orejas
function dibujarOreja(ctx, x, y, esDerecha) {
    ctx.save();
    ctx.translate(x, y);
    if (esDerecha) {
        ctx.scale(-1, 1); // Espejo para la oreja derecha
    }

    ctx.beginPath();
    ctx.moveTo(0, 0);
    // Curva exterior
    ctx.bezierCurveTo(5, -40, 25, -70, 60, -80);
    // Curva interior (bajada)
    ctx.bezierCurveTo(70, -50, 75, -20, 80, 0);
    ctx.closePath();

    ctx.fillStyle = COLORES.orejas;
    ctx.fill();

    // Línea de detalle interna
    ctx.beginPath();
    ctx.moveTo(20, -10);
    ctx.bezierCurveTo(25, -30, 35, -50, 55, -55);
    ctx.strokeStyle = '#2f3136'; // Color ligeramente más claro para el detalle
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
}

async function crearTarjetaBienvenida(member) {
    // Dimensiones del canvas
    const canvasWidth = 800;
    const canvasHeight = 380; // Un poco más alto para las orejas
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // 1. Fondo transparente/oscuro
    ctx.fillStyle = COLORES.fondoCanvas;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 2. Dibujar Orejas (Detrás del marco exterior)
    // AJUSTE AQUÍ: Movemos las X hacia adentro (50 y -50 en vez de 20 y -20)
    // Y bajamos un poco la Y a 35 para que asienten mejor
    dibujarOreja(ctx, 50, 35, false); // Izquierda
    dibujarOreja(ctx, canvasWidth - 50, 35, true); // Derecha

    // 3. Marco Exterior
    const marcoExtX = 20;
    const marcoExtY = 35;
    const marcoExtW = canvasWidth - 40;
    const marcoExtH = canvasHeight - 55;
    
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetY = 5;
    
    roundRect(ctx, marcoExtX, marcoExtY, marcoExtW, marcoExtH, 30);
    ctx.fillStyle = COLORES.marcoExterior;
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 4. Marco Interior (Pantalla con Glow)
    const marcoIntMargin = 15;
    const marcoIntX = marcoExtX + marcoIntMargin;
    const marcoIntY = marcoExtY + marcoIntMargin;
    const marcoIntW = marcoExtW - (marcoIntMargin * 2);
    const marcoIntH = marcoExtH - (marcoIntMargin * 2);

    ctx.shadowColor = COLORES.sombraGlow;
    ctx.shadowBlur = 25;
    ctx.shadowOffsetY = 0;

    roundRect(ctx, marcoIntX, marcoIntY, marcoIntW, marcoIntH, 20);
    ctx.fillStyle = COLORES.marcoInterior;
    ctx.fill();

    ctx.shadowBlur = 0;

    // 5. Contenido (Avatar y Texto)
    const centerX = canvasWidth / 2;
    const centerY = marcoIntY + (marcoIntH / 2);

    // Avatar
    const avatarRadio = 70;
    const avatarY = centerY - 50;

    ctx.beginPath();
    ctx.arc(centerX, avatarY, avatarRadio + 5, 0, Math.PI * 2, true);
    ctx.fillStyle = COLORES.bordeAvatar;
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, avatarY, avatarRadio, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarURL);
    ctx.drawImage(avatar, centerX - avatarRadio, avatarY - avatarRadio, avatarRadio * 2, avatarRadio * 2);
    ctx.restore();

    // Texto
    ctx.textAlign = 'center';

    // Nombre principal
    ctx.fillStyle = COLORES.textoPrincipal;
    // Usamos una fuente serif en negrita para parecerse a la imagen
    ctx.font = 'bold 42px "Times New Roman", serif'; 
    let nombre = member.user.username.length > 15 ? member.user.username.substring(0, 15) + '...' : member.user.username;
    ctx.fillText(nombre, centerX, centerY + 55);

    // Frase secundaria
    ctx.fillStyle = COLORES.textoSecundario;
    ctx.font = '24px sans-serif';
    ctx.fillText("just joined the server", centerX, centerY + 85);

    // Contador de miembros
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`Member #${member.guild.memberCount}`, centerX, centerY + 115);

    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'bienvenida-neko.png' });
}

module.exports = { crearTarjetaBienvenida };