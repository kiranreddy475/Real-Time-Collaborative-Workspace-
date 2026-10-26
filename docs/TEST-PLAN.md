# Acceptance and measurement plan

## Checks completed in this workspace

| Check | Result |
|---|---|
| Next.js production build | Passed |
| ESLint | Passed |
| Prisma client generation and schema validation | Passed |
| Backend JavaScript syntax checks | Passed |
| API `GET /health` smoke check | Passed (`status: ok`) |
| Unauthenticated WebSocket upgrade | Passed (rejected with HTTP 403) |
| Browser login and registration screens | Rendered and visually checked |
| PostgreSQL migration and authenticated CRUD | Not run: PostgreSQL at `localhost:5432` was unavailable |
| Redis cross-instance and multi-browser sync | Not run: Docker/Redis was unavailable in this environment |

Use two separate browser profiles and two accounts. Keep the API, realtime service, PostgreSQL, and Redis running. Record date, versions, browser, and measured timings in the results table.

| Scenario | Expected result | Result |
|---|---|---|
| Register two users | Each account gets a workspace, pages, and a valid session | Not run in this workspace |
| Login/logout/refresh | Password validation works; session persists on refresh and clears on logout | Not run in this workspace |
| Concurrent text insert | Both browsers converge on the same text without losing either insert | Not run in this workspace |
| Concurrent edit at same position | Both replicas converge; no stale full-document replacement | Not run in this workspace |
| Cursor presence | User names/cursor colors appear while both browsers are in one page and disappear after disconnect | Not run in this workspace |
| Offline/reconnect | Provider reconnects and Yjs state converges after brief network interruption | Not run in this workspace |
| Comments/history | Comments persist; a snapshot appears with timestamp/author and captured Yjs binary state | Not run in this workspace |
| Unauthorized room | Missing/expired token and nonmember receive WebSocket 403 | Not run in this workspace |
| Cross-instance | Connect browsers to different WS ports; edits and cursors propagate via Redis | Not run in this workspace |
| Restart recovery | Restart realtime process; saved Yjs document content loads from PostgreSQL | Not run in this workspace |

## Suggested performance run

Use 10 browser clients editing separate paragraphs in one document for 60 seconds, then repeat at 25 and 50 clients if hardware permits. Capture p50/p95 update-to-peer latency, update message size, CPU/RAM per realtime process, and final document equality. For a simple manual measurement, timestamp a distinctive edit on browser A and record time until it appears on browser B; do at least 30 samples and report median and p95. Do not publish results until measured.

## Automated checks

Run `npm run build` and `npm run lint` for the frontend. Run Prisma schema validation/generation with `npm run db:generate`. The live sync, Redis bridge, PostgreSQL access control, and restart scenarios require services running and should be exercised using the acceptance table above.
