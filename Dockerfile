FROM node:alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:alpine
WORKDIR /root/
COPY --from=builder /app/dist .
COPY --from=builder /app/package*.json .
RUN npm install --only=production
