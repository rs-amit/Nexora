# Nexora

A real-time collaborative whiteboard for teams — sketch, diagram, and design system architecture together, live, in the same room.

## Features

- **Freeform drawing** — pencil, eraser, lines, arrows, rectangles, circles, diamonds, triangles.
- **Sticky notes** and **inline text** editing.
- **ER-diagram tables** — database-style table nodes (columns, types, primary/foreign key flags) connected by relationship lines with crow's-foot cardinality notation, similar to Eraser.io/dbdiagram.io.
- **Smart connectors** — arrows that snap onto shapes and keep following them if they're moved, instead of staying fixed in place.
- **Laser pointer** for presenting, with a fading trail.
- **Zoom, pan, and scroll** around the board.
- **Real-time multi-user sync** — every stroke, shape, and edit is broadcast live to everyone in the room and persisted, so refreshing or joining late doesn't lose anything.
- **Live cursors and presence** — see where everyone else is pointing and what they're dragging.
- **Room chat** alongside the board.

## Architecture

This is a monorepo: one frontend, six backend microservices behind an API gateway.

```
Nexora/
├── Frontend/                # React + TypeScript + Vite SPA
└── Backend/
    ├── api-getway/          # Reverse proxy — routes /api/* to the right service, verifies JWTs
    ├── auth-service-v1/     # Signup/login, issues access + refresh tokens
    ├── room-service/        # Legacy/instant-meeting room creation
    ├── workspace-service/   # Workspaces, rooms, and membership (source of truth for room data)
    ├── chat-service/        # Room chat, over REST + socket.io
    └── sketch-service/      # Whiteboard shape persistence + real-time sync, over REST + socket.io
```

**How a request flows**: the frontend talks to the gateway for regular REST calls (auth, room/workspace management), which verifies the caller's JWT and forwards the request with the resolved `x-user-id`. The two services with real-time needs — `chat-service` and `sketch-service` — are connected to **directly** from the browser via `socket.io` (persistent WebSocket connections don't fit the gateway's plain HTTP proxy), each independently verifying the JWT on connection.

`workspace-service` trusts an `x-user-id` header with no signature verification of its own — by design, since only the gateway is expected to set it after verifying the JWT. It should never be given a public-facing URL in production.

## Tech stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, `socket.io-client`
- **Backend**: Node.js, Express, MongoDB/Mongoose, `socket.io`, JWT auth
- **Realtime whiteboard**: a hand-rolled `<canvas>` 2D renderer (no Fabric/Konva/tldraw) with a shared "shape" data model synced over sockets

## Local development

Each service needs its own `.env` (see the `.env.example` in every folder for the required keys) and its own `npm install`.

```bash
# One-time setup — repeat for each folder
cd Backend/api-getway && npm install && cp .env.example .env   # then fill in real values
cd Backend/auth-service-v1 && npm install && cp .env.example .env
cd Backend/room-service && npm install && cp .env.example .env
cd Backend/workspace-service && npm install && cp .env.example .env
cd Backend/chat-service && npm install && cp .env.example .env
cd Backend/sketch-service && npm install && cp .env.example .env
cd Frontend && npm install && cp .env.example .env
```

Then, in separate terminals:

```bash
cd Backend/api-getway && npm run dev        # :5000
cd Backend/auth-service-v1 && npm run dev   # :5001
cd Backend/room-service && npm run dev      # :5002
cd Backend/chat-service && npm run dev      # :5003
cd Backend/sketch-service && npm run dev    # :5004
cd Backend/workspace-service && npm run dev # :5005
cd Frontend && npm run dev                  # :5173
```

All 6 backend services share the same MongoDB connection and the same `JWT_ACCESS_SECRET` — that secret must be identical across every service (except `workspace-service`, which doesn't need it) since tokens issued by `auth-service-v1` are verified by the others.

## Deployment

- **Frontend → Vercel.** Root directory `Frontend`; `vercel.json` at the repo root handles SPA client-side routing.
- **Backend → Render.** `render.yaml` at the repo root is a Render Blueprint that defines all 6 services in one file — use Render's "New Blueprint" flow to deploy them together instead of configuring each by hand.

See each service's `.env.example` for exactly what needs to be configured on the host. A couple of things worth knowing before deploying:

- `chat-service` and `sketch-service` need real-time WebSocket connections that stay open — a serverless/edge platform (like Vercel) can't host these; they need a host that runs a persistent process (Render, Railway, a VPS, etc.).
- On free-tier hosts that spin down idle services, those same two services will have a cold-start delay on the first message/draw after a period of inactivity.
