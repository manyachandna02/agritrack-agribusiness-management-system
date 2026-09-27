
# AgriTrack — Agribusiness Management & Decision Support System

AgriTrack is a MERN-stack web application designed to support agribusiness management through centralized management of users, crops, inventory, production, sales, reports, and business decision-support simulations.

The project is being developed as a **4-week technical internship project**.

As of **Week 3**, the core application is feature-complete. Week 4 focuses on deployment, production configuration, user documentation, troubleshooting, monitoring, and maintenance.

---

## Project Status

| Week | Status | Work Completed |
|------|--------|----------------|
| Week 1 | Completed | Project planning, requirements and system architecture |
| Week 2 | Completed | Authentication, RBAC, Inventory, Crops, Production and frontend foundation |
| Week 3 | Completed | Sales, Reports & Analytics, What-If Simulator, enhanced Dashboard and QA |
| Week 4 | Planned | Deployment, documentation, monitoring and maintenance |

---

## Features

### Authentication & Authorization

- JWT-based authentication
- Password hashing using bcrypt
- Role-Based Access Control (RBAC)
- Three user roles:
  - ADMIN
  - MANAGER
  - FARM_STAFF
- Protected API routes
- Protected frontend routes
- Role-aware navigation
- Admin-only user management

### Inventory Management

- Create, view, update and delete inventory items
- Quantity and minimum-stock threshold management
- Server-computed inventory status:
  - In Stock
  - Low Stock
  - Out of Stock
- Prevention of invalid negative quantities
- Inventory updates linked with sales

### Crop Management

- Create, view, update and delete crops
- Crop name and season management
- Area and date information
- Crop status tracking:
  - Planned
  - Growing
  - Harvested

### Production Management

- Create, view, update and delete production records
- Production linked to Crop records through MongoDB ObjectId
- Production quantity tracking
- Production date
- Quality classification
- Farm/location information

### Sales Management

- Create, view, update and delete sales
- Customer and product information
- Quantity and price tracking
- Automatic total amount calculation
- Optional link between a sale and an inventory item
- Inventory quantity reduction when a sale is linked to inventory
- Prevention of inventory from becoming negative
- Inventory restoration when applicable during sale deletion or update

### Reports & Analytics

Reports are generated using real MongoDB data.

Available reports include:

- Combined business summary
- Sales report
- Production report
- Inventory report
- Crop report
- Sales breakdown by date
- Sales breakdown by product
- Production breakdown by date
- Production breakdown by crop
- Low-stock inventory information
- Out-of-stock inventory information
- Crop status breakdown
- Date-range filtering

### What-If Business Simulator

The What-If Simulator provides hypothetical business scenarios without modifying actual operational data.

Available scenarios:

1. Inventory Sale
2. Price Change
3. Demand Change
4. Production Change
5. Inventory Consumption

The simulator provides projected values based on hypothetical inputs.

The simulator is:

- Read-only
- Rule-based
- Deterministic
- Independent from actual transaction writes
- Accessible to ADMIN and MANAGER roles

### Dashboard

The dashboard provides business-level information including:

- Total crops
- Total inventory items
- Low-stock items
- Production records
- Production quantity
- Sales information
- Revenue information
- Sales/revenue charts
- Production charts
- Inventory status charts
- Crop status charts

---

# Technology Stack

## Frontend

- React 18
- React Router v6
- Axios
- Recharts
- Create React App
- react-scripts
- JavaScript
- JSX

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- CORS
- dotenv

## Development Tools

- Git
- GitHub
- Thunder Client
- Visual Studio Code
- MongoDB / MongoDB Atlas

The project uses **Create React App and does not use Vite**.

---

# System Architecture

AgriTrack follows a modular MERN-based client-server architecture.

