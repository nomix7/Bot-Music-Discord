// ==========================================
// 🎨 ESTILOS NEKO: VERSIÓN "OREJAS FUERA & FULL HEIGHT"
// ==========================================
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

const COLORES = {
    fondoCanvas: '#2b2d31',      // Gris Discord estándar
    
    // --- COLORES OREJAS ---
    orejaBorde: '#4e5058',       // Gris medio (trazo)
    orejaFondo: '#2b2d31',       // Mismo que fondo (huecas)
    orejaInterior: '#1e1f22',    // Gris oscuro (profundidad)

    // --- COLORES MARCO (Capa intermedia) ---
    marcoColor: '#383a40',       // Gris carcasa
    
    // --- COLORES PANTALLA (Capa superior) ---
    pantallaFondo: '#111214',    // Casi negro (pantalla)
    pantallaSombra: '#000000',   // Sombra de profundidad

    // --- TEXTO Y DETALLES ---
    textoBlanco: '#ffffff',
    textoGris: '#dbdee1',
    bordeAvatar: '#ffffff'
};

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

// Función ajustada: Orejas mirando hacia AFUERA
function dibujarOreja(ctx, x, y, esDerecha) {
    // Si es derecha (true), invertimos el dibujo horizontalmente
    const dir = esDerecha ? 1 : -1; 
    
    // 1. OREJA EXTERIOR
    ctx.beginPath();
    // Empezamos en la base (pegado al marco)
    ctx.moveTo(x, y); 
    
    // Curva hacia AFUERA y ARRIBA
    // Control point (x + 60*dir) empuja hacia afuera
    ctx.quadraticCurveTo(x + (60 * dir), y - 80, x + (50 * dir), y - 110); 
    
    // Curva de retorno hacia adentro
    ctx.quadraticCurveTo(x + (20 * dir), y - 50, x + (90 * dir), y);
    
    ctx.fillStyle = COLORES.orejaFondo;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = COLORES.orejaBorde;
    ctx.stroke();

    // 2. OREJA INTERIOR (Profundidad)
    ctx.beginPath();
    // Un poco más adentro
    const innerX = x + (20 * dir);
    const innerY = y - 10;

    ctx.moveTo(innerX, innerY);
    // Seguimos la misma forma pero más pequeña
    ctx.quadraticCurveTo(innerX + (40 * dir), innerY - 60, innerX + (35 * dir), innerY - 80);
    ctx.quadraticCurveTo(innerX + (15 * dir), innerY - 40, innerX + (50 * dir), innerY);

    ctx.fillStyle = COLORES.orejaInterior;
    ctx.fill();
}

async function crearTarjetaBienvenida(member) {
    const canvasWidth = 800;
    const canvasHeight = 350;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // --- 1. FONDO GENERAL ---
    ctx.fillStyle = COLORES.fondoCanvas;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // --- 2. DIBUJAR OREJAS (Capa trasera) ---
    // Ajustamos coordenadas Y porque ahora el marco está más arriba
    // x=130 para separarlas un poco más
    dibujarOreja(ctx, 130, 90, false); // Izquierda
    dibujarOreja(ctx, canvasWidth - 130, 90, true); // Derecha


    // --- 3. EL MARCO (Aprovechando más espacio arriba) ---
    const marcoMargin = 40; // Margen lateral
    const marcoTop = 50;    // ¡SUBIDO! Antes era 80, ahora 50 para aprovechar hueco
    const marcoW = canvasWidth - (marcoMargin * 2);
    // Calculamos altura para llegar casi hasta abajo (dejando 20px de margen inferior)
    const marcoH = canvasHeight - marcoTop - 20; 
    
    roundRect(ctx, marcoMargin, marcoTop, marcoW, marcoH, 30);
    ctx.fillStyle = COLORES.marcoColor;
    ctx.fill();
    ctx.strokeStyle = COLORES.orejaBorde; 
    ctx.lineWidth = 4;
    ctx.stroke();


    // --- 4. LA PANTALLA (Capa oscura central) ---
    const pantallaMargin = 15;
    const pantallaX = marcoMargin + pantallaMargin;
    const pantallaY = marcoTop + pantallaMargin;
    const pantallaW = marcoW - (pantallaMargin * 2);
    const pantallaH = marcoH - (pantallaMargin * 2);

    ctx.shadowColor = COLORES.pantallaSombra;
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 5;

    roundRect(ctx, pantallaX, pantallaY, pantallaW, pantallaH, 20);
    ctx.fillStyle = COLORES.pantallaFondo;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;


    // --- 5. CONTENIDO ---
    const centerX = canvasWidth / 2;
    // Centro visual de la pantalla negra
    const centerY = pantallaY + (pantallaH / 2); 

    // AVATAR (Subido un poco para dejar sitio al texto)
    const avatarRadio = 65;
    const avatarY = centerY - 45; 

    // Borde Avatar
    ctx.beginPath();
    ctx.arc(centerX, avatarY, avatarRadio, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = COLORES.bordeAvatar;
    ctx.stroke();

    // Imagen Avatar
    ctx.save();
    ctx.clip();
    const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarURL);
    ctx.drawImage(avatar, centerX - avatarRadio, avatarY - avatarRadio, avatarRadio * 2, avatarRadio * 2);
    ctx.restore();

    // TEXTO
    ctx.textAlign = 'center';

    // 1. NOMBRE DEL USUARIO (Grande)
    ctx.fillStyle = COLORES.textoBlanco;
    ctx.font = 'bold 38px sans-serif'; 
    let nombre = member.user.username.length > 15 ? member.user.username.substring(0, 15) + '...' : member.user.username;
    // Lo dibujamos debajo del avatar
    ctx.fillText(nombre, centerX, centerY + 55);

    // 2. FRASE DE BIENVENIDA (Más pequeña, como pediste)
    ctx.fillStyle = COLORES.textoGris; // Un poco más gris para dar jerarquía
    ctx.font = '24px sans-serif';      // Reducido de 36 a 24
    ctx.fillText("just joined the server", centerX, centerY + 85);

    // 3. CONTADOR DE MIEMBROS
    ctx.fillStyle = COLORES.orejaBorde; // Gris oscuro sutil
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`Member #${member.guild.memberCount}`, centerX, centerY + 115);

    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'bienvenida-neko.png' });
}

module.exports = { crearTarjetaBienvenida };