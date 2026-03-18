FROM node:22-alpine AS build
WORKDIR /app

COPY Archive.Client/client/package*.json ./
RUN npm ci

COPY Archive.Client/client/ ./

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.29-alpine AS final
WORKDIR /usr/share/nginx/html

COPY Archive.Client/client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist ./

EXPOSE 80
