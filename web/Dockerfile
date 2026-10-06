# Сборка Vite-бандла
FROM node:24-alpine AS build
WORKDIR /srv/web
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Раздача через Nginx с прокси на api и keycloak
FROM nginx:1.27-alpine
COPY --from=build /srv/web/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
