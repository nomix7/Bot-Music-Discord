// ==========================================
// 🎨 ESTILOS NEKO: VERSIÓN "CONSOLA NEKO" (Triple Capa)
// ==========================================
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

const COLORES = {
    fondoCanvas: '#2b2d31',      // Gris Discord estándar
    
    // --- COLORES OREJAS ---
    orejaBorde: '#4e5058',       // Gris medio (el trazo)
    orejaFondo: '#2b2d31',       // El mismo que el fondo (para que parezca hueca)
    orejaInterior: '#1e1f22',    // Gris muy oscuro (la "profundidad" interior de la oreja)

    // --- COLORES MARCO (Capa intermedia) ---
    marcoColor: '#383a40',       // Un gris que destaca sobre el fondo pero no brilla
    
    // --- COLORES PANTALLA (Capa superior) ---
    pantallaFondo: '#111214',    // Casi negro (donde va el texto)
    pantallaSombra: '#000000',   // Sombra para separar pantalla de marco

    // --- TEXTO Y DETALLES ---
    textoBlanco: '#ffffff',
    textoGris: '#dbdee1',
    bordeAvatar: '#ffffff'
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

// Función para dibujar una oreja compleja (Exterior + Interior)
function dibujarOreja(ctx, x, y, esDerecha) {
    const factor = esDerecha ? -1 : 1; // Invierte si es la derecha
    
    // 1. OREJA EXTERIOR (El contorno grande)
    ctx.beginPath();
    // Empezamos abajo (base de la oreja)
    ctx.moveTo(x, y); 
    // Curva hacia arriba (el lado exterior abombado)
    ctx.quadraticCurveTo(x + (20 * factor), y - 60, x + (60 * factor), y - 100); 
    // Curva hacia abajo (el lado interior)
    ctx.quadraticCurveTo(x + (80 * factor), y - 40, x + (100 * factor), y);
    
    // Dibujamos el borde y rellenamos
    ctx.fillStyle = COLORES.orejaFondo;
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = COLORES.orejaBorde;
    ctx.stroke();

    // 2. OREJA INTERIOR (La profundidad oscura)
    ctx.beginPath();
    // Hacemos una forma similar pero más pequeña y desplazada dentro
    const innerX = x + (25 * factor);
    const innerY = y - 10;
    
    ctx.moveTo(innerX, innerY);
    ctx.quadraticCurveTo(innerX + (10 * factor), innerY - 40, innerX + (35 * factor), innerY - 70);
    ctx.quadraticCurveTo(innerX + (50 * factor), innerY - 30, innerX + (60 * factor), innerY);
    
    ctx.fillStyle = COLORES.orejaInterior;
    ctx.fill();
    // Sin borde para la parte de dentro, solo relleno oscuro
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
    // Las dibujamos antes que el marco para que queden "detrás"
    
    // Oreja Izquierda (Posicionada sobre la izquierda del marco)
    dibujarOreja(ctx, 100, 130, false);
    
    // Oreja Derecha (Posicionada sobre la derecha del marco)
    dibujarOreja(ctx, canvasWidth - 100, 130, true);


    // --- 3. EL MARCO (La capa del medio / Primer cuadrado) ---
    const marcoX = 50;
    const marcoY = 80;
    const marcoW = 700;
    const marcoH = 250;
    
    roundRect(ctx, marcoX, marcoY, marcoW, marcoH, 30); // Bordes muy redondos
    ctx.fillStyle = COLORES.marcoColor;
    ctx.fill();
    // Le ponemos un borde sutil al marco
    ctx.strokeStyle = COLORES.orejaBorde; 
    ctx.lineWidth = 4;
    ctx.stroke();


    // --- 4. LA PANTALLA (La capa superior / Cuadrado oscuro) ---
    // Esta va dentro del marco, dejando un margen (el efecto bisel)
    const margen = 15; // Grosor del marco visible
    const pantallaX = marcoX + margen;
    const pantallaY = marcoY + margen;
    const pantallaW = marcoW - (margen * 2);
    const pantallaH = marcoH - (margen * 2);

    // Sombra para que parezca que la pantalla está "hundida" o separada
    ctx.shadowColor = COLORES.pantallaSombra;
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 5;

    roundRect(ctx, pantallaX, pantallaY, pantallaW, pantallaH, 20);
    ctx.fillStyle = COLORES.pantallaFondo;
    ctx.fill();

    // Resetear sombras para el texto y avatar
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;


    // --- 5. CONTENIDO (Avatar y Texto) ---
    const centerX = canvasWidth / 2;
    const centerY = pantallaY + (pantallaH / 2); // Centro de la pantalla negra

    // AVATAR
    const avatarRadio = 65;
    const avatarY = centerY - 40; 

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

    // Título (Nombre)
    ctx.fillStyle = COLORES.textoBlanco;
    ctx.font = 'bold 36px sans-serif'; // Letra grande y gruesa
    let nombre = member.user.username.length > 15 ? member.user.username.substring(0, 15) + '...' : member.user.username;
    ctx.fillText(`${nombre} just joined the server`, centerX, centerY + 65);

    // Subtítulo (Member count)
    ctx.fillStyle = COLORES.textoGris;
    ctx.font = '24px sans-serif';
    ctx.fillText(`Member #${member.guild.memberCount}`, centerX, centerY + 105);

    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'bienvenida-neko.png' });
}

module.exports = { crearTarjetaBienvenida };