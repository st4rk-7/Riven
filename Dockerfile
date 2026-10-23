# One image serves the website and the API. Settings come from the host environment.
FROM node:24-alpine
WORKDIR /app

COPY package.json package-lock.json ./
# shortcut: keeps dev dependencies because the server runs TypeScript through tsx; compile to JS if image size matters.
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build:web

ENV HOST=0.0.0.0 PORT=3000
EXPOSE 3000
# Apply pending migrations, then start the server.
CMD ["sh", "-c", "node scripts/migrate.mjs && node --import tsx server/index.ts"]
