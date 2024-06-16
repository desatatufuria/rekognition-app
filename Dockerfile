# Etapa 1: Compilar la aplicación Angular
FROM node:18 as build

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Compilar la aplicación Angular
RUN npm run build --prod

# Etapa 2: Servir la aplicación Angular usando un servidor web
FROM nginx:alpine

# Copiar los archivos compilados de la etapa anterior
COPY --from=build /app/dist/rekognition-app /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 4203

# Comando por defecto para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
