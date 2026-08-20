# Letter, Sealed

> Write a little something. Seal it for later. Open it one turn at a time.

Letter, Sealed is a responsive web app for writing private time-capsule letters to someone else or to your future self. A letter is composed on lined paper, sealed until a chosen date, and eventually revealed through a tactile typewriter interaction: the reader turns the side crank to slowly bring the paper upward.

The interface is intentionally designed as two related experiences. On desktop, the paper and sealing controls sit side by side. On mobile, the paper becomes the primary vertical canvas and the controls move below it, while the reveal interaction keeps the crank large enough for touch.

## Current experience

The current visual prototype includes a lined letter-paper composer, layered paper and clip details, a subtle browser-generated pencil-writing sound while typing, an original illustrated SVG doodle icon system, recipient and date controls, a seal action, and a responsive typewriter reveal preview. The attached visual references informed the mood—paper texture, postal details, warm color, and hand-drawn marks—but the interface artwork is original and does not reproduce those illustrations.

## Important HTML detail

This repository does contain HTML. The browser entry point is [`client/index.html`](client/index.html), not a root-level `index.html`. Vite serves that file during development and uses it as the HTML entry during the production build. The HTML mounts the React application into `<div id="root"></div>` and loads [`client/src/main.tsx`](client/src/main.tsx) as a module.

> You generally should not open `client/index.html` directly with a file URL. Run the Vite/Express development server or build the project first so module resolution, environment variables, routing, and server behavior work correctly.

## Technology

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| UI | Custom responsive CSS, inline SVG doodle icons, Lucide-compatible project dependencies |
| Backend | Express and tRPC |
| Database layer | Drizzle ORM with MySQL/TiDB-compatible configuration |
| Authentication | Manus OAuth scaffold |
| Testing | Vitest and TypeScript compiler checks |
| Package manager | pnpm |

The project follows a tRPC-first full-stack structure: frontend procedures are typed from the server router, database access belongs in server helpers, and schema changes belong in the Drizzle files. The project scaffold also includes authentication, storage, analytics, and server runtime configuration.

## Repository structure

```text
letter-sealed/
├── client/
│   ├── index.html              # Vite HTML entry point
│   └── src/
│       ├── components/         # Shared UI and scaffold components
│       ├── contexts/           # React contexts
│       ├── hooks/              # Reusable client hooks
│       ├── lib/trpc.ts         # Typed tRPC client
│       ├── pages/Home.tsx      # Letter composer and typewriter reveal UI
│       ├── App.tsx             # Route and provider shell
│       ├── main.tsx            # React bootstrap
│       └── index.css           # Global visual system and responsive styles
├── drizzle/
│   ├── schema.ts               # Database schema
│   └── *.sql                   # Generated migrations
├── server/
│   ├── _core/                  # Runtime and authentication infrastructure
│   ├── db.ts                   # Database connection and query helpers
│   ├── routers.ts              # tRPC procedures
│   └── *.test.ts               # Vitest tests
├── shared/
│   ├── letter.ts               # Shared reveal behavior helpers
│   └── types.ts                # Shared application types
├── package.json
└── README.md
```

## Prerequisites

Install Node.js 20 or newer and pnpm. Then clone the repository and enter the project directory.

```bash
git clone https://github.com/YOUR-USERNAME/letter-sealed.git
cd letter-sealed
pnpm install
```

The repository is configured for a full-stack runtime. The frontend can be previewed through the project’s managed environment, while a self-hosted deployment requires the server environment variables described below.

## Environment variables

Do not commit secrets to GitHub. Create a local environment file only when your deployment environment does not inject these values automatically.

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Database connection string for Drizzle/MySQL or TiDB |
| `JWT_SECRET` | Session-cookie signing secret |
| `VITE_APP_ID` | OAuth application identifier |
| `OAUTH_SERVER_URL` | OAuth backend URL |
| `VITE_OAUTH_PORTAL_URL` | Frontend OAuth login portal |
| `BUILT_IN_FORGE_API_URL` | Server-side platform API endpoint |
| `BUILT_IN_FORGE_API_KEY` | Server-side platform API credential |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend platform API endpoint, when used |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend platform API credential, when used |
| `VITE_ANALYTICS_ENDPOINT` | Optional analytics endpoint |
| `VITE_ANALYTICS_WEBSITE_ID` | Optional analytics site identifier |

For local development, use placeholder values only for features you are not exercising. Database, authentication, and production sharing require valid values supplied by the deployment environment.

## Development

Start the full development server with:

```bash
pnpm dev
```

Then open the local URL printed by the server. The development runtime serves the HTML entry point, compiles the React client, and runs the Express/tRPC server together. Changes under `client/src` are hot-reloaded.

## Quality checks

Run the TypeScript compiler and Vitest suite before opening a pull request:

```bash
pnpm check
pnpm test
```

The current tests cover the authentication logout behavior and the typewriter reveal progress rules. Browser screenshots are useful for visual verification, but they do not replace unit tests.

## Production build

Create a production client bundle and server bundle with:

```bash
pnpm build
```

The build performs two steps. First, Vite creates the browser assets from `client/index.html` and the React source. Second, esbuild bundles the server entry point into `dist/index.js`. Start the resulting build with:

```bash
pnpm start
```

The server must read its port from the hosting environment. Do not hardcode a production port in application code.

## Deployment options

### Managed Manus hosting

For the managed project, save a checkpoint and use the project’s **Publish** action. The managed runtime supplies the project metadata, environment variables, server process, and deployment configuration. This is the simplest option for the current scaffold.

### Self-hosted Node deployment

A Node-compatible host can deploy the repository using the following sequence:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
pnpm start
```

Configure all required environment variables in the host’s secret manager. The host must support a long-running Node process, the configured database, HTTPS, and WebSocket or HTTP behavior required by the runtime. If using a reverse proxy, forward requests to the Node process and preserve the original protocol headers.

### Static-only hosting

This project is **not currently a static-only site**. A static host can serve the Vite-generated client assets only after the application is converted to a frontend-only architecture. The current project includes Express, tRPC, authentication, database configuration, and server procedures, so deploying only a copied HTML file would omit required behavior.

## Product roadmap

The next implementation stage should replace the current preview state with persisted letters. A letter model should store the encrypted or protected message, recipient details, unlock date, share token, creator, and first-open timestamp. The recipient route should validate the unlock date on the server, expose the letter only after it is available, and record the first opening without exposing the message in client source or public HTML before that time.

A later refinement can add custom recorded pencil, roller, and paper sounds, a mute preference persisted per device, a proper share-link delivery flow, and a full collection view for letters that have been sealed or opened.

