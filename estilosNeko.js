// ==========================================
// 🎨 ESTILOS NEKO: OREJAS REDONDAS Y SUAVES 😺
// ==========================================
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

const COLORES = {
    fondoCanvas: '#2b2d31',      // Gris Discord estándar
    
    // --- COLORES OREJAS ---
    orejaBorde: '#4e5058',       // Gris medio (trazo)
    orejaFondo: '#2b2d31',       // Mismo que fondo (huecas)
    orejaInterior: '#1e1f22',    // Gris oscuro (profundidad interior)

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

// Función para rectángulos redondeados (La misma de antes)
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

// --- NUEVA FUNCIÓN DE OREJA REDONDEADA ---
function dibujarOreja(ctx, x, y, esDerecha) {
    const dir = esDerecha ? 1 : -1; // 1 para derecha, -1 para izquierda
    
    // Configuramos el trazo para que las puntas y uniones sean redondas
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // === 1. OREJA EXTERIOR ===
    ctx.beginPath();
    ctx.moveTo(x, y); // Empezamos en la base pegada al marco

    // Usamos bezierCurveTo para tener control total de la curvatura
    // (cp1x, cp1y, cp2x, cp2y, xFinal, yFinal)
    
    // Trazado 1: Subida curva hacia afuera
    ctx.bezierCurveTo(
        x + (10 * dir), y - 50,  // Control 1: Sube un poco recto
        x + (30 * dir), y - 90,  // Control 2: Empieza a curvarse afuera
        x + (60 * dir), y - 100  // PUNTA: Llegamos a la cima (redondeada)
    );

    // Trazado 2: Bajada curva hacia la base exterior
    ctx.bezierCurveTo(
        x + (80 * dir), y - 105, // Control 1: Mantiene la redondez arriba
        x + (90 * dir), y - 50,  // Control 2: Baja abriéndose
        x + (100 * dir), y + 20  // Final: Base exterior (un poco más abajo)
    );

    // Cerramos la base
    ctx.lineTo(x, y);

    // Dibujamos
    ctx.fillStyle = COLORES.orejaFondo;
    ctx.fill();
    ctx.lineWidth = 6; // Grosor del trazo
    ctx.strokeStyle = COLORES.orejaBorde;
    ctx.stroke();

    // === 2. OREJA INTERIOR (La parte oscura) ===
    ctx.beginPath();
    // Empezamos un poco desplazados adentro
    const innerX = x + (25 * dir);
    const innerY = y - 10;
    
    ctx.moveTo(innerX, innerY);
    
    // Curva interior más pequeña
    ctx.bezierCurveTo(
        innerX + (5 * dir), innerY - 40,
        innerX + (20 * dir), innerY - 60,
        innerX + (40 * dir), innerY - 70 // Punta interior
    );
    
    ctx.bezierCurveTo(
        innerX + (55 * dir), innerY - 60,
        innerX + (55 * dir), innerY - 30,
        innerX + (60 * dir), innerY + 10
    );

    ctx.fillStyle = COLORES.orejaInterior;
    ctx.fill();
}

async function crearTarjetaBienvenida(member) {
    const canvasWidth = 800;
    const canvasHeight = 350;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // --- 1. FONDO ---
    ctx.fillStyle = COLORES.fondoCanvas;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // --- 2. DIBUJAR OREJAS ---
    // Ajustamos la posición X e Y para que encajen perfectas
    // Y=100 para que asomen bien por encima del marco
    dibujarOreja(ctx, 125, 101, false);         // Izquierda
    dibujarOreja(ctx, canvasWidth - 125, 101, true); // Derecha


    // --- 3. MARCO (Capa Intermedia) ---
    const marcoMargin = 40;
    const marcoTop = 50; 
    const marcoW = canvasWidth - (marcoMargin * 2);
    const marcoH = canvasHeight - marcoTop - 20; 
    
    roundRect(ctx, marcoMargin, marcoTop, marcoW, marcoH, 30);
    ctx.fillStyle = COLORES.marcoColor;
    ctx.fill();
    ctx.strokeStyle = COLORES.orejaBorde; 
    ctx.lineWidth = 4;
    ctx.stroke();


    // --- 4. PANTALLA (Capa Superior) ---
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
    const centerY = pantallaY + (pantallaH / 2); 

    // AVATAR
    const avatarRadio = 65;
    const avatarY = centerY - 45; 

    // Borde
    ctx.beginPath();
    ctx.arc(centerX, avatarY, avatarRadio, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = COLORES.bordeAvatar;
    ctx.stroke();

    // Imagen
    ctx.save();
    ctx.clip();
    const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarURL);
    ctx.drawImage(avatar, centerX - avatarRadio, avatarY - avatarRadio, avatarRadio * 2, avatarRadio * 2);
    ctx.restore();

    // TEXTO
    ctx.textAlign = 'center';

    // 1. NOMBRE (Grande)
    ctx.fillStyle = COLORES.textoBlanco;
    ctx.font = 'bold 38px sans-serif'; 
    let nombre = member.user.username.length > 15 ? member.user.username.substring(0, 15) + '...' : member.user.username;
    ctx.fillText(nombre, centerX, centerY + 55);

    // 2. FRASE (Más pequeña: 22px)
    ctx.fillStyle = COLORES.textoGris; 
    ctx.font = '22px sans-serif';      // <-- REDUCIDO A 22PX
    ctx.fillText("just joined the server", centerX, centerY + 85);

    // 3. CONTADOR
    ctx.fillStyle = COLORES.orejaBorde; 
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`Member #${member.guild.memberCount}`, centerX, centerY + 115);

    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'bienvenida-neko.png' });
}

module.exports = { crearTarjetaBienvenida };