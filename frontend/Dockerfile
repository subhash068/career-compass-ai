FROM node:20-alpine

WORKDIR /app

ENV VITE_API_BASE_URL=https://career-compass-backend-production-162c.up.railway.app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 80

CMD ["npx", "serve", "-s", "dist", "-l", "80"]
