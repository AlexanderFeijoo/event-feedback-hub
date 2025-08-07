# apps/api/Dockerfile
FROM node:20

WORKDIR /app
COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --filter api...

CMD ["pnpm", "--filter", "api", "dev"]