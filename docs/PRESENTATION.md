# 10-minute final presentation

1. **Problem and demo (1 min):** teams overwrite each other's work and lose context across tools. Show the shared workspace and open a second browser.
2. **Product flow (1 min):** create an account, open a page, write, comment, and save a snapshot.
3. **Architecture (2 min):** describe React/TipTap, Yjs CRDT and awareness, the authenticated WebSocket gateway, Express/Prisma/PostgreSQL, and Redis Pub/Sub fan-out. Show `ARCHITECTURE.md`.
4. **Conflict resolution (1 min):** have two people type at once. Explain causal updates, state vectors, deterministic convergence, and why presence is ephemeral.
5. **Security and data model (1 min):** password hashes, JWT, workspace membership checks, WebSocket edit authorization, relational comments/history, binary CRDT storage.
6. **Challenges and decisions (1 min):** align stable Yjs client/server versions; distinguish durable document state from transient awareness; handle Redis unavailable mode.
7. **Results (1 min):** show completed acceptance rows and measured latency/client count only after running `TEST-PLAN.md`.
8. **Limitations and next steps (1 min):** Next.js framework migration, invitation/role-management UI, viewer-safe websocket protocol, snapshot browsing/restoration, deployment hardening and load tests.
9. **Individual ownership/reflection (1 min):** each intern describes one owned feature, a technical lesson, and one change they would make next.

## Individual reflection prompt

Each intern writes a short first-person note: What did I own? What part of Yjs or full-stack delivery did I learn? What was the hardest bug and how did I verify the fix? What would I improve next? Do not submit one shared reflection for the team.
