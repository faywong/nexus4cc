# Nexus: WebSocket tmux Bridge + AI Terminal Panel (Nexus: WebSocket tmux 桥 + AI 终端面板)

[![Node.js](https://img.shields.io/badge/Node.js-v20-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)

**Nexus** bridges tmux sessions to web via WebSocket + node-pty. Features: React terminal (xterm.js), configurable toolbar, task panel (Claude SSE), PWA install, multi-session mgmt, Telegram bot integration.

## English / 英文

See [NORTH-STAR.md](docs/NORTH-STAR.md), [PRD.md](docs/PRD.md) (complete), [ROADMAP.md](docs/ROADMAP.md) (post-v1).

## 中文

参见 [NORTH-STAR.md](docs/NORTH-STAR.md)、[PRD.md](docs/PRD.md)（已完成）、[ROADMAP.md](docs/ROADMAP.md)（v2+）。

## Quick Start / 快速启动 (WSL2/Linux Host)

### English
1. Clone: `git clone <repo> nexus && cd nexus`
2. Env: `cp .env.example .env`
   - Edit `.env`: `JWT_SECRET` (openssl rand -hex 32), `ACC_PASSWORD_HASH` (node -e "require('bcrypt').hashSync('pass',12)"), `TMUX_SESSION=main`, `WORKSPACE_ROOT=/workspace`
3. Backend: `npm i && npm start` (PM2: `npm i -g pm2; pm2 start ecosystem.config.cjs`)
4. Frontend: `cd frontend && npm i && npm run build`
5. Open: http://localhost:59000
6. Login → Attach tmux → Ready.

**Production**: `npm run build && pm2 restart nexus`

### 中文
1. 克隆: `git clone <repo> nexus && cd nexus`
2. 配置: `cp .env.example .env`
   - 编辑 `.env`: `JWT_SECRET` (openssl rand -hex 32), `ACC_PASSWORD_HASH` (bcrypt hash), `WORKSPACE_ROOT=/workspace`
3. 后端: `npm i && npm start`
4. 前端: `cd frontend && npm i && npm run build`
5. 打开: http://localhost:59000
6. 登录 → 连接 tmux → 使用。

## Dev
- `npm run dev` (backend watch)
- `cd frontend &amp;&amp; npm run dev`
- Tmux: `tmux new -s main`

## Features / 功能

- WebSocket tmux bridge (multi-window PTY)
- xterm.js terminal + mobile touch (swipe tabs, pinch zoom)
- Configurable toolbar (server-persisted)
- Task panel (Claude SSE streaming)
- Multi-session management
- File upload (drag/paste)
- Telegram bot integration
- PWA + dark/light theme
- Running task badges/notifications

## Architecture / 架构
See [ARCHITECTURE.md](docs/ARCHITECTURE.md)

## License / 许可
MIT — [LICENSE.md](LICENSE.md)
