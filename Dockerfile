# Étape 1 : Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copie des fichiers nécessaires
COPY package.json pnpm-lock.yaml ./

# Installation des dépendances (production + build)
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

# Build du projet
RUN pnpm build

# Étape 2 : Image finale, plus légère
FROM node:20-alpine AS runner
WORKDIR /app

# Copie uniquement les fichiers nécessaires pour l'exécution
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copie du script de démarrage (optionnel)
# COPY --from=builder /app/start.sh ./

# Port exposé (3001 d'après src/main.ts)
EXPOSE 3001

# Commande de démarrage
CMD ["node", "dist/src/main.js"]