# Stage 1: Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .


# Stage 2: Runtime Stage (Production)
FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/package*.json ./

ENV NODE_ENV=production

RUN npm install --omit=dev

COPY --from=builder /app .

EXPOSE 3000

CMD ["npm", "run", "dev"]
