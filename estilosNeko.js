// ==========================================
// 🎨 ESTILOS NEKO: VERSIÓN "5 CÍRCULOS" (Simpler & Cleaner)
// ==========================================
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

// 1. PALETA DE COLORES
const COLORES = {
    fondoInicio: '#0a0a2a', // Azul casi negro
    fondoFin: '#1c1c3c',    // Azul noche
    texto: '#ffffff',       // Blanco
    borde: '#4169e1',       // Borde azul eléctrico
    // Huellas azul cielo brillantes pero transparentes
    huellas: 'rgba(0, 191, 255, 0.2)' 
};

// --- FUNCIÓN SUPER SIMPLIFICADA PARA LA HUELLA ---
// Usamos 1 círculo grande y 4 pequeños distribuidos uniformemente
function dibujarHuella(ctx, x, y, tamaño, angulo) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angulo);
    ctx.fillStyle = COLORES.huellas;

    // 1. La almohadilla principal (Un círculo achatado un pelín)
    ctx.beginPath();
    // (x, y, radioX, radioY, rotación, inicio, fin)
    ctx.ellipse(0, tamaño * 0.2, tamaño * 0.9, tamaño * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Los 4 dedos (Círculos perfectos)
    const radioDedo = tamaño * 0.35; // Tamaño de los dedos
    const distancia = tamaño * 1.3;  // Qué tan lejos están del centro

    // Definimos los 4 ángulos exactos para que la separación sea IDÉNTICA
    // -0.6 rad, -0.2 rad, +0.2 rad, +0.6 rad (Separación de 0.4 entre todos)
    const angulos = [-0.6, -0.2, 0.2, 0.6];

    angulos.forEach(rad => {
        ctx.beginPath();
        // Matemáticas simples: Calcular posición X e Y basada en el ángulo
        const dx = Math.sin(rad) * distancia;     
        const dy = -Math.cos(rad) * distancia; // El menos es para ir hacia "arriba"
        
        ctx.arc(dx, dy, radioDedo, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}

// --- FUNCIÓN PRINCIPAL ---
async function crearTarjetaBienvenida(member) {
    const canvasWidth = 700;
    const canvasHeight = 250;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    // --- FONDO ---
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, COLORES.fondoInicio);
    gradient.addColorStop(1, COLORES.fondoFin);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // --- DECORACIÓN: HUELLAS ---
    // Dibujamos 18 huellas para llenar bien el fondo
    for (let i = 0; i < 18; i++) {
        const x = Math.random() * canvasWidth;
        const y = Math.random() * canvasHeight;
        const tamaño = Math.random() * 14 + 8; // Tamaño variado
        const angulo = Math.random() * Math.PI * 2; // Rotación aleatoria
        dibujarHuella(ctx, x, y, tamaño, angulo);
    }

    // --- BORDE ---
    ctx.strokeStyle = COLORES.borde;
    ctx.lineWidth = 8;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    // --- TEXTOS CENTRADOS ---
    ctx.fillStyle = COLORES.texto;
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 5;
    ctx.textAlign = 'center'; 

    // Título
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('Bienvenido/a', canvasWidth / 2, 200); 

    // Nombre (Limitado a 20 caracteres)
    ctx.font = 'bold 34px sans-serif';
    let nombre = member.user.username.length > 20 
        ? member.user.username.substring(0, 20) + '...' 
        : member.user.username;
    ctx.fillText(nombre, canvasWidth / 2, 235);

    // --- AVATAR CENTRADO ---
    ctx.shadowBlur = 0; 
    ctx.beginPath();
    
    // Coordenadas del círculo central
    const centerX = canvasWidth / 2;
    const centerY = 85; // Un poco más arriba para dejar espacio al texto
    const radio = 75;

    ctx.arc(centerX, centerY, radio, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip(); // Recortar

    const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarURL);
    
    ctx.drawImage(avatar, centerX - radio, centerY - radio, radio * 2, radio * 2);

    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'bienvenida-neko.png' });
}

module.exports = { crearTarjetaBienvenida };