# Nexus: WebSocket tmux Bridge + AI Terminal Panel

[![Node.js](https://img.shields.io/badge/Node.js-v20-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)

**Nexus** bridges tmux sessions to web via WebSocket + node-pty. Features: React terminal (xterm.js), configurable toolbar, task panel (Claude SSE), PWA install, multi-session mgmt, Telegram bot integration.

See [docs/NORTH-STAR.md](docs/NORTH-STAR.md), [PRD.md](docs/PRD.md), [ROADMAP.md](docs/ROADMAP.md).

## Quick Start (WSL2/Host)

1. Clone: `git clone <repo> nexus &amp;&amp; cd nexus`
2. Env: `cp .env.example .env`
   - Edit `.env`: Set `JWT_SECRET` (openssl rand -hex 32), `ACC_PASSWORD_HASH` (bcrypt hash your pass), `TMUX_SESSION=main`, `WORKSPACE_ROOT=/home/librae`
3. Backend: `npm i &amp;&amp; npm start` (PM2: `npm i -g pm2; pm2 start ecosystem.config.cjs`)
4. Frontend: `cd frontend &amp;&amp; npm i &amp;&amp; npm run build`
5. Open: http://localhost:59000
6. Login → Attach tmux session → Terminal/Toolbar ready.

**Build once**: `npm run build` (frontend auto on dev).

## Dev
- `npm run dev` (backend watch)
- `cd frontend &amp;&amp; npm run dev`
- Tmux: `tmux new -s main`

## Architecture
[ARCHITECTURE.md](docs/ARCHITECTURE.md)

## License
MIT
