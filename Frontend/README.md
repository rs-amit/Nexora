# Nexora — Frontend

React + TypeScript + Vite single-page app for the Nexora collaborative whiteboard. See the [repo root README](../README.md) for the full project overview, architecture, and deployment instructions.

## Local development

```bash
npm install
cp .env.example .env   # then fill in the real backend URLs
npm run dev             # http://localhost:5173
```

Requires the backend services (see `../Backend/`) to be running — at minimum `api-getway`, `auth-service-v1`, `workspace-service`, `chat-service`, and `sketch-service` for the app to be usable end-to-end.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) and build for production
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build locally