```text
                 React Frontend
                      |
                    Axios
                      |
                      v
              Express REST API
                      |
              Authentication /
              Authorization
                 Middleware
                      |
                      v
                  Routes
                      |
                      v
                Controllers
                      |
             +--------+--------+
             |                 |
             v                 v
          Services           Models
             |                 |
             |              Mongoose
             |                 |
             +--------+--------+
                      |
                      v
                   MongoDB
````

The frontend communicates with the backend through REST APIs.

JWT tokens are used for authenticated requests.

Backend middleware performs authentication and authorization before protected controllers are executed.

The backend is responsible for enforcing permissions. Frontend role-based navigation is only a usability feature and is not considered the security boundary.

---

# User Roles and Permissions

| Module / Action            | ADMIN | MANAGER | FARM_STAFF    |
| -------------------------- | ----- | ------- | ------------- |
| Login                      | Yes   | Yes     | Yes           |
| Manage Users               | Yes   | No      | No            |
| View Inventory             | Yes   | Yes     | Yes           |
| Create Inventory           | Yes   | Yes     | No            |
| Update Inventory           | Full  | Full    | Quantity only |
| Delete Inventory           | Yes   | Yes     | No            |
| View Crops                 | Yes   | Yes     | Yes           |
| Create/Update/Delete Crops | Yes   | Yes     | No            |
| View Production            | Yes   | Yes     | Yes           |
| Create/Update Production   | Yes   | Yes     | Yes           |
| Delete Production          | Yes   | Yes     | No            |
| View Sales                 | Yes   | Yes     | Yes           |
| Create/Update/Delete Sales | Yes   | Yes     | No            |
| Reports & Analytics        | Yes   | Yes     | No            |
| What-If Simulator          | Yes   | Yes     | No            |

Authorization is enforced on backend routes using role-based middleware.

---

# Main Modules

## 1. Authentication

Relevant files:

```text
server/models/User.js
server/controllers/authController.js
server/routes/authRoutes.js
server/middleware/auth.js
server/middleware/authorize.js
```

Responsibilities:

* Login
* Registration
* JWT generation
* Password verification
* Current-user information
* User management
* Role-based authorization

---

## 2. Inventory

Relevant files:

```text
server/models/Inventory.js
server/controllers/inventoryController.js
server/routes/inventoryRoutes.js
```

Inventory status is calculated on the server based on quantity and minimum threshold.

```text
quantity = 0
        → Out of Stock

quantity <= minimumThreshold
        → Low Stock

quantity > minimumThreshold
        → In Stock
```

---

## 3. Crops

Relevant files:

```text
server/models/Crop.js
server/controllers/cropController.js
server/routes/cropRoutes.js
```

The module manages crop records, seasons, area, dates and crop status.

---

## 4. Production

Relevant files:

```text
server/models/Production.js
server/controllers/productionController.js
server/routes/productionRoutes.js
```

Production records reference existing Crop documents using MongoDB ObjectId.

---

## 5. Sales

Relevant files:

```text
server/models/Sale.js
server/controllers/saleController.js
server/routes/saleRoutes.js
```

When a sale is linked to an inventory item, the backend checks available stock before reducing inventory.

Example:

```text
Current Inventory = 1000 kg
Sale Quantity     = 500 kg
Remaining Stock   = 500 kg
```

If the requested sale quantity is greater than available stock, the sale is rejected and inventory remains unchanged.

---

## 6. Reports & Analytics

Relevant files:

```text
server/controllers/reportController.js
server/services/analyticsService.js
server/routes/reportRoutes.js
```

The analytics service provides shared data-processing logic for the Dashboard and Reports modules.

Reports are generated from MongoDB data rather than hard-coded values.

---

## 7. What-If Business Simulator

Relevant files:

```text
server/controllers/simulatorController.js
server/routes/simulatorRoutes.js
server/utils/calculations.js
```

The simulator uses hypothetical inputs to calculate projected outcomes.

It does not create, update or delete operational records.

The calculation functions are kept separately so that business calculations can be reused consistently.

---

## 8. Dashboard

Relevant files:

```text
server/controllers/dashboardController.js
server/routes/dashboardRoutes.js
client/src/pages/Dashboard.js
```

The Dashboard combines key business statistics and visual analytics into a single interface.

---

# Folder Structure

```text
AgriTrack/
│
├── .env.example
├── .gitignore
├── README.md
│
├── server/
│   ├── server.js
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── inventoryController.js
│   │   ├── cropController.js
│   │   ├── productionController.js
│   │   ├── saleController.js
│   │   ├── reportController.js
│   │   ├── simulatorController.js
│   │   └── dashboardController.js
│   │
│   ├── services/
│   │   └── analyticsService.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── authorize.js
│   │   ├── validateObjectId.js
│   │   └── errorHandler.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Inventory.js
│   │   ├── Crop.js
│   │   ├── Production.js
│   │   └── Sale.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── cropRoutes.js
│   │   ├── productionRoutes.js
│   │   ├── saleRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── simulatorRoutes.js
│   │   └── dashboardRoutes.js
│   │
│   ├── seed/
│   │   └── seedAdmin.js
│   │
│   └── utils/
│       ├── generateToken.js
│       ├── asyncHandler.js
│       └── calculations.js
│
└── client/
    ├── .env.example
    ├── public/
    │   └── index.html
    │
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        │
        ├── services/
        │   └── api.js
        │
        ├── context/
        │   └── AuthContext.js
        │
        ├── components/
        │   ├── Sidebar.js
        │   ├── Layout.js
        │   └── ProtectedRoute.js
        │
        └── pages/
            ├── Login.js
            ├── Register.js
            ├── Dashboard.js
            ├── Users.js
            ├── inventory/
            ├── crops/
            ├── production/
            ├── sales/
            ├── reports/
            │   └── Reports.js
            └── simulator/
                └── Simulator.js
