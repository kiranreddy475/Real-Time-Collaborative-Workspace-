# CollabSpace

Real-time collaborative workspace demo: shared pages, Yjs CRDT editing, cursor presence, comments, version snapshots, role-aware APIs, PostgreSQL persistence, and a Redis pub/sub bridge for multiple WebSocket instances.

## What is implemented

- Username/email registration and login with bcrypt password hashing and JWT sessions.
- PostgreSQL data model managed with Prisma: users, workspaces, memberships, pages, comments, snapshots, and binary Yjs document states.
- TipTap rich-text editor backed by Yjs. Concurrent edits merge, and the Yjs awareness protocol shows participant cursors/presence.
- Authenticated WebSocket connections; only page owners and edit-role members can connect to an editing room.
- PostgreSQL persistence of Yjs state (debounced) across realtime server restarts.
- Redis Pub/Sub forwards document and awareness updates between WebSocket processes sharing the same Redis instance.
- Comments and named snapshots have authenticated endpoints. Snapshot records include the page's current Yjs state.
- A responsive workspace UI with page navigation, editor toolbar, comments, history, collaborators, access controls, and a share dialog.

The frontend uses Next.js App Router with React and TipTap.

## Run locally

Requirements: Node.js 20+, npm, Docker Desktop (or local PostgreSQL 16 and Redis 7).

1. Start PostgreSQL and Redis:

   ```sh
   docker compose up -d postgres redis
   ```

2. Copy `backend/.env.example` to `backend/.env`. Replace `JWT_SECRET` with a long random value outside local development.

3. Install and prepare the database:

   ```sh
   npm install --prefix backend
   npm install --prefix frontend
   npm run db:generate
   npm run db:migrate
   ```

4. Start three terminals from the repository root:

   ```sh
   npm run api
   npm run realtime
   npm run dev
   ```

5. Open <http://localhost:3000>, create an account, then create a second account in another browser or private window. Add the second account by email from Share, then open the same page in both sessions to compare collaboration.

The REST API is on port 5000; the Yjs WebSocket service is on port 1234 and verifies JWTs and page membership. `REDIS_URL` enables the cross-instance update bridge. Start a second realtime process on a different `WS_PORT` with the same database, secret, and Redis to exercise cross-instance sync. Configure the browser with `NEXT_PUBLIC_WS_URL=ws://localhost:1234` if needed.

## Demo and test checklist

See [docs/TEST-PLAN.md](docs/TEST-PLAN.md) for the multi-browser acceptance run, load check plan, and result table. Do not mark a scenario as passed until you have run it against live PostgreSQL and Redis.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/API.md](docs/API.md), and [docs/PRESENTATION.md](docs/PRESENTATION.md) for the architecture, route contract, and ten-minute presentation outline.

Local checks completed: Next.js production build, ESLint, Prisma client generation/schema validation, backend syntax, API health, and unauthenticated WebSocket rejection. PostgreSQL migrations and multi-browser/Redis acceptance still need to be run after starting the services; results are recorded in `docs/TEST-PLAN.md`.

## Security and known scope

- Local defaults in `.env.example` are for development only. Set a private JWT secret, strict `CLIENT_ORIGIN`, TLS, rate limiting, and production secret management before deployment.
- The workspace owner can add an existing registered account from Share and choose view, comment, or edit access. Pending invitations by email and a dedicated member-management screen are not implemented.
- Snapshots capture a binary Yjs state. A version browser/restore workflow is not implemented; CRDT state restoration requires a designed branching or replacement strategy.
- No load-test numbers are fabricated. The test plan records measured results when run.
