# AgriTrack

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

## Architecture

```
React (client/)
  ↓ Axios (client/src/services/api.js — attaches JWT, centralizes error handling)
Express REST API (server/server.js)
  ↓
Routes (server/routes/) → Middleware (auth, authorize, validateObjectId) → Controllers (server/controllers/)
  ↓
Mongoose Models (server/models/)
  ↓
MongoDB
```

No local arrays are used as the primary data store. Seed data (`server/seed/seedAdmin.js`)
exists only to bootstrap the first admin account.

## Folder Structure

```
AgriTrack/
├── .env.example
├── .gitignore
├── README.md
├── server/
│   ├── .env                  # not committed — copy from .env.example
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── inventoryController.js
│   │   ├── cropController.js
│   │   ├── productionController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── authorize.js
│   │   ├── validateObjectId.js
│   │   └── errorHandler.js
│   ├── models/
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
└── client/
    ├── .env.example
    ├── public/index.html
    └── src/
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

**Never commit real `.env` files.** `.gitignore` already excludes `.env`, `.env.local`,
`node_modules/`, `dist/`, and `build/`.

## How to Run

### Backend

```bash
cd server
npm run dev        # nodemon, auto-restarts on change
# or
npm start          # plain node
```

Health check: `GET http://localhost:5000/api/health`

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
