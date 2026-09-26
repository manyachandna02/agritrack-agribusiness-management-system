# AgriTrack

<<<<<<< HEAD
AgriTrack is a MERN-stack farm management and decision-support system, built as a
4-week technical internship project. As of Week 3, the application is
**feature-complete**: Authentication/RBAC, Inventory, Crops, Production, Sales,
Reports & Analytics, and the What-If Business Simulator are all implemented and
integrated. Week 4 is deployment, production configuration, and documentation —
not new features.

## Features

**Completed (Week 2 + Week 3):**
- JWT authentication with bcrypt-hashed passwords
- Role-based access control (ADMIN, MANAGER, FARM_STAFF) enforced on the backend
- Inventory management with server-computed stock status (In Stock / Low Stock / Out of Stock)
- Crop management
- Production management, referencing Crop by MongoDB ObjectId
- **Sales management**, with safe, atomic inventory consumption when a sale is linked to an inventory item
- **Reports & Analytics**, computed from real MongoDB data (sales, production, inventory, crops, combined summary), with date-range filtering
- **What-If Business Simulator** — five read-only hypothetical scenarios that never modify real data
- React frontend covering every module: login, role-aware sidebar, protected routes, dashboard with charts
- Centralized backend error handling with consistent JSON error responses

**Planned (Week 4):**
- Deployment and production configuration
- User documentation, quick-start guide, troubleshooting guide
- Monitoring / maintenance documentation
- Automated test suite (the codebase is structured for this — see "Testing" below)

## Technology Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`
- **Frontend:** React 18, React Router v6, Axios, Recharts (charts on Dashboard/Reports/Simulator). Built with Create React App (`react-scripts`) — no Vite.
- **Language:** JavaScript throughout (CommonJS backend, JSX frontend). No TypeScript, no microservices, no Docker/Kubernetes/Kafka/Redis/GraphQL.
=======
AgriTrack is a MERN-stack farm management system built as a 4-week technical
internship project. It tracks inventory, crops, and production records behind
a role-based authentication layer.

This README documents the **Week 2 MVP**: Phases 1–6 (setup, auth/RBAC,
inventory, crop + production, frontend integration, and validation/error
handling).

## Week 2 Implemented Features

- JWT authentication with bcrypt-hashed passwords
- Role-based access control (ADMIN, MANAGER, FARM_STAFF) enforced on the backend
- Inventory CRUD with server-computed stock status
- Crop CRUD
- Production CRUD, referencing Crop by MongoDB ObjectId
- React frontend: login, role-aware sidebar, protected routes, basic dashboard
- Centralized backend error handling with consistent JSON error responses

## Technology Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `dotenv`
- **Frontend:** React 18, React Router v6, Axios (Create React App / `react-scripts` — no Vite)
- **Language:** JavaScript (CommonJS on the backend, ES modules/JSX on the frontend). No TypeScript.
>>>>>>> 51235edef0918591d089ddfb657255776aca0596

## Architecture

```
React (client/)
  ↓ Axios (client/src/services/api.js — attaches JWT, centralizes error handling)
Express REST API (server/server.js)
  ↓
Routes (server/routes/) → Middleware (auth, authorize, validateObjectId) → Controllers (server/controllers/)
<<<<<<< HEAD
  ↓                                                                              ↓
Mongoose Models (server/models/)                          server/services/analyticsService.js
  ↓                                                        (shared aggregation logic for
MongoDB                                                     Dashboard + Reports; reads only)
```

`server/utils/calculations.js` holds pure, dependency-free functions (`calculateTotalAmount`,
`calculateProjectedInventory`, `calculateProjectedRevenue`, `calculatePercentageChange`,
`calculateProjectedConsumption`) shared by Sales (real transactions) and the Simulator
(hypothetical projections) — this is what keeps the Simulator's math identical to the
real business rules without the Simulator ever importing a model.

## User Roles and Permissions

| Module / Action | ADMIN | MANAGER | FARM_STAFF |
|---|---|---|---|
| Login | Yes | Yes | Yes |
| Manage Users | Yes | No | No |
| View / Update Inventory | Yes (full) | Yes (full) | View + quantity-only update |
| Create / Delete Inventory | Yes | Yes | No |
| View Crops | Yes | Yes | Yes |
| Create/Update/Delete Crops | Yes | Yes | No |
| View / Create / Update Production | Yes | Yes | Yes |
| Delete Production | Yes | Yes | No |
| View Sales | Yes | Yes | Yes |
| Create / Update / Delete Sales | Yes | Yes | No |
| Reports & Analytics | Yes | Yes | No |
| What-If Simulator | Yes | Yes | No |

Enforced by `server/middleware/authorize.js` on every route. The frontend sidebar only
hides links a role can't use, for UX — it is never the security boundary.

## Modules

- **Authentication** — `server/models/User.js`, `controllers/authController.js`
- **Inventory** — `models/Inventory.js`, `controllers/inventoryController.js`
- **Crops** — `models/Crop.js`, `controllers/cropController.js`
- **Production** — `models/Production.js`, `controllers/productionController.js` (references Crop)
- **Sales** — `models/Sale.js`, `controllers/saleController.js` (references Crop and/or Inventory; see "Sales & Inventory Consistency" below)
- **Reports & Analytics** — `controllers/reportController.js` + `services/analyticsService.js`
- **What-If Simulator** — `controllers/simulatorController.js` (read-only; see "Simulator" below)
- **Dashboard** — `controllers/dashboardController.js` (aggregate KPIs + chart data, reusing `analyticsService`)
=======
  ↓
Mongoose Models (server/models/)
  ↓
MongoDB
```

No local arrays are used as the primary data store. Seed data (`server/seed/seedAdmin.js`)
exists only to bootstrap the first admin account.
>>>>>>> 51235edef0918591d089ddfb657255776aca0596

## Folder Structure

```
AgriTrack/
├── .env.example
├── .gitignore
├── README.md
├── server/
│   ├── .env                  # not committed — copy from .env.example
│   ├── server.js
<<<<<<< HEAD
│   ├── config/db.js
=======
│   ├── config/
│   │   └── db.js
>>>>>>> 51235edef0918591d089ddfb657255776aca0596
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── inventoryController.js
│   │   ├── cropController.js
│   │   ├── productionController.js
<<<<<<< HEAD
│   │   ├── saleController.js
│   │   ├── reportController.js
│   │   ├── simulatorController.js
│   │   └── dashboardController.js
│   ├── services/
│   │   └── analyticsService.js
=======
│   │   └── dashboardController.js
>>>>>>> 51235edef0918591d089ddfb657255776aca0596
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── authorize.js
│   │   ├── validateObjectId.js
│   │   └── errorHandler.js
│   ├── models/
<<<<<<< HEAD
│   │   ├── User.js / Inventory.js / Crop.js / Production.js / Sale.js
│   ├── routes/
│   │   ├── authRoutes.js / inventoryRoutes.js / cropRoutes.js / productionRoutes.js
│   │   ├── saleRoutes.js / reportRoutes.js / simulatorRoutes.js / dashboardRoutes.js
│   ├── seed/seedAdmin.js
│   └── utils/
│       ├── generateToken.js / asyncHandler.js / calculations.js
=======
│   │   ├── User.js
│   │   ├── Inventory.js
│   │   ├── Crop.js
│   │   └── Production.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── cropRoutes.js
│   │   ├── productionRoutes.js
│   │   └── dashboardRoutes.js
│   ├── seed/
│   │   └── seedAdmin.js
│   └── utils/
│       ├── generateToken.js
│       └── asyncHandler.js
>>>>>>> 51235edef0918591d089ddfb657255776aca0596
└── client/
    ├── .env.example
    ├── public/index.html
    └── src/
<<<<<<< HEAD
        ├── App.js / index.js / index.css
        ├── services/api.js
        ├── context/AuthContext.js
        ├── components/ (Sidebar, Layout, ProtectedRoute)
        └── pages/
            ├── Login.js / Register.js / Dashboard.js / Users.js
            ├── inventory/ / crops/ / production/ / sales/
            ├── reports/Reports.js
            └── simulator/Simulator.js
```

## Environment Variables
=======
        ├── App.js
        ├── index.js
        ├── index.css
        ├── services/api.js
        ├── context/AuthContext.js
        ├── components/ (Sidebar, Layout, ProtectedRoute)
        └── pages/ (Login, Register, Dashboard, Users, inventory/, crops/, production/)
```

## Installation

### Backend

```bash
cd server
npm install
cp ../.env.example .env
# edit server/.env with real values (see Environment Setup below)
```

### Frontend

```bash
cd client
npm install
cp .env.example .env
# edit client/.env if your backend isn't on the default URL/port
```

## Environment Setup
>>>>>>> 51235edef0918591d089ddfb657255776aca0596

`server/.env`:

```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/agritrack
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=8h
ADMIN_EMAIL=admin@agritrack.local
ADMIN_PASSWORD=ChangeMe123
```

`client/.env`:

```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

<<<<<<< HEAD
**Never commit real `.env` files.** `.gitignore` excludes `.env`, `.env.local`,
`node_modules/`, `dist/`, and `build/`. No new environment variables were introduced
in Week 3.

## Installation

```bash
# Backend
cd server
npm install
cp ../.env.example .env   # then fill in real values

# Frontend
cd client
npm install                # now also installs recharts
cp .env.example .env
```

## Running the Application

```bash
# Backend
cd server
npm run dev          # or: npm start

# Seed the first Admin (only needed once)
npm run seed:admin

# Frontend
cd client
npm start
=======
**Never commit real `.env` files.** `.gitignore` already excludes `.env`, `.env.local`,
`node_modules/`, `dist/`, and `build/`.

## How to Run

### Backend

```bash
cd server
npm run dev        # nodemon, auto-restarts on change
# or
npm start          # plain node
>>>>>>> 51235edef0918591d089ddfb657255776aca0596
```

Health check: `GET http://localhost:5000/api/health`

<<<<<<< HEAD
## API Overview

Week 2 endpoints (`/api/auth`, `/api/inventory`, `/api/crops`, `/api/production`,
`/api/dashboard/stats`) are unchanged. Week 3 adds:

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/sales` | Any authenticated | List sales |
| GET | `/api/sales/:id` | Any authenticated | View one sale |
| POST | `/api/sales` | ADMIN, MANAGER | Record a sale (decrements linked inventory atomically) |
| PUT | `/api/sales/:id` | ADMIN, MANAGER | Update a sale (adjusts inventory delta) |
| DELETE | `/api/sales/:id` | ADMIN, MANAGER | Delete a sale (restores linked inventory) |
| GET | `/api/reports/summary?from&to` | ADMIN, MANAGER | Combined business summary |
| GET | `/api/reports/sales?from&to` | ADMIN, MANAGER | Sales summary + by-product/by-date breakdown |
| GET | `/api/reports/production?from&to` | ADMIN, MANAGER | Production summary + by-crop/by-date breakdown |
| GET | `/api/reports/inventory` | ADMIN, MANAGER | Inventory summary, low/out-of-stock lists |
| GET | `/api/reports/crops` | ADMIN, MANAGER | Crop status breakdown + production by crop |
| POST | `/api/simulator/inventory-sale` | ADMIN, MANAGER | Scenario 1 (see below) |
| POST | `/api/simulator/price-change` | ADMIN, MANAGER | Scenario 2 |
| POST | `/api/simulator/demand-change` | ADMIN, MANAGER | Scenario 3 |
| POST | `/api/simulator/production-change` | ADMIN, MANAGER | Scenario 4 |
| POST | `/api/simulator/inventory-consumption` | ADMIN, MANAGER | Scenario 5 |

All error responses remain `{ "success": false, "message": "..." }` with the same
HTTP status conventions as Week 2 (400 validation, 401 auth, 403 forbidden, 404 not
found, 409 conflict, 500 server error). A report or simulator call with no matching
data returns `200` with an empty result and an explanatory `message` — never a 500.

### Sales & Inventory Consistency

A Sale may optionally reference an Inventory item. When it does, creating the Sale
**atomically decrements** that item's quantity using a single conditional MongoDB
update (`findOneAndUpdate` with a `quantity: { $gte: amount }` filter) — this
MongoDB instance is a standalone server, not a replica set, so multi-document
transactions aren't available, but a single-document conditional update is still
atomic and guarantees inventory can never go negative, even under concurrent
requests. If the Sale record itself then fails to save, the decrement is explicitly
rolled back. Updating or deleting a sale reverses its inventory effect the same way.
**Simulations never touch this path at all** — see below.

### What-If Simulator

The Simulator (`server/controllers/simulatorController.js`) computes five
hypothetical scenarios — inventory sale, price change, demand change, production
change, inventory consumption — using the same pure functions Sales uses
(`server/utils/calculations.js`), so the math is identical to what a real
transaction would produce. It is guaranteed read-only **structurally**: the
controller file contains no write calls (`.create`, `.save`, `.updateOne`,
`.findOneAndUpdate`, `.deleteOne`) on any model — the only database access is a
`findById` used to optionally pre-fill "current" values from a real Inventory item.
Every response returns Current Value / Hypothetical Change / Projected Value /
Difference / Warning, matching the frontend's results card. Access is restricted to
ADMIN and MANAGER.

### How Reports Calculate Real Data

Every number in `/api/reports/*` and the dashboard's chart data comes from
`server/services/analyticsService.js`, which queries MongoDB directly via
Mongoose `find`/`aggregate`/`countDocuments` — there are no hard-coded figures.
Dashboard and Reports both call the same service functions, so a number shown on
the Dashboard and the equivalent figure in Reports can never disagree due to
duplicated logic.

## Testing

The codebase is structured for testability, per the internship's Week 3 plan:

- Pure, deterministic calculation functions live in `server/utils/calculations.js`,
  independent of Express or Mongoose — these can be unit tested with plain input/output
  assertions (e.g. `calculateProjectedInventory(1200, 500) === 700`).
- Routes / controllers / models / middleware / services are all in separate files
  with a single responsibility each.
- No automated test suite has been added yet — Week 3 focused on features. Adding
  Jest (or similar) against the utilities and controllers above is Week 3/4 follow-up
  work, not blocked by anything in this structure.

## Future Improvements (Week 4+)

- Deployment (containerization or PaaS), production environment configuration
- User documentation and a quick-start guide
- Troubleshooting guide, monitoring/maintenance documentation
- Automated backend test suite and frontend component tests
- True multi-document transactions if/when MongoDB runs as a replica set
=======
### Seed the first Admin account

The register endpoint requires an ADMIN token, so the very first admin
account must be created via the seed script:

```bash
cd server
npm run seed:admin
```

Uses `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `server/.env`. Safe to re-run —
it does nothing if that email already exists.

### Frontend

```bash
cd client
npm start
```

Opens at `http://localhost:3000` (CRA default), talking to the API at
`REACT_APP_API_BASE_URL`.

## API Summary

### Authentication (`/api/auth`)

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Returns a JWT + user profile |
| POST | `/api/auth/register` | ADMIN | Creates a user with a given role |
| GET | `/api/auth/me` | Any authenticated user | Current user's profile |
| GET | `/api/auth/users` | ADMIN | List all users |

### User Roles and Permissions

| Role | Users | Inventory | Crops | Production |
|---|---|---|---|---|
| ADMIN | full | full | full | full |
| MANAGER | none | full | full | full |
| FARM_STAFF | none | view + quantity updates only | view only | view + create/update (no delete) |

Enforced by `server/middleware/authorize.js` on every route — the frontend
sidebar only hides links for UX; it is not the security boundary.

### Inventory (`/api/inventory`)

`GET /`, `GET /:id`, `POST /` (ADMIN/MANAGER), `PUT /:id` (ADMIN/MANAGER full;
FARM_STAFF quantity-only), `DELETE /:id` (ADMIN/MANAGER).

`status` (`In Stock` / `Low Stock` / `Out of Stock`) is always computed
server-side from `quantity` vs `minimumThreshold` — client-submitted status
values are ignored.

### Crops (`/api/crops`)

`GET /`, `GET /:id`, `POST /` (ADMIN/MANAGER), `PUT /:id` (ADMIN/MANAGER),
`DELETE /:id` (ADMIN/MANAGER). Everyone authenticated can view.

### Production (`/api/production`)

`GET /`, `GET /:id`, `POST /` (ADMIN/MANAGER/FARM_STAFF), `PUT /:id`
(ADMIN/MANAGER/FARM_STAFF), `DELETE /:id` (ADMIN/MANAGER). The `crop` field
must be a valid ObjectId referencing an existing Crop document — this is
checked before the record is saved.

### Dashboard (`/api/dashboard`)

`GET /stats` — returns `{ totalCrops, totalInventoryItems, lowStockItems, totalProductionRecords }`,
computed with `countDocuments()` against MongoDB.

### Error Response Shape

Every error response follows:

```json
{ "success": false, "message": "..." }
```

| Status | Meaning |
|---|---|
| 400 | Validation error / bad request / invalid ObjectId |
| 401 | Missing, invalid, or expired JWT; wrong credentials |
| 403 | Authenticated but not permitted for this action |
| 404 | Resource or route not found |
| 409 | Duplicate (e.g. email already registered) |
| 500 | Unexpected server error |

## Current Week 2 Scope

Implemented: auth/JWT/RBAC, inventory, crops, production, a basic dashboard,
and centralized validation/error handling, wired to a React frontend.

**Not implemented yet** (by design — see the code comments marked
"Coming in Week 3"): Sales, Reports & Analytics, the What-If Simulator,
production forecasting, automated testing, and deployment.

## Future Development

**Week 3:** Sales module, Reports & Analytics, What-If Simulator, testing and QA.

**Week 4:** Deployment, user documentation, monitoring, maintenance.
>>>>>>> 51235edef0918591d089ddfb657255776aca0596
