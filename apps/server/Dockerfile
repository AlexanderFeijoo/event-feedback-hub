FROM node:20-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY turbo.json .npmrc ./

COPY apps/server/package.json apps/server/

RUN corepack enable && corepack prepare pnpm@9.7.0 --activate

RUN pnpm install --frozen-lockfile --filter ./apps/server...

COPY . .

WORKDIR /app/apps/server
RUN pnpm prisma generate
RUN pnpm build || true

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["pnpm","start"]