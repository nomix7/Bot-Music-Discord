// ==========================================
// 🎨 ESTILOS NEKO: RÉPLICA EXACTA FINAL V2 (estilosNeko.js)
// ==========================================
// Basado en la referencia visual exacta de image_17.png
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

// 1. PALETA DE COLORES EXACTA
const COLORES = {
    // Fondo base oscuro (se funde con Discord)
    fondoCanvas: '#2f3136',       
    // Orejas sutiles en el fondo
    orejasRelleno: '#202225',     
    // Fondo de la tarjeta principal (gris muy oscuro)
    fondoInterior: '#18191c',     
    // Sombra difusa y profunda para el efecto "glow" oscuro
    sombraGlow: '#050505',    
    // Texto principal (Blanco puro)
    textoPrincipal: '#ffffff',   
    // Texto secundario (Gris claro estándar)
    textoSecundario: '#b9bbbe',  
    // Borde fino y nítido del avatar
    avatarBorde: '#ffffff'        
};

// --- FUNCIÓN AUXILIAR PARA RECTÁNGULOS REDONDEADOS ---
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

    // --- CAPA 2: OREJAS DE GATO (Fondo sutil) ---
    ctx.fillStyle = COLORES.orejasRelleno;
    
    // Oreja Izquierda
    ctx.beginPath();
    // Coordenadas ajustadas para la forma de la referencia
    ctx.moveTo(80, 110);  
    ctx.lineTo(140, 25);  
    ctx.lineTo(200, 110); 
    ctx.closePath();
    ctx.fill();

    // Oreja Derecha (Espejo)
    ctx.beginPath();
    ctx.moveTo(canvasWidth - 80, 110);
    ctx.lineTo(canvasWidth - 140, 25);
    ctx.lineTo(canvasWidth - 200, 110);
    ctx.closePath();
    ctx.fill();

    // --- CAPA 3: TARJETA INTERIOR CON "GLOW" OSCURO ---
    const cardMarginX = 50;
    const cardMarginY = 60;
    const cardX = cardMarginX;
    const cardY = cardMarginY;
    const cardWidth = canvasWidth - (cardMarginX * 2);
    const cardHeight = canvasHeight - (cardMarginY * 1.5);
    const cornerRadius = 20; // Bordes redondeados suaves

    // Configuración de la sombra (El "Glow" oscuro)
    ctx.shadowColor = COLORES.sombraGlow;
    ctx.shadowBlur = 30; // Difuminado alto y suave
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8; // Ligero desplazamiento hacia abajo para profundidad

    // Dibujar la tarjeta
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, cornerRadius);
    ctx.fillStyle = COLORES.fondoInterior;
    ctx.fill();
    
    // IMPORTANTE: Resetear sombra para que no afecte al contenido
    ctx.shadowBlur = 0; 
    ctx.shadowOffsetY = 0;

    // --- CAPA 4: CONTENIDO (Avatar y Texto) ---
    const cardCenterX = canvasWidth / 2;
    // Calculamos el centro vertical de la tarjeta interior
    const cardCenterY = cardY + (cardHeight / 2);

    // -- AVATAR --
    const avatarRadio = 65;
    // Posición Y del avatar (ligeramente por encima del centro)
    const avatarY = cardCenterY - 40; 

    // 1. Dibujar el borde blanco fino
    ctx.beginPath();
    ctx.arc(cardCenterX, avatarY, avatarRadio, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.strokeStyle = COLORES.avatarBorde;
    ctx.lineWidth = 3; // Grosor fino exacto
    ctx.stroke();
    
    // 2. Recortar y dibujar la imagen dentro
    ctx.save(); // Guardar estado
    ctx.clip(); // Crear máscara de recorte circular
    
    const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarURL);
    // Dibujar imagen centrada en el círculo
    ctx.drawImage(avatar, cardCenterX - avatarRadio, avatarY - avatarRadio, avatarRadio * 2, avatarRadio * 2);
    
    ctx.restore(); // Restaurar estado (quitar recorte)

    // -- TEXTOS --
    ctx.textAlign = 'center';
    
    // Texto Principal: Nombre + just joined...
    ctx.fillStyle = COLORES.textoPrincipal;
    // Fuente negrita simple, tamaño ajustado
    ctx.font = 'bold 32px sans-serif'; 
    // Recortar nombre si es muy largo
    let nombre = member.user.username.length > 18 ? member.user.username.substring(0, 18) + '...' : member.user.username;
    ctx.fillText(`${nombre} just joined the server`, cardCenterX, cardCenterY + 60);

    // Texto Secundario: Member #...
    ctx.fillStyle = COLORES.textoSecundario;
    // Fuente normal, tamaño menor
    ctx.font = '24px sans-serif';
    const memberCount = member.guild.memberCount;
    ctx.fillText(`Member #${memberCount}`, cardCenterX, cardCenterY + 100);

    // Generar el archivo final
    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'bienvenida-neko.png' });
}

module.exports = { crearTarjetaBienvenida };