FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.template.conf /etc/nginx/nginx.template.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["sh", "-c", "apk add --no-cache gettext && envsubst < /etc/nginx/nginx.template.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
