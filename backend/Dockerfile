FROM node:22-alpine

WORKDIR /app

# npm install (não npm ci): o package-lock atual tem inconsistências de
# transitivos que o npm ci rejeita. O install é tolerante e mantém o
# comportamento de build já validado em produção. (TODO: regenerar o lock
# limpo e migrar para `npm ci` para builds 100% reproduzíveis.)
COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# Roda como usuário não-root (a imagem node:alpine já traz o usuário 'node').
USER node

EXPOSE 3001

# migrate deploy no start cobre o cenário single-instance deste projeto.
# Em multi-réplica, mover para um job/initContainer dedicado evita corrida.
# Binário local do prisma (em vez de npx) é mais determinístico sob não-root.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node dist/src/main"]
