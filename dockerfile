# Usa una imagen oficial de Node.js
FROM node:20-alpine

# Crea un directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala dependencias (usa npm o yarn)
RUN npm install --production

# Copia el resto del código fuente
COPY . .

# Expón el puerto (ajústalo a tu app, por ejemplo 3001)
EXPOSE 3001

# Variable de entorno para el puerto (opcional pero recomendable)
ENV PORT=3001

# Comando para arrancar la app (ajusta si usas otra cosa)
CMD ["npm", "start"]
