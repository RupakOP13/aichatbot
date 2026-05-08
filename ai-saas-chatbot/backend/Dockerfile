FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm install -g ts-node typescript

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
