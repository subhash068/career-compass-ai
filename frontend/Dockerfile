FROM node:20-alpine

WORKDIR /app

ENV VITE_API_BASE_URL=https://career-compass-backend-production-162c.up.railway.app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

COPY server.js .

EXPOSE 80

CMD ["node", "server.js"]