```

---

# Environment Variables

## Backend

Create:

```text
server/.env
```

Example:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/agritrack
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=8h
ADMIN_EMAIL=admin@agritrack.local
ADMIN_PASSWORD=ChangeMe123
```

## Frontend

Create:

```text
client/.env
```

Example:

```env
REACT_APP_API_BASE_URL=http://localhost:5001/api
```

> Never commit real `.env` files, passwords, JWT secrets or database credentials to GitHub.

---

# Installation

## 1. Clone the Repository

```bash
git clone https://github.com/manyachandna02/agritrack-agribusiness-management-system.git
cd agritrack-agribusiness-management-system
```

---

## 2. Install Backend Dependencies

```bash
cd server
npm install
```

Configure:

```text
server/.env
```

with the required environment variables.

---

## 3. Install Frontend Dependencies

Open another terminal:

```bash
cd client
npm install
```

Configure:

```text
client/.env
```

with:

```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

---

# Running the Application

## Start Backend

From the `server` directory:

```bash
npm run dev
```

or:

```bash
npm start
```

Backend runs on:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/api/health
```

---

## Create the First Admin

Run:

```bash
cd server
npm run seed:admin
```

The seed script uses:

```text
ADMIN_EMAIL
ADMIN_PASSWORD
```

from the backend `.env` file.

---

## Start Frontend

From the `client` directory:

```bash
npm start
```

The React application normally opens at:

```text
http://localhost:3000
```

---

# API Overview

## Authentication

```text
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
GET  /api/auth/users
```

---

## Inventory

```text
GET    /api/inventory
GET    /api/inventory/:id
POST   /api/inventory
PUT    /api/inventory/:id
DELETE /api/inventory/:id
```

---

## Crops

```text
GET    /api/crops
GET    /api/crops/:id
POST   /api/crops
PUT    /api/crops/:id
DELETE /api/crops/:id
```

---

## Production

```text
GET    /api/production
GET    /api/production/:id
POST   /api/production
PUT    /api/production/:id
DELETE /api/production/:id
```

---

## Sales

```text
GET    /api/sales
GET    /api/sales/:id
POST   /api/sales
PUT    /api/sales/:id
DELETE /api/sales/:id
```

---

## Reports

```text
GET /api/reports/summary?from&to
GET /api/reports/sales?from&to
GET /api/reports/production?from&to
GET /api/reports/inventory
GET /api/reports/crops
```

---

## Simulator

```text
POST /api/simulator/inventory-sale
POST /api/simulator/price-change
POST /api/simulator/demand-change
POST /api/simulator/production-change
POST /api/simulator/inventory-consumption
```

