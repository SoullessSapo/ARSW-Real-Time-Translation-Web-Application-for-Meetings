# Translation Gateway Tester

Mini app React para probar los gateways de signaling y traducción.

## ¿Qué hace?

- Permite unirse a una llamada (simula varias personas abriendo varias pestañas con el mismo Meeting ID).
- Envía audio al gateway de traducción y muestra los textos traducidos y logs de eventos.
- Muestra logs de todo lo enviado y recibido.

## Archivos principales

- `App.js`: Lógica principal React.
- `App.css`: Estilos.
- `index.html`: Carga la app (puedes usar un bundler o servir directo).

## ¿Cómo usar?

1. Copia estos archivos en un proyecto React (o usa `index.html` directamente con un servidor estático).
2. Instala `socket.io-client` si usas bundler: `npm install socket.io-client`.
3. Asegúrate de que tu backend NestJS esté corriendo en `localhost:3000` (o cambia la URL en el código).
4. Abre varias pestañas, pon el mismo Meeting ID y diferentes User ID.
5. Haz clic en "Unirse" y prueba enviar audio.

---

Puedes modificar el código para integrarlo a tu proyecto React existente.
