# ARSW-proyecto
# Aplicación Web de Traducción en Tiempo Real

## Descripción

Esta es una aplicación web que permite la traducción en tiempo real de conversaciones de texto y voz entre diferentes idiomas. El objetivo es facilitar la comunicación entre personas de distintas lenguas de manera fluida y accesible desde cualquier navegador web.

## Características principales

- Traducción instantánea de texto y voz en múltiples idiomas.
- Interfaz de usuario sencilla, moderna y responsiva.
- Detección automática del idioma de entrada.
- Historial de conversaciones traducidas.
- Acceso desde cualquier dispositivo sin instalación.

## Tecnologías utilizadas

- **Frontend:** React / Next.js  
- **Backend:** Node.js + Express o NestJS  
- **APIs de traducción:** Google Cloud Translation, Azure Translator  
- **Procesamiento de voz:** Web Speech API, servicios externos  
- **Base de datos:** PostgreSQL 
- **Despliegue:**  AWS o Azure 

## Instalación y ejecución

1. Clona este repositorio:
    ```bash
    git clone https://github.com/tuusuario/tu-repo-traduccion-web.git
    ```
2. Instala las dependencias:
    ```bash
    cd tu-repo-traduccion-web
    npm install
    ```
3. Configura las variables de entorno según el archivo `.env.example`.
4. Inicia el proyecto:
    ```bash
    npm run dev
    ```

## Criterios de Aceptación

- [ ] El usuario puede escribir mensajes y recibir traducción automática en tiempo real.
- [ ] El usuario puede utilizar la entrada de voz y recibir traducción de voz a texto.
- [ ] El sistema detecta automáticamente el idioma de entrada.
- [ ] La respuesta de traducción es igual o menor a 2 segundos.
- [ ] El usuario puede ver el historial de conversaciones traducidas.
- [ ] La interfaz es responsiva y funciona en escritorio y móvil.
- [ ] El sistema garantiza privacidad y seguridad en el manejo de datos.
- [ ] Soporte para al menos 5 idiomas principales en la versión inicial.
- [ ] La aplicación funciona correctamente en los principales navegadores (Chrome, Firefox, Edge).

## Contribución

¿Quieres aportar al proyecto? ¡Bienvenido!
- Haz un fork de este repositorio.
- Crea una rama (`git checkout -b feature/nueva-funcionalidad`).
- Realiza tus cambios y haz commit (`git commit -am 'Agrega nueva funcionalidad'`).
- Sube tu rama (`git push origin feature/nueva-funcionalidad`).
- Abre un Pull Request para revisión.

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## Créditos

Desarrollado por [Esteban Valencia] — 2025  
Inspirado en la necesidad de eliminar barreras idiomáticas.

---

