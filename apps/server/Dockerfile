FROM node:20-alpine

WORKDIR /app


COPY package.json pnpm-lock.yaml ./
COPY server/package.json server/

RUN corepack enable && corepack prepare pnpm@9.7.0 --activate
RUN pnpm i --frozen-lockfile --filter ./server...

COPY . .
WORKDIR /app/server

RUN pnpm prisma generate

RUN pnpm build || true

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

CMD ["pnpm","start"]