# API and data contract

Base URL: `http://localhost:5000`. Authenticated requests send `Authorization: Bearer <JWT>`. JSON errors have a `message` field. JWTs expire after seven days.

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/health` | public | API liveness |
| POST | `/register` | public | Create user, default workspace/pages; returns token and user |
| POST | `/login` | public | Authenticate by username or email; returns token and user |
| GET | `/api/workspaces` | signed in | List workspaces and pages for current user |
| POST | `/api/workspaces` | signed in | Create a workspace |
| POST | `/api/workspaces/:id/members` | workspace owner | Add or role-update an existing user by email (`email`, `role`) |
| POST | `/api/workspaces/:workspace/pages` | workspace editor/owner | Create a page |
| PATCH | `/api/pages/:id` | page editor/owner | Rename a page (`title`) |
| GET | `/api/pages/:id/comments` | page member | List comments oldest first |
| POST | `/api/pages/:id/comments` | comment/editor/owner | Add comment (`body`, max 5000 chars) |
| GET | `/api/pages/:id/snapshots` | page member | List version snapshots newest first |
| POST | `/api/pages/:id/snapshots` | page editor/owner | Save a named binary Yjs state checkpoint |

Registration body: `{ "username": "sam", "email": "sam@example.com", "password": "at-least-8-chars" }`.

Login body: `{ "username": "sam", "password": "at-least-8-chars" }`. `username` accepts the account email too.

Page creation body: `{ "title": "Planning notes", "id": "optional-client-page-id" }`.

Comment body: `{ "body": "Let's review this paragraph." }`.

Snapshot body: `{ "label": "Before launch" }`.

## Permission behavior

Membership roles are `view`, `comment`, and `edit`; owners have `owner`. All members can connect to the Yjs room for awareness and sync; the gateway filters document update messages for `view` and `comment` users. REST comment creation requires `comment`, `edit`, or `owner`; reading a page's comments/history requires membership. Unauthenticated users are rejected. The member endpoint adds an existing registered user directly; pending email invitations are not implemented.

## Database entities

`User` owns workspaces and authors comments/snapshots. `Workspace` has an owner and memberships. `Page` belongs to one workspace. `Comment` and `Snapshot` belong to a page and author. `YDocument` stores the encoded Yjs update for a page; it is not parsed into editor JSON by the API.
