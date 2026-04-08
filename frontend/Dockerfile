FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# We use standard vite build
RUN npm run build

FROM nginx:alpine
# Copy built assets from builder
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config if needed, otherwise default serves index.html
RUN echo 'server { \
    listen ${PORT:-8080}; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf.template

# Replace $PORT and start nginx
CMD envsubst '\$PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
