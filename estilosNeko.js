// ================
// 🎨 ESTILOS NEKO
// ================
const { createCanvas, loadImage, registerFont } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

// 1. PALETA DE COLORES EXACTA (Extraída de la imagen de referencia)
const COLORES = {
    // Fondo general del canvas (oscuro para mezclarse con Discord)
    fondoCanvas: '#23272a',       
    // Color de las orejas (gris oscuro sutil)
    orejasRelleno: '#2c2f33',     
    // Fondo de la tarjeta interior (gris carbón)
    fondoInterior: '#292b2f',     
    // Sombra para el efecto "glow" de la tarjeta interior
    sombraInterior: '#000000',    
    // Texto principal (Blanco puro)
    textoPrincipal: '#ffffff',   
    // Texto secundario (Gris claro de Discord)
    textoSecundario: '#b9bbbe',  
    // Borde fino del avatar
    avatarBorde: '#ffffff'        
};

// --- FUNCIÓN PARA DIBUJAR RECTÁNGULOS REDONDEADOS ---
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

// --- FUNCIÓN PRINCIPAL ---
async function crearTarjetaBienvenida(member) {
    const canvasWidth = 800;
    const canvasHeight = 350;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // --- CAPA 1: FONDO BASE ---
    ctx.fillStyle = COLORES.fondoCanvas;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // --- CAPA 2: OREJAS (Sutiles en el fondo) ---
    ctx.fillStyle = COLORES.orejasRelleno;
    // Sin bordes, solo relleno sólido sutil

    // Oreja Izquierda
    ctx.beginPath();
    ctx.moveTo(70, 110);  // Base más ancha
    ctx.lineTo(130, 20);  // Punta redondeada
    ctx.lineTo(190, 110); // Base
    ctx.closePath();
    ctx.fill();

    // Oreja Derecha
    ctx.beginPath();
    ctx.moveTo(canvasWidth - 70, 110);
    ctx.lineTo(canvasWidth - 130, 20);
    ctx.lineTo(canvasWidth - 190, 110);
    ctx.closePath();
    ctx.fill();

    // --- CAPA 3: TARJETA INTERIOR CON "GLOW" ---
    const cardX = 40;
    const cardY = 60; // Un poco más abajo para dejar ver más las orejas
    const cardWidth = canvasWidth - 80;
    const cardHeight = canvasHeight - 100;
    const cornerRadius = 25; // Bordes más redondeados

    // Configuración de la sombra suave (Glow)
    ctx.shadowColor = COLORES.sombraInterior;
    ctx.shadowBlur = 25; // Difuminado intenso
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;

    // Dibujamos el rectángulo interior
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, cornerRadius);
    ctx.fillStyle = COLORES.fondoInterior;
    ctx.fill();
    
    // IMPORTANTE: Quitamos la sombra para lo siguiente
    ctx.shadowBlur = 0; 
    ctx.shadowOffsetY = 0;

    // --- CAPA 4: CONTENIDO (Avatar y Texto) ---
    const cardCenterX = canvasWidth / 2;
    const cardCenterY = cardY + (cardHeight / 2);

    // AVATAR CENTRADO
    const avatarRadio = 65;
    // Posición Y ajustada para que quede centrado en la mitad superior
    const avatarY = cardCenterY - 35; 

    ctx.beginPath();
    ctx.arc(cardCenterX, avatarY, avatarRadio, 0, Math.PI * 2, true);
    ctx.closePath();
    
    // Borde blanco fino (Grosor 3 en vez de 5)
    ctx.strokeStyle = COLORES.avatarBorde;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Recorte y dibujado de imagen
    ctx.save();
    ctx.clip();
    const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarURL);
    ctx.drawImage(avatar, cardCenterX - avatarRadio, avatarY - avatarRadio, avatarRadio * 2, avatarRadio * 2);
    ctx.restore();

    // TEXTOS
    ctx.textAlign = 'center';
    
    // Texto Principal: "usuario just joined the server"
    ctx.fillStyle = COLORES.textoPrincipal;
    // Fuente sans-serif negrita estándar del sistema
    ctx.font = 'bold 34px sans-serif'; 
    let nombre = member.user.username.length > 18 ? member.user.username.substring(0, 18) + '...' : member.user.username;
    ctx.fillText(`${nombre} just joined the server`, cardCenterX, cardCenterY + 65);

    // Texto Secundario: "Member #129"
    ctx.fillStyle = COLORES.textoSecundario;
    ctx.font = '26px sans-serif';
    const memberCount = member.guild.memberCount;
    ctx.fillText(`Member #${memberCount}`, cardCenterX, cardCenterY + 105);

    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'bienvenida-neko.png' });
}

module.exports = { crearTarjetaBienvenida };