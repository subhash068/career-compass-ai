FROM node:20-alpine AS builder

WORKDIR /app

ENV VITE_API_BASE_URL=https://career-compass-backend-production-162c.up.railway.app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY server.js .

EXPOSE 80

CMD ["node", "server.js"]
