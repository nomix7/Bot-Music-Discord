// ==========================================
// 🎨 ESTILOS NEKO (estilosNeko.js)
// ==========================================
const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

// Configuración de colores (Tu "CSS" de variables)
const COLORES = {
    fondoInicio: '#2b003e', // Morado oscuro
    fondoFin: '#ff007f',    // Rosa neón
    texto: '#ffffff',
    borde: '#ffffff',
    huellas: 'rgba(255, 255, 255, 0.1)' // Huellas blancas transparentes
};

// Función auxiliar para dibujar una huella de gato 🐾
function dibujarHuella(ctx, x, y, tamaño, angulo) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angulo);
    ctx.fillStyle = COLORES.huellas;

    // Almohadilla principal
    ctx.beginPath();
    ctx.ellipse(0, 0, tamaño, tamaño * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Deditos
    const distanciaDedos = tamaño * 1.2;
    const tamañoDedo = tamaño * 0.35;
    const angulosDedos = [-0.6, -0.2, 0.2, 0.6]; // Distribución de los dedos

    angulosDedos.forEach(rad => {
        ctx.beginPath();
        const dx = Math.sin(rad) * distanciaDedos;
        const dy = -Math.cos(rad) * distanciaDedos;
        ctx.arc(dx, dy, tamañoDedo, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}

// Función principal que exportamos
async function crearTarjetaBienvenida(member) {
    const canvas = createCanvas(700, 250);
    const ctx = canvas.getContext('2d');

    // 1. FONDO DEGRADADO NEKO
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, COLORES.fondoInicio);
    gradient.addColorStop(1, COLORES.fondoFin);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. DECORACIÓN: HUELLAS DE GATO DE FONDO 🐾
    // Dibujamos 10 huellas aleatorias
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const tamaño = Math.random() * 15 + 10; // Tamaño entre 10 y 25
        const angulo = Math.random() * Math.PI * 2;
        dibujarHuella(ctx, x, y, tamaño, angulo);
    }

    // 3. BORDE
    ctx.strokeStyle = COLORES.borde;
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // 4. TEXTO
    ctx.fillStyle = COLORES.texto;
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 10;
    
    ctx.font = 'bold 35px sans-serif'; 
    ctx.fillText('¡Un nuevo Neko llegó!', 270, 90); 

    ctx.font = 'bold 55px sans-serif';
    let nombreDisplay = member.user.username.length > 12 ? member.user.username.substring(0, 12) + '...' : member.user.username;
    ctx.fillText(nombreDisplay, 270, 170);

    // 5. AVATAR EN CÍRCULO
    ctx.shadowBlur = 0; 
    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip(); 

    const avatarURL = member.user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarURL);
    ctx.drawImage(avatar, 25, 25, 200, 200);

    // Devolvemos el archivo listo
    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: 'bienvenida-neko.png' });
}

// Exportamos la función para poder usarla en index.js
module.exports = { crearTarjetaBienvenida };