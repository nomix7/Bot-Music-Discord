// ==========================================
// 🎨 ESTILOS NEKO: RECREACIÓN EXACTA (estilosNeko.js)
// ==========================================
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

// 1. PALETA DE COLORES (Basada en la imagen objetivo)
const COLORES = {
    fondoTotal: '#121212',       // Negro casi total para el fondo exterior
    fondoInterior: '#1e1e1e',    // Gris muy oscuro para la tarjeta interior
    bordeInterior: '#2a2a2a',    // Borde sutil para la tarjeta interior
    textoPrincipal: '#ffffff',   // Blanco
    textoSecundario: '#888888',  // Gris claro
    orejasBorde: '#4169e1',      // Azul neón (lo mantenemos para darle tu toque)
    orejasRelleno: '#1e1e1e'     // El mismo color que el fondo interior
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
    const canvasWidth = 800; // Un poco más ancho
    const canvasHeight = 350; // Un poco más alto
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // --- CAPA 1: FONDO TOTAL ---
    ctx.fillStyle = COLORES.fondoTotal;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // --- CAPA 2: OREJAS (Detrás de la tarjeta) ---
    // Configuramos el estilo para que parezcan salir de atrás
    ctx.fillStyle = COLORES.orejasRelleno; 
    ctx.strokeStyle = COLORES.orejasBorde;      
    ctx.lineWidth = 4;                    
    ctx.lineJoin = 'round';               

    // Oreja Izquierda
    ctx.beginPath();
    ctx.moveTo(60, 100);  // Base izquierda
    ctx.lineTo(120, 10);  // Punta
    ctx.lineTo(180, 100); // Base derecha
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Oreja Derecha
    ctx.beginPath();
    ctx.moveTo(canvasWidth - 60, 100);
    ctx.lineTo(canvasWidth - 120, 10);
    ctx.lineTo(canvasWidth - 180, 100);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // --- CAPA 3: TARJETA INTERIOR (El "Doble Fondo") ---
    const cardX = 40;
    const cardY = 50;
    const cardWidth = canvasWidth - 80;
    const cardHeight = canvasHeight - 90;
    const cornerRadius = 20; // Bordes redondeados

    // Sombra sutil para dar profundidad
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;

    // Dibujamos el rectángulo redondeado
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, cornerRadius);
    ctx.fillStyle = COLORES.fondoInterior;
    ctx.fill();
    
    // Borde sutil
    ctx.shadowBlur = 0; // Quitamos sombra para el borde
    ctx.strokeStyle = COLORES.bordeInterior;
    ctx.lineWidth = 2;
    ctx.stroke();

    // --- CAPA 4: CONTENIDO (Avatar y Texto) ---
    const cardCenterX = cardX + (cardWidth / 2);
    const cardCenterY = cardY + (cardHeight / 2);

    // AVATAR CENTRADO
    const avatarRadio = 65;
    const avatarY = cardCenterY - 40; // Lo subimos un poco del centro exacto

    ctx.beginPath();
    ctx.arc(cardCenterX, avatarY, avatarRadio, 0, Math.PI * 2, true);
    ctx.closePath();
    
    // Borde blanco alrededor del avatar (como en la foto)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 5;
    ctx.stroke();
    
    // Recorte y dibujado
    ctx.save(); // Guardamos estado para el recorte
    ctx.clip();
    const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarURL);
    ctx.drawImage(avatar, cardCenterX - avatarRadio, avatarY - avatarRadio, avatarRadio * 2, avatarRadio * 2);
    ctx.restore(); // Restauramos para que el texto no se recorte

    // TEXTOS
    ctx.textAlign = 'center';
    
    // Texto Principal: "usuario just joined the server"
    ctx.fillStyle = COLORES.textoPrincipal;
    ctx.font = 'bold 32px sans-serif';
    // Aseguramos que el nombre no sea demasiado largo
    let nombre = member.user.username.length > 18 ? member.user.username.substring(0, 18) + '...' : member.user.username;
    ctx.fillText(`${nombre} se ha unido al servidor`, cardCenterX, cardCenterY + 60);

    // Texto Secundario: "Member #129"
    ctx.fillStyle = COLORES.textoSecundario;
    ctx.font = '24px sans-serif';
    // Obtenemos el número de miembro actual
    const memberCount = member.guild.memberCount;
    ctx.fillText(`Member #${memberCount}`, cardCenterX, cardCenterY + 100);

    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'bienvenida-neko.png' });
}

module.exports = { crearTarjetaBienvenida };