# Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Run stage (Nginx ile static servis)
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

# Default nginx içeriğini temizle
RUN rm -rf ./*

COPY --from=build /app/dist ./

EXPOSE 80

# Varsayılan nginx.conf SPA için uygun (root index.html)
CMD ["nginx", "-g", "daemon off;"]
