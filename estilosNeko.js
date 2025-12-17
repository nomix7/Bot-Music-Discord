// ==========================================
// 🎨 ESTILOS NEKO: REDISEÑO DE HUELLA (estilosNeko.js)
// ==========================================
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

// 1. PALETA DE COLORES (Oscura y Azul Neko)
const COLORES = {
    fondoInicio: '#0a0a2a', // Azul muy oscuro casi negro
    fondoFin: '#1c1c3c',    // Un tono ligeramente más claro para el degradado
    texto: '#ffffff',       // Texto blanco
    borde: '#4169e1',       // Borde azul real (Royal Blue)
    // Huellas azul cielo (DeepSkyBlue) semitransparentes
    huellas: 'rgba(0, 191, 255, 0.15)' 
};

// --- NUEVA FUNCIÓN PARA DIBUJAR LA HUELLA CLÁSICA ---
// Esta función ahora dibuja la forma exacta de la imagen que pasaste.
function dibujarHuella(ctx, x, y, tamaño, angulo) {
    ctx.save();
    // Nos movemos a la posición y rotamos
    ctx.translate(x, y);
    ctx.rotate(angulo);
    
    // Usamos el color azul transparente definido arriba
    ctx.fillStyle = COLORES.huellas;

    // Factor de escala para ajustar el tamaño general
    const s = tamaño * 0.8; 

    // --- 1. Almohadilla principal (La parte grande de abajo) ---
    ctx.beginPath();
    // Dibujamos un óvalo achatado en la parte inferior
    // Center (0, s*0.3), RadioX s*0.9, RadioY s*0.6
    ctx.ellipse(0, s * 0.3, s * 0.9, s * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- 2. Los 4 deditos (Óvalos arriba) ---
    // Definimos tamaños y posiciones relativas
    const toeWidth = s * 0.28;  // Ancho del dedo
    const toeHeight = s * 0.38; // Alto del dedo
    const toeYHigh = -s * 0.5;  // Altura para los dedos centrales (más arriba)
    const toeYLow = -s * 0.3;   // Altura para los dedos exteriores (más abajo)
    const toeXInner = s * 0.35; // Distancia X para los dedos centrales
    const toeXOuter = s * 0.85; // Distancia X para los dedos exteriores

    // Dedo interior izquierdo (ligeramente inclinado a la izquierda)
    ctx.beginPath();
    ctx.ellipse(-toeXInner, toeYHigh, toeWidth, toeHeight, -0.1, 0, Math.PI * 2); 
    ctx.fill();

    // Dedo interior derecho (ligeramente inclinado a la derecha)
    ctx.beginPath();
    ctx.ellipse(toeXInner, toeYHigh, toeWidth, toeHeight, 0.1, 0, Math.PI * 2); 
    ctx.fill();

    // Dedo exterior izquierdo (más bajo y más inclinado)
    ctx.beginPath();
    ctx.ellipse(-toeXOuter, toeYLow, toeWidth, toeHeight, -0.4, 0, Math.PI * 2);
    ctx.fill();

    // Dedo exterior derecho (más bajo y más inclinado)
    ctx.beginPath();
    ctx.ellipse(toeXOuter, toeYLow, toeWidth, toeHeight, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Restauramos el estado del pincel para no afectar a lo siguiente que se dibuje
    ctx.restore();
}

// --- FUNCIÓN PRINCIPAL (Crea la tarjeta) ---
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

    // Dibujamos 15 huellas con la NUEVA forma
    for (let i = 0; i < 15; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        // Tamaño aleatorio entre 10 y 25
        const tamaño = Math.random() * 15 + 10; 
        const angulo = Math.random() * Math.PI * 2;
        dibujarHuella(ctx, x, y, tamaño, angulo);
    }

    // Borde azul
    ctx.strokeStyle = COLORES.borde;
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    // --- TEXTO (CENTRADOS) ---
    ctx.fillStyle = COLORES.texto;
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.textAlign = 'center'; 

    // Título
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('¡Bienvenido/a!', canvasWidth / 2, 205); 

    // Nombre del usuario
    ctx.font = 'bold 32px sans-serif';
    let nombreDisplay = member.user.username.length > 20 ? member.user.username.substring(0, 20) + '...' : member.user.username;
    ctx.fillText(nombreDisplay, canvasWidth / 2, 235);


    // --- AVATAR (CENTRADO ARRIBA) ---
    ctx.shadowBlur = 0; 
    ctx.beginPath();
    
    // Configuración del círculo del avatar
    const avatarRadio = 75;
    const avatarCenterX = canvasWidth / 2;
    const avatarCenterY = 90;

    // Recorte circular
    ctx.arc(avatarCenterX, avatarCenterY, avatarRadio, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip(); 

    // Cargar y dibujar la imagen
    const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarURL);
    
    // Dibujar la imagen centrada en el recorte
    ctx.drawImage(
        avatar, 
        avatarCenterX - avatarRadio, 
        avatarCenterY - avatarRadio, 
        avatarRadio * 2,             
        avatarRadio * 2              
    );

    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'bienvenida-neko.png' });
}

module.exports = { crearTarjetaBienvenida };