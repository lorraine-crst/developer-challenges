# Dynamox Full-Stack Challenge: DynaPredict

Machine and monitoring point management platform, with sensor time-series data, trend forecasting, and a real-time dashboard. Built for the Dynamox full-stack technical challenge.

## Live deploy

- **Web app:** https://developer-challenges-pink.vercel.app
- **API:** https://dynamox-api.onrender.com

## Test credentials

```
Email:    avaliador@dynamox.com
Password: dynamox2026
```

No user registration. See "Assumptions", item 8.

## Tech stack

**Back-end:** Node.js + Express + TypeScript (strict) + Prisma + PostgreSQL (Neon) + Zod for validation + JWT for authentication.

**Front-end:** React 18 + TypeScript + Vite + Redux Toolkit + Material UI 5 + MUI X-DataGrid + React Router + Recharts for charts.

**Testing:** Vitest + Testing Library (unit, back and front), Cypress (e2e), autocannon (load test).

## Project structure

```
full-stack-challenge/
  apps/api          REST API (Express + Prisma + PostgreSQL)
  apps/web           React application (Vite)
  packages/types      TypeScript types shared between api and web
```

Monorepo with npm workspaces (no Nx, see "Bonus features not implemented").

## How it works

```
Browser (React + Vite)
        │
        │  POST /auth/login
        ▼
API (Express + JWT)  ──▶  PostgreSQL (Prisma)
        │
        │  authenticated requests
        │  (machines, monitoring points, sensors, readings)
        ▼
charts and forecast (Recharts)
```

## Running locally

### Prerequisites

