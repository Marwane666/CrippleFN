FROM node:18-alpine as build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json* ./

# Installer les dépendances
RUN npm ci

# Copier le reste du code source
COPY . .

# Construire l'application
RUN npm run build

# Étape de production avec Nginx
FROM nginx:alpine

# Copier les fichiers de build depuis l'étape précédente
COPY --from=build /app/dist /usr/share/nginx/html

# Copier la configuration Nginx personnalisée si nécessaire
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposer le port
EXPOSE 80

# Démarrer Nginx
CMD ["nginx", "-g", "daemon off;"]
