# Event Feedback Hub

### Live: https://event-feedback-hub-client.vercel.app

### Technologies

React + Next.js (client), GraphQL (Apollo) + Prisma (server), Postgres (Docker), Turborepo, shadcn/ui. Realtime via GraphQL subscriptions via websocket.

### Features

- Create users, events, and feedback
- Server side Filter by event and minimum rating
- Live updates (GraphQL subscriptions via webhook)
- Server side pagination
- Simulated feedback stream with adjustable interval + jitter
- Dark Mode!

### Dev setup

**_Prereqs:_** Node 18+, pnpm, Docker running

_From the repo root:_

```
git clone https://github.com/AlexanderFeijoo/event-feedback-hub.git
cd event-feedback-hub
cp server/.env.example server/.env
cp client/.env.example client/.env
pnpm run setup:dev
turbo dev
```

**_Client_**: http://localhost:3000

**_API_** (HTTP & WS): http://localhost:4000/graphql

##### Dev Notes

If Postgres isn’t up,

```
cd apps/server
docker compose up -d
pnpm run generate
pnpm run migrate:dev
```

**_Graphql Code Gen / Types_**:

```
cd apps/client
pnpm run codegen
```

### Hosting

**_Frontend (Vercel):_** auto-deploys from main. Uses `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`.

**_Backend (Fly.io):_** Managed deployments with `flyctl` controlled by `fly.toml`

### Roadmap / Potential Improvements

- Mobile UI enhancements
- View for Events and Users management
- Full CRUD implementation (delete and update for feedbacks, Users, Events)
- Real user auth. Currently, user selection is simulated, want to tie to real auth
- Some quality of life re-factoring. The graphql schema files can be seperated out into their own files for clarity. On the client, the feedback-table has become quite large and a good candidate for re-factor.
- Add codegen and database seeding to deploy build and local dev install steps
- CI/CD pipelines for linting, smoke tests for both FE and BE
- Fix the initial DB seed script - since moving to direct connection for migrations on the BE, local seeding doesnt work. For now just turn on the feedback stream to seed events, users, and feedback.