- Node.js 20 or higher
- A PostgreSQL instance (recommended: [Neon](https://neon.tech), free tier)

### 1. Install dependencies

From the monorepo root (`full-stack-challenge/`):

```bash
npm install
```

### 2. Set up environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

Edit `apps/api/.env` with your own PostgreSQL connection string (`DATABASE_URL` and `DIRECT_URL`), a `JWT_SECRET` (any random string with 32+ characters, e.g. `openssl rand -hex 32`), and the test user data (`SEED_USER_NAME`, `SEED_USER_EMAIL`, `SEED_USER_PASSWORD`).

### 3. Run migrations and seed the database

```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed
```

The seed creates: 1 test user, 4 machines, 8 monitoring points, 7 sensors, and the time-series readings from Dynamox's real dataset (`response-challenge-v2.json`, provided in the challenge's own repository).

### 4. Run the application

From the monorepo root:

```bash
npm run dev
```

- API: http://localhost:3333
- Web: http://localhost:5173

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts API and web together, in development mode |
| `npm test` | Runs api and web unit tests |
| `npm run build` | Production build of api and web |
| `npm run load-test` (inside `apps/api`) | Runs the autocannon load test |
| `npx cypress open` (inside `apps/web`) | Opens Cypress in interactive mode |
| `npx cypress run` (inside `apps/web`) | Runs the full e2e suite in headless mode |

## Features

- **Authentication:** login with fixed email and password, JWT, protected private routes, logout.
- **Security:** rate limiting on the login endpoint (blocks after 10 failed attempts in 5 minutes, to prevent brute force) and security response headers with helmet.
- **Machines:** list, create, edit and delete (`Pump` and `Fan` types), with unique names.
- **Monitoring points:** list, create, edit and delete, linked to a machine, with names unique inside the same machine.
- **Sensors:** add a sensor (`TcAg`, `TcAs` or `HF+`) to a monitoring point. `TcAg` and `TcAs` sensors are not allowed on `Pump` machines, checked both when the sensor is added and when the machine type changes.
- **Time series:** chart view (Recharts) for each monitoring point, with series selection (temperature, velocity RMS, acceleration RMS) and metrics (min, max, average, count).
- **Dashboard:** machine and point summary, machines-by-type chart, average temperature by machine type, and a live latency widget.
- **Internationalization (pt/en):** the whole interface, including API error messages, is translated. The chosen language is saved in the browser.

## Bonus features implemented

1. **Time-series forecast** (item 8.5): simple linear regression over each monitoring point's past data, showing a 7-day projection. Shown in its own chart, separate from the historical one, on the point's detail page.
2. **E2e tests with Cypress** (item 8.2): a full flow test (`apps/web/cypress/e2e/full-flow.cy.ts`): blocked private route without login, login, create machine, create monitoring point, add sensor, edit point, delete point, delete machine, logout. 139 steps, no mocks (uses the real API), and can run again and again with no side effects.
3. **Load tests** (item 8.7): autocannon script (`apps/api/scripts/load-test.ts`) that tests the most-used endpoints with many requests at the same time. Results in the "Performance evidence" section below.
4. **Real deploy** (item 8.4): the application is live in production (Render + Vercel + Neon), not just steps on how to deploy it.

### Bonus features not implemented (conscious decision)

- **Nx** (item 8.1): we chose a simple monorepo with npm workspaces instead. For this project's size (2 apps + 1 shared package), Nx would add setup complexity without a real benefit.
- **Load balancer** (item 8.6): we chose to focus on the fundamentals first (full integration, correct tests, clear documentation) given the time we had, instead of adding more bonus items.
- **Baseline code refactor** (item 8.3): does not apply. The challenge gives no baseline code; the project was built from scratch.

## Tests

- **Unit and integration (back-end):** Vitest, covering services (machines, monitoring points, sensors, authentication) and one authentication integration test against the real database.
- **Unit (front-end):** Vitest + Testing Library, covering Redux reducers, extracted business rules (sensor compatibility, time-series forecast) and components with real interaction (`LoginPage`, `ConfirmDialog`).
- **E2e:** Cypress, full flow described above.

Run: `npm test` (unit tests) from the root, or `npx cypress run` (inside `apps/web`) for e2e.

## Performance evidence

Requirement: latency under 350ms. The API sends an `X-Response-Time` header on every response, also shown in the Dashboard's latency widget as the highlighted number.

**Single request** (`curl -w "%{time_total}"`, local server, 5 samples per endpoint):

| Endpoint | 1st call (cold) | Stable (warm) |
|---|---|---|
| `GET /auth/me` | 187ms | 15–20ms |
| `GET /monitoring-points` (paginated, 3-table join) | 313ms | 66–73ms |
| `GET /monitoring-points/:id/readings` (~180 points) | 134ms | 74–78ms |
| `GET /monitoring-points/:id/readings/metrics` | 118ms | 70–77ms |

Worst case measured: 313ms, still under the 350ms limit even on the first call.

**Concurrent load** (autocannon, 20 connections at the same time for 10s, `npm run load-test`):

| Endpoint | Req/s | Average latency | p99 |
|---|---|---|---|
| `GET /auth/me` | 896.4 | 21.8ms | 54ms |
| `GET /monitoring-points` (paginated, 3-table join) | 190.7 | 103.91ms | 195ms |

Even under constant load, the worst case (p99) stays well under 350ms. This is stronger proof than a single request, because it shows how the API behaves under stress.

**Note on the deployed app:** the numbers above were measured locally, with no network distance between client and server. On the live deploy, the API (Render) and the browser talk across a real network, so a visitor may see a higher total time in the browser. The Dashboard's latency widget shows both numbers side by side: the API's own processing time (what the 350ms requirement measures) and the full round-trip time (what the visitor actually feels).

## Database and hosting cold start warning

Both the database (Neon free tier) and the API (Render free tier) go to sleep after some time with no use. The first request after that, including login, can take longer than usual or return one error, before they wake up. This is not a bug: the next request already works fine. If this happens while testing the deployed app, just try again.

## Assumptions

The challenge statement leaves some decisions open. Here is what was assumed, and why:

1. **React pinned to version 18.** The challenge requires Material UI 5, which officially supports only React 17 and 18. Vite's scaffold brought React 19; we downgraded to 18 instead of forcing `--legacy-peer-deps`.
2. **Pull request destination.** The challenge statement (line 128) mentions `dynamox-s-a/js-ts-full-stack-test`, a different repository from the one that gets forked. Since GitHub only allows a pull request against the fork's origin repository, this PR was opened against `dynamox-s-a/developer-challenges`, branch `main`.
3. **Real time-series data.** The seed loads the `response-challenge-v2.json` dataset from Dynamox's own repository (7 series, 181 points each, November to December 2023), instead of using random data.
4. **Two Neon connection strings.** Pooled (`DATABASE_URL`) for the application, direct (`DIRECT_URL`) for migrations. This follows Prisma's own recommendation for serverless Postgres.
5. **Credentials documented in this README.** `.env.example` only has placeholder text. The real test values are here, since the requirement asks for login with fixed credentials that the evaluator can use.
6. **One sensor per monitoring point.** The challenge talks about "adding a sensor to a point" in the singular. Modeled as a one-to-one relation.
7. **Cascading delete.** Deleting a machine also deletes its points, sensors and readings. Without this, the delete would fail because of database constraints.
8. **No new user registration.** The requirement asks for login with "fixed email and password" and never mentions registration. The user is created by the seed, with a bcrypt-hashed password.
9. **`serialNumber` kept separate from the sensor's `id`.** The unique code the user types in should not be the database primary key. Changing it later would need updates in every related table.
10. **Arbitrary names don't mean duplicates are allowed.** Machine names are unique across the whole app; monitoring point names are unique inside the same machine (two different machines can have points with the same name). Checked against the official seed, which has no duplicates.
11. **JWT token in `localStorage`, not an `httpOnly` cookie.** Simpler for this challenge and it survives a page reload. Token access lives in a single file (`apps/web/src/lib/api.ts`), so switching to an `httpOnly` cookie later would only change that one file.

---

Dynamox Full-Stack Challenge, built by [Lorraine Cristina](https://github.com/lorraine-crst), 2026.