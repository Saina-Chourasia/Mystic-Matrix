# 🔮 MYSTIC MATRIX: The Enchanted Inventory for Every Potion and Prophecy

> **Brand Name:** MYSTIC MATRIX  
> **Tagline:** *"The Enchanted Inventory for Every Potion and Prophecy."*  
> **Secondary Tagline:** *"Where Magical Inventory Meets Intelligent Predictions."*  
> **Prepared for:** Madam Hex's Apothecary & Nocturnal Emporium  
> **Unified Single-Host Public URL:** `http://localhost:5001` (Unified React 18 UI & Express REST API)

---

## 🧙‍♀️ 1. Concept & Architectural Evolution

In the nocturnal valley of Hallowmere, **Madam Hex** runs an apothecary supplying rare reagents and handcrafted elixirs.

Previously, the shop operated with an administrative dashboard but lacked a customer-facing portal and relied exclusively on an unconfigured Google OAuth redirect, causing `/login?error=not_configured`.

**MYSTIC MATRIX 3.0** resolves this completely by introducing:
1. **Two Secure Portals, One Application & Shared Database**:
   - **Admin Inventory Command Center (`/admin/*`)**: Inventory control, Holt-Winters demand forecasting, supplier and purchase order management, user directory governance, security audit logs, and dataset provenance tools.
   - **Customer User Portal (`/user/*`)**: A customer sanctuary for apprentices to browse potions, manage satchels (shopping carts), place demo orders with atomic stock deduction, view order grimoires, and manage account security.
2. **Production-Grade Dual Authentication**:
   - Primary **Email & Password** authentication using adaptive **Bcrypt hashing (cost factor 12)**.
   - **Server-Side Session Store** (`sessions` table in SQLite) with **HttpOnly, SameSite=Lax** cookies and session regeneration on login.
   - **Public Customer Registration** strictly locked to role `USER`.
   - **Explicit Initial Admin Provisioning** for Madam Hex (`madam.hex@gmail.com`).
   - Single-use expiring tokens for account recovery.
3. **Official UCI Online Retail II Dataset Integration**:
   - Complete ingestion pipeline for the official UCI dataset (**1,067,371 real retail records** from 2009 to 2011).
   - Strict data separation between **REAL DATA** and **DEMO DATA**.
   - Chronological out-of-time train/validation splits and backtesting evaluation benchmarks.

---

## ✨ 2. Dual-Portal Walkthrough

### 2.1 Customer User Portal (`/user/*`)
* **Sanctuary Dashboard (`/user/dashboard`)**: Personalized welcome, featured potions, nocturnal coven favorites, and seasonal discount incantations (`HEX2026`, `STARFALL`).
* **Magical Shop (`/user/shop`)**: Browse products by category (Potions vs Ingredients), filter by stock status, sort by price, view alchemy recipe ingredients, and adjust order quantities.
* **Shopping Satchel (`/user/cart`)**: Persistent cart with authoritative server-side price and tax recalculation.
* **Atomic Demo Checkout**: Validates stock, deducts inventory atomically, records sales with `CUSTOMER_ORDER` provenance, writes audit transactions, and displays celebratory confirmation with sound effects.
* **Order Grimoire (`/user/orders`)**: View order history and itemized receipts. Object-level access control strictly isolates customer data.
* **Alchemist Profile (`/user/profile`)**: Manage moniker, contact coordinates, account security, and passphrase renewal.

### 2.2 Admin Inventory Command Center (`/admin/*`)
* **Overview Dashboard (`/admin/dashboard`)**: Store valuation, stock health index, customer order metrics, low-stock alerts, and recent transactions.
* **Inventory Catalog (`/admin/inventory`)**: Add, edit, archive, and adjust stock for all potions and ingredients.
* **Demand Forecasting (`/admin/forecasting`)**: Holt-Winters exponential smoothing with Halloween surge multipliers. Supports dataset switching between Demo Apothecary data and Real UCI Retail data.
* **Store Orders Ledger (`/admin/orders`)**: Comprehensive view of all orders placed by portal users with itemized receipt inspection.
* **Suppliers & Purchase Orders (`/admin/suppliers`)**: Guild lead times, reliability scores, and one-click PO receiving with automatic shelf restocking.
* **User & Role Directory (`/admin/users`)**: Governance of all registered accounts, roles (`ADMIN` vs `USER`), and suspension controls.
* **Security Audit Logs (`/admin/security`)**: Real-time immutable audit trail recording logins, registration, role changes, and order events.
* **Datasets & UCI Integration (`/admin/datasets`)**: Ingestion pipeline status, formal UCI citation, real retail transaction browser, daily demand aggregates, and chronological backtesting leaderboard.

---

## 📊 3. Official UCI Online Retail II Integration

* **Dataset**: Official UCI Machine Learning Repository — *Online Retail II* (Dataset #502).
* **DOI**: [10.24432/C5CG6D](https://doi.org/10.24432/C5CG6D)
* **Citation**: Chen, D. (2012). *Online Retail II* [Dataset]. UCI Machine Learning Repository.
* **Total Records**: **1,067,371 rows** (December 2009 to December 2011).
* **Provenance Rules**:
  - Categorized strictly as **REAL DATA**.
  - Customer IDs are masked (`CUST-***`) for privacy compliance.
  - Cancellations (Invoice starting with 'C' or negative quantity) are tracked separately from sales.
  - Daily product demand is aggregated into `imported_daily_demand`.
  - Chronological out-of-time splits: 2009–2010 for training, 2011 for validation.
  - Backtesting benchmarks (MAE, WAPE, Bias, Accuracy) are computed and cataloged.

---

## 🚀 4. Quickstart & Verification Commands

### 4.1 Running the Application
```bash
# 1. Install dependencies
pnpm install

# 2. Build frontend production assets
npm run build

# 3. Start unified backend server (Port 5001)
npm start
```

### 4.2 Logging In
Open your browser at `http://localhost:5001`:
* **Admin Access**:
  - Sign in with Google using Clerk.
  - To provision Madam Hex's Admin account, run the server-side CLI:
    `node scripts/provision_admin_clerk.js <YOUR_CLERK_USER_ID>`
* **Customer Access**:
  - Sign in with Google (all new users receive the Customer role by default).
  - Or register a new customer account via "Create Account".

### 4.3 Running Test Suites
```bash
# 1. Comprehensive Backend Security, Concurrency & Dataset Test Suite (40/40 Passing)
NODE_PATH=backend/node_modules node scripts/verify_all_phases.js

# 2. HTTP Integration & Route Security Test Suite (14/14 Passing)
NODE_PATH=backend/node_modules node scripts/test_http_endpoints.js

# 3. End-to-End Puppeteer Browser Verification
node scripts/e2e_verify_portals.js

# 4. UCI Retail Dataset Ingestion Pipeline
NODE_PATH=backend/node_modules node scripts/import_uci_dataset.js
```

---

## 🔒 5. Security & Technical Architecture Reference

See the full architectural report at [`docs/ARCHITECTURE_AND_IMPLEMENTATION.md`](file:///Users/sainakumari/Desktop/Mystic%20Matrix/docs/ARCHITECTURE_AND_IMPLEMENTATION.md) for:
- Concurrency & Atomic SQLite Transaction design
- Bcrypt cost 12 adaptive password hashing & session management
- Object-level authorization and role matrix
- Schema definitions and entity relationship diagrams
- Comprehensive verification logs
