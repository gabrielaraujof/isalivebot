FROM node:alpine

ENV DISCORD_BOT_TOKEN=$DISCORD_BOT_TOKEN
ENV TELEGRAM_BOT_DOMAIN=$TELEGRAM_BOT_DOMAIN
ENV CHAT_ID=$CHAT_ID

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production

CMD [ "npm", "run", "start:prod" ]