---

# Error Handling

The backend uses a consistent error-response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:

| Status | Meaning                     |
| ------ | --------------------------- |
| 200    | Successful request          |
| 201    | Resource created            |
| 400    | Validation or bad request   |
| 401    | Authentication failure      |
| 403    | Insufficient permissions    |
| 404    | Resource or route not found |
| 409    | Conflict                    |
| 500    | Internal server error       |

---

# Sales and Inventory Consistency

When a sale is associated with an inventory item, the backend verifies that sufficient stock exists before reducing inventory.

Example:

```text
Available inventory = 500 kg
Requested sale      = 600 kg
```

The request is rejected because the sale would make inventory negative.

The system therefore prevents:

```text
Inventory < 0
```

For a valid sale:

```text
Available inventory = 1000 kg
Sale quantity       = 500 kg
Remaining inventory = 500 kg
```

Deleting a linked sale restores the corresponding inventory quantity.

---

# What-If Simulator

The simulator allows users to evaluate hypothetical business situations without changing actual records.

Example:

```text
Current Inventory = 500 kg
Hypothetical Sale = 500 kg
Price             = ₹42/kg

Projected Inventory = 0 kg
Projected Revenue   = ₹21,000
```

The example is hypothetical and does not create an actual sale.

The simulator does not write to operational MongoDB collections.

---

# Reports and Analytics

Reports use data stored in MongoDB.

The Reports module provides:

* Summary information
* Sales analytics
* Production analytics
* Inventory analytics
* Crop analytics
* Date-based filtering
* Product-based sales breakdown
* Crop-based production breakdown
* Low-stock information
* Out-of-stock information

The Dashboard and Reports use backend analytics logic to calculate business statistics.

---

# Testing and Quality Assurance

Week 3 included functional and integration-oriented QA across the implemented modules.

Testing covered:

* Authentication
* Authorization
* Inventory
* Crops
* Production
* Sales
* Reports
* Simulator
* Dashboard
* Integration scenarios
* Negative and boundary cases
* Regression checks

Examples of validation scenarios include:

```text
Wrong login credentials
Missing authentication token
Unauthorized role access
Negative inventory quantity
Zero quantity
Low-stock threshold
Overselling inventory
Invalid sale values
Empty report date range
Invalid simulator input
```

The application is structured so that automated tests can be added in future development.

---

# GitHub Repository

Repository:

[https://github.com/manyachandna02/agritrack-agribusiness-management-system.git](https://github.com/manyachandna02/agritrack-agribusiness-management-system.git)

---

# Week 4 Planned Work

The final internship phase focuses on deployment and documentation rather than introducing major new application modules.

Planned activities:

1. Production database configuration
2. Backend deployment
3. Frontend deployment
4. Production environment variables
5. Frontend-backend integration verification
6. Production smoke testing
7. User manual
8. Quick-start guide
9. Troubleshooting guide
10. Monitoring and maintenance documentation
11. Final GitHub verification

---

# Future Improvements

Possible future enhancements include:

* Automated backend testing
* Frontend component testing
* Advanced analytics
* Additional business simulations
* Improved production monitoring
* Production security hardening
* MongoDB replica-set transactions for multi-document transactional workflows
* More detailed reporting and visualization

---

# Project Development Timeline

```text
Week 1
Project Planning & System Architecture
        |
        v
Week 2
Core Module Development
Authentication + RBAC + Inventory + Crops + Production
        |
        v
Week 3
Feature Expansion & QA
Sales + Reports + Simulator + Dashboard + Testing
        |
        v
Week 4
Deployment & Documentation
Production Setup + User Guide + Monitoring
```

---

# Conclusion

AgriTrack provides a centralized web-based platform for managing key agribusiness operations. The Week 3 implementation integrates authentication, role-based authorization, inventory, crops, production, sales, reporting, analytics, dashboard visualization and a read-only What-If Business Simulator into a single MERN application.

The project is now ready to proceed to the Week 4 deployment and documentation phase.

````

