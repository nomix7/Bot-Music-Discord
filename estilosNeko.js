// ==========================================
// 🎨 ESTILOS NEKO: EDICIÓN OREJAS CYBERPUNK
// ==========================================
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

// 1. PALETA DE COLORES (Mantenemos la estética oscura/neón)
const COLORES = {
    fondoInicio: '#0a0a2a', // Azul casi negro
    fondoFin: '#1c1c3c',    // Azul noche un poco más claro
    texto: '#ffffff',       // Blanco
    borde: '#4169e1',       // Azul eléctrico brillante (Royal Blue)
    // Relleno de las orejas: Azul cielo transparente para efecto cristal/neón
    rellenoOrejas: 'rgba(0, 191, 255, 0.3)' 
};

// (Hemos borrado la función de dibujar huellas porque ya no la usamos)

// --- FUNCIÓN PRINCIPAL ---
async function crearTarjetaBienvenida(member) {
    const canvasWidth = 700;
    const canvasHeight = 250;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // --- 1. FONDO BASE ---
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, COLORES.fondoInicio);
    gradient.addColorStop(1, COLORES.fondoFin);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // --- 2. DIBUJAR LAS OREJAS DE GATO (El "Doble Fondo") ---
    // Configuramos el estilo de las orejas
    ctx.fillStyle = COLORES.rellenoOrejas; // Relleno transparente
    ctx.strokeStyle = COLORES.borde;       // Borde brillante
    ctx.lineWidth = 5;                     // Grosor del borde de la oreja
    ctx.lineJoin = 'round';                // Esquinas suavizadas

    // ---> OREJA IZQUIERDA <---
    ctx.beginPath();
    ctx.moveTo(0, 120);   // Punto 1: Pegado al borde izquierdo, un poco abajo
    ctx.lineTo(80, 0);    // Punto 2: La punta de la oreja, arriba
    ctx.lineTo(180, 120); // Punto 3: Hacia adentro de la imagen
    ctx.closePath();      // Cierra el triángulo
    ctx.fill();           // Rellena
    ctx.stroke();         // Dibuja el borde

    // ---> OREJA DERECHA (Espejo) <---
    ctx.beginPath();
    ctx.moveTo(canvasWidth, 120);       // Punto 1: Borde derecho
    ctx.lineTo(canvasWidth - 80, 0);    // Punto 2: Punta arriba
    ctx.lineTo(canvasWidth - 180, 120); // Punto 3: Hacia adentro
    ctx.closePath();
    ctx.fill();
    ctx.stroke();


    // --- 3. BORDE PRINCIPAL ---
    // Dibujamos el borde rectangular encima de la base de las orejas
    ctx.strokeStyle = COLORES.borde;
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    // --- 4. TEXTOS CENTRADOS ---
    ctx.fillStyle = COLORES.texto;
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 6;
    ctx.textAlign = 'center'; 

    // Título
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('Bienvenido/a', canvasWidth / 2, 200); 

    // Nombre
    ctx.font = 'bold 34px sans-serif';
    let nombre = member.user.username.length > 20 
        ? member.user.username.substring(0, 20) + '...' 
        : member.user.username;
    ctx.fillText(nombre, canvasWidth / 2, 235);

    // --- 5. AVATAR CENTRADO ARRIBA ---
    ctx.shadowBlur = 0; 
    ctx.beginPath();
    
    const centerX = canvasWidth / 2;
    const centerY = 85; 
    const radio = 75;

    ctx.arc(centerX, centerY, radio, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip(); 

    const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarURL);
    
    ctx.drawImage(avatar, centerX - radio, centerY - radio, radio * 2, radio * 2);

    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'bienvenida-neko.png' });
}

module.exports = { crearTarjetaBienvenida };