# --- Etapa de dependencias ---
FROM node:20-alpine AS deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev

# --- Etapa final ---
FROM node:20-alpine
WORKDIR /usr/src/app

# Usuario no privilegiado por seguridad
RUN addgroup -S botgroup && adduser -S botuser -G botgroup

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
USER botuser

CMD ["node", "src/app.js"]
