# FROM node:23-slim
FROM node:23-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN node -v
COPY . .
RUN npm run build

# =====TODO======
# make sure that server runs on port 80
EXPOSE 80
EXPOSE 3306

CMD ["node", "server.js"]
