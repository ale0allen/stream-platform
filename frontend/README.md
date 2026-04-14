# Stream Platform Frontend

React + TypeScript + Vite frontend for the local MVP stack.

## Required Environment Variables

Copy values from [.env.example](/C:/Users/ale_a/projeto/copiaStreamaker/stream-platform/frontend/.env.example) into a local `.env` file if you want to override defaults.

- `VITE_API_URL`
  Default: `http://localhost:8080/api`
  This is the configurable backend API base URL used by the frontend.

## Local Setup

1. Install Node.js 20+ and npm.
2. Make sure the backend is running on `http://localhost:8080` or update `VITE_API_URL`.
3. Start the frontend from the `frontend` directory:

```bash
npm install
npm run dev
```

The default local URL is:

- `http://localhost:5173`

## Build

```bash
npm run build
```

## Local Backend Integration

- Auth calls go to:
  - `/auth/register`
  - `/auth/login`
- Protected requests send `Authorization: Bearer <token>`
- JWT tokens are stored in `localStorage`
- The backend must allow the frontend origin through `FRONTEND_URLS`

## Recommended Local Pairing

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api`
