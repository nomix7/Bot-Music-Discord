# Bot de Música y Moderación para Discord

Bot desarrollado en Node.js con arquitectura híbrida para evitar bloqueos de IP en servicios de streaming.

## Características

- **Modo Híbrido Inteligente:**
  - **Nube (Render):** Gestiona comandos de texto y moderación 24/7.
  - **Local (PC):** Gestiona la reproducción de música de alta calidad (YouTube/Spotify/SoundCloud) bajo demanda.
- **Sistema de Música:** Play, Stop, Skip y colas de reproducción.
- **Moderación:** Comandos básicos de respuesta (!ping, !hola).

## Tecnologías

- **Lenguaje:** JavaScript (Node.js)
- **Librerías:** discord.js, discord-player, express (para keep-alive).
- **Despliegue:** Render + GitHub CI/CD.

## Instalación y Configuración

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/nomix7/Bot-Music-Discord.git](https://github.com/nomix7/Bot-Music-Discord.git)