# MediLink: B2B Pharmacy Supply & Inventory Platform

> **A modern web application connecting retail medical stores with licensed pharmaceutical suppliers for intelligent FEFO inventory tracking, near-expiry alerts, and direct wholesale procurement.**

---

## 1. Problem Statement & Overview

In India, independent retail pharmacies face two severe operational bottlenecks:
1. **Shelf Expiry Losses**: Medicines have rigid shelf lives. When pharmacy staff sell stock randomly rather than by earliest expiration date, batches sit unnoticed until they expire, resulting in total financial write-offs and hazardous disposal risks.
2. **Fragmented & Manual Procurement**: Ordering medicines from wholesale suppliers typically relies on chaotic phone calls, paper notebooks, and scattered WhatsApp messages. Retailers lack real-time visibility into supplier stock levels, comparative batch rates, or expiry horizons before placing orders.

**MediLink** solves this with a unified, role-based platform built specifically for Indian pharmacy distribution:
- Stores track their shelves with automated **FEFO (First Expiry, First Out)** sales sequencing and automated expiry risk tiers.
- A built-in wholesale marketplace allows stores to compare supplier rates and place direct digital purchase orders.
- Wholesale suppliers review incoming orders with live **Stock Impact simulation**, dispatch consignments, and generate standardized wholesale invoices.
- System administrators enforce compliance by reviewing and approving mandatory state Drug License numbers (Form 20B/21B wholesale and 20/21 retail).

---

## 2. Key Features by Role

### A. Retail Medical Store Portal
- **Operational Dashboard**:
  - Live metric cards: Expired Batches, Expiring Soon (<90 days), Low Stock (<15 units), and Total Stock Valuation in INR.
  - Interactive **Shelf Health Bar** visualizing inventory proportions (Safe, Warning, Critical, Expired).
  - 6-Month **Expiry Runway** chart forecasting upcoming expiration liabilities.
  - "Needs Attention" triage panel with quick one-click actions.
- **Inventory Ledger**:
  - Searchable, filterable batch table detailing formulation, manufacturer, batch number, days left, quantity, and purchase price.
  - Manual batch intake modal with live duplication check and date validation.
  - **FEFO Quick-Sell Counter**: Dispenses requested units automatically across the oldest non-expired batches first, providing a clear pre-sale breakdown.
  - CSV export of entire inventory ledger.
- **Expiry & Low-Stock Alerts**:
  - Segmented tabs: Expired, Expiring Soon (30–90 days), and Low Stock.
  - Direct write-off dialog for unsellable expired stock.
  - Clearance selling modal for near-expiry stock.
- **Wholesale Procurement & Multi-Supplier Cart**:
  - Browse verified formulations from approved suppliers with unit prices, batch numbers, and expiry tags.
  - **Price Comparison Modal**: Compare all supplier listings for any medicine side-by-side.
  - **Smart Restock Helper**: One-click modal detecting low-stock or critical medicines in the store's inventory and matching them to the cheapest available supplier listing.
  - Multi-supplier cart grouping orders automatically by supplier with minimum order quantity (MOQ) enforcement.
- **Purchase Order Tracking**:
  - Live order timeline (Placed → Accepted → Dispatched → Delivered).
  - One-click reorder button that scans supplier availability and refills the cart.

### B. Wholesale Supplier Portal
- **Supplier Dashboard**:
  - High-priority order queue with instant inline Accept and Reject buttons.
  - Metric cards highlighting incoming orders requiring response in accent color.
  - 6-Month delivered revenue BarChart in brand green.
  - "Top Purchasing Stores" ranked ledger with proportional volume bars.
  - "Stock to Watch" alert monitor for low supplier inventory (<20 units with inline quick update) and short-dated stock (<180 days).
- **Wholesale Catalog Management**:
  - Debounced search, sort, and segmented risk filters (All, Low stock, Short shelf life, Expired).
  - **Inline Table Cell Editing**: Click-to-edit for Price, Stock, and Min Order Quantity with <kbd>Enter</kbd> to save, <kbd>Escape</kbd> to cancel, client validation, and 1.5s visual confirmation.
  - Add/Edit listing modal with medicine search picker and duplicate listing prevention.
  - Expandable mini-form to register new formulations on the fly.
  - CSV catalog export.
- **Order Processing & Invoicing**:
  - Underline tabs (New, Accepted, Dispatched, Delivered, Rejected, All) with 30-second periodic polling and a 2-second fading highlight on newly arrived orders.
  - Slide-out 440px Order Drawer featuring live **Stock Impact Simulation**: previews catalog stock before and after acceptance, disabling the Accept button if ordered quantity exceeds current supply.
  - Rejection dialog with required categorized reason chips.
  - Delivery confirmation triggering automatic batch creation in the store's inventory.
  - Clean, dedicated **Wholesale Invoice** template rendered exclusively during browser print media (`window.print()`).

### C. Administrator Portal
- **Platform Health & Metrics**:
  - Metric cards: Pending Approvals (highlighted in vermilion), Active Stores, Active Suppliers, and Platform Gross Volume.
  - Compact 6-Month platform monthly orders BarChart.
- **Account Verification & Approvals**:
  - Filter by Pending, Approved, or All accounts across Store and Supplier roles.
  - One-click clipboard copy for verified Drug License numbers.
  - Solid Approve action and safe Reject/Remove dialogs.
  - Self-deletion and admin-deletion prevention guards.

---

## 3. Technology Stack

- **Architecture**: MERN (MongoDB, Express.js, React, Node.js)
- **Programming Language**: 100% Pure Modern JavaScript (ES Modules, zero TypeScript)
- **Frontend Framework**: React 18 with Vite v5
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS v3.4 (Strictly 1px borders, zero gradients, zero glassmorphism, max 10px radius)
- **Typography**: Google Fonts (*Instrument Serif*, *DM Sans*, *JetBrains Mono*)
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **HTTP Client**: Axios with configured interceptors
- **Backend Framework**: Express.js with ES Modules (`"type": "module"`)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Stateless JSON Web Tokens (JWT) with HTTP Authorization Bearer headers
- **Password Security**: Salted Bcrypt hashing (`bcryptjs`)
- **Security & Hardening**: Helmet HTTP headers, Express-Rate-Limit on auth routes, and strict CORS
- **Automated Tasks**: Node-Cron daily schedule

---

## 4. How the Core Logic Works

### A. Expiry Risk Thresholds
Expiry calculation is computed using whole-day offsets from the start of the current day (`startOfDay`):
- **Expired (`days < 0`)**: Past expiry date. Blocked from customer sale; flagged for write-off.
- **Critical (`0 <= days <= 30`)**: Extremely high risk. Urgent clearance or return required.
- **Warning (`31 <= days <= 90`)**: Approaching expiration. Prioritized for immediate sale.
- **Safe (`days > 90`)**: Normal, healthy inventory shelf life.

### B. FEFO (First Expiry, First Out) Algorithm
When a pharmacy dispenses medicine (`POST /api/inventory/sell`):
1. The server queries the store's batches for that medicine where `quantity > 0` and `expiryDate >= today`.
2. Batches are sorted in ascending order of `expiryDate` (earliest expiring first).
3. The requested sale quantity is deducted sequentially:
   - If a batch has fewer units than requested, its stock is reduced to `0` and deduction continues to the next batch.
   - If a batch has sufficient units, its quantity is decremented and the loop terminates.
4. If total non-expired stock across all batches is less than the requested quantity, the transaction is rejected with an HTTP 400 error.

### C. Order Flow & Inventory Lifecycle
```
[ Retail Store ]                      [ Wholesale Supplier ]
       |                                         |
       |--- 1. Places Purchase Order ----------->| (Status: "placed")
       |                                         |
       |                                         |--- 2. Checks Stock Impact Preview
       |                                         |--- 3. Accepts Order
       |                                         |      (Status: "accepted", supplier stock decremented)
       |<-- Notification Received ---------------|
       |                                         |--- 4. Dispatches Order
       |                                         |      (Status: "dispatched")
       |                                         |
       |                                         |--- 5. Confirms Delivery
       |<-- Batches Created in Store Inventory --|      (Status: "delivered")
```
- **Stock Movement Timing**:
  - The supplier's catalog stock is decremented immediately when the supplier **accepts** the order.
  - The store's inventory batches are created/merged automatically when the supplier marks the order as **delivered**.
  - If batches with the same formulation and batch number already exist in the store, quantities are added to the existing batch record.

### D. Restock Helper & Low-Stock Reordering
- A medicine is flagged as low stock when total available units fall below **15 units** (or store-defined minimum).
- The Restock Helper (`/store/browse?restock=1`) calculates reorder quantities (`optimal = target - current`) and cross-references all active catalog listings from approved suppliers, recommending the supplier offering the lowest price per unit.

### E. Daily Automated Expiry Cron Job
- Configured via `node-cron` to execute daily at **08:00 AM IST** (`0 8 * * *`).
- Scans all inventory batches across all stores.
- Automatically generates system notifications for stores having batches that crossed into `critical` (<=30 days) or `expired` status.

---

## 5. Directory Structure

```
medilink/
├── client/                     # Vite + React Frontend
│   ├── public/                 # Static assets & favicon.svg
│   ├── src/
│   │   ├── api/                # Axios client with interceptors (axios.js)
│   │   ├── components/         # Reusable UI components
│   │   │   ├── admin/          # AdminOrdersChart, AdminUsersTable
│   │   │   ├── orders/         # Shared OrderItemsTable, OrderTimeline
│   │   │   ├── store/          # Store shelf health, FEFO modals, restock
│   │   │   └── supplier/       # StockImpact, InvoicePrint, InlineEditCell
│   │   ├── context/            # AuthContext, CartContext, ToastContext
│   │   ├── hooks/              # useApi, usePageTitle
│   │   ├── layouts/            # AppLayout (Sidebar/TopBar), AuthShell
│   │   ├── pages/              # Routed views
│   │   │   ├── store/          # Dashboard, Inventory, Alerts, Browse, Orders, Cart
│   │   │   ├── AdminApprovals.jsx
│   │   │   ├── Login.jsx, Register.jsx, NotFound.jsx
│   │   │   └── SupplierDashboard.jsx, SupplierCatalog.jsx, SupplierOrders.jsx
│   │   ├── utils/              # format.js (INR & dates), csv.js, restock.js
│   │   ├── App.jsx             # Main routing configuration
│   │   └── index.css           # Tailwind directives & print media rules
│   └── package.json
├── server/                     # Node.js + Express Backend
│   ├── config/                 # MongoDB connection (db.js)
│   ├── controllers/            # Route controllers (auth, inventory, orders, etc.)
│   ├── jobs/                   # Scheduled tasks (expiryCron.js)
│   ├── middleware/             # auth.js, role.js, validateObjectId.js
│   ├── models/                 # User, Medicine, Inventory, Catalog, Order, Notification
│   ├── routes/                 # Express routers
│   ├── seed/                   # Seed script with realistic Indian pharma data
│   ├── utils/                  # expiry.js, fefo.js, inventoryMerge.js, asyncHandler.js
│   ├── server.js               # Server entry point with helmet & rate limiting
│   └── package.json
├── docs/                       # Project documentation
│   ├── DEMO_SCRIPT.md          # 5-minute live demonstration walkthrough
│   └── VIVA_QA.md              # 15 Teacher/Examiner Q&A preparations
└── README.md
```

---

## 6. Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (Local instance running at `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### Step 1: Backend Setup
```bash
cd server
npm install
```

Create a `.env` file inside `server/`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/medilink
JWT_SECRET=medilink_secure_super_secret_jwt_key_2026
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Seed the database with Indian pharmaceutical formulations, demo stores, and suppliers:
```bash
npm run seed
```

Start the backend development server:
```bash
npm run dev
```

### Step 2: Frontend Setup
```bash
cd ../client
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 7. Demo Accounts & Credentials

| Role | Email | Password | Business Name | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@medilink.test` | `admin123` | MediLink Central Admin | Approved |
| **Store** | `jayambe@medilink.test` | `store123` | Jay Ambe Medical Store (Gandhinagar) | Approved |
| **Store** | `apollo@medilink.test` | `store123` | Apollo Pharmacy Franchise (Ahmedabad) | Approved |
| **Store** | `navjeevan@medilink.test` | `store123` | Navjeevan Chemist (Vadodara) | **Pending** |
| **Supplier** | `ganesh@medilink.test` | `supplier123` | Shree Ganesh Pharma Distributors | Approved |
| **Supplier** | `maruti@medilink.test` | `supplier123` | Maruti Life Sciences Wholesale | Approved |
| **Supplier** | `sunpharma@medilink.test` | `supplier123` | Sun Agency Pharma Distribution | Approved |

---

## 8. API Route Specification & Access Guards

| Method | Endpoint | Authorization | Allowed Roles | Description |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public (Rate Limited) | All | Register new store or supplier account |
| `POST` | `/api/auth/login` | Public (Rate Limited) | All | Authenticate user & issue JWT token |
| `GET` | `/api/auth/me` | Protected | All | Get current authenticated user profile |
| `GET` | `/api/admin/stats` | Protected | `admin` | Platform analytics & 6-month order trends |
| `GET` | `/api/admin/users` | Protected | `admin` | Filter & paginate user accounts |
| `PATCH` | `/api/admin/users/:id/approve` | Protected | `admin` | Approve pending pharmacy account |
| `DELETE` | `/api/admin/users/:id` | Protected | `admin` | Remove rejected or closed user account |
| `GET` | `/api/medicines` | Protected | All | Search standardized formulations |
| `POST` | `/api/medicines` | Protected | `admin`, `supplier` | Register new medicine formulation |
| `GET` | `/api/inventory` | Protected | `store` | List store batches with search/sort |
| `GET` | `/api/inventory/summary` | Protected | `store` | Get shelf health metrics & valuations |
| `GET` | `/api/inventory/alerts` | Protected | `store` | List expired, critical, and low-stock batches |
| `POST` | `/api/inventory` | Protected | `store` | Add a newly acquired batch to shelf |
| `POST` | `/api/inventory/sell` | Protected | `store` | Sell medicine using FEFO deduction |
| `PUT` | `/api/inventory/:id` | Protected | `store` | Update batch quantity or price |
| `DELETE` | `/api/inventory/:id` | Protected | `store` | Write off expired batch |
| `GET` | `/api/catalog/browse` | Protected | `store` | Search active listings from approved suppliers |
| `GET` | `/api/catalog/suppliers` | Protected | `store` | List verified wholesale suppliers |
| `GET` | `/api/catalog/compare/:medicineId` | Protected | `store` | Side-by-side supplier price comparison |
| `GET` | `/api/catalog/mine` | Protected | `supplier` | Supplier's own catalog listings |
| `POST` | `/api/catalog` | Protected | `supplier` | Publish new catalog listing |
| `PUT` | `/api/catalog/:id` | Protected | `supplier` | Inline edit price, stock, or MOQ |
| `DELETE` | `/api/catalog/:id` | Protected | `supplier` | Delete catalog listing |
| `GET` | `/api/orders` | Protected | `store`, `supplier` | List orders (filtered by store/supplier) |
| `GET` | `/api/orders/store-summary` | Protected | `store` | Order count & 6-month store spend chart |
| `GET` | `/api/orders/supplier-summary` | Protected | `supplier` | Supplier incoming order counts & revenue |
| `POST` | `/api/orders` | Protected | `store` | Place multi-item purchase order |
| `GET` | `/api/orders/:id` | Protected | `store`, `supplier` | Get order detail with items breakdown |
| `PATCH` | `/api/orders/:id/status` | Protected | `supplier` | Accept, dispatch, deliver, or reject order |
| `GET` | `/api/notifications` | Protected | All | Get 30 recent notification alerts |
| `PATCH` | `/api/notifications/:id/read` | Protected | All | Mark single notification as read |
| `PATCH` | `/api/notifications/read-all` | Protected | All | Mark all notifications as read |

---

## 9. Screenshot Reference Guide

When assembling documentation for submission, place screenshots in the following order:
1. **Store Dashboard**: `screenshots/01_store_dashboard.png` (KPI cards, Shelf Health Bar, Expiry Runway, Needs Attention panel).
2. **FEFO Quick-Sale Modal**: `screenshots/02_fefo_sale_modal.png` (Live multi-batch deduction preview showing oldest batch depleted first).
3. **Supplier Catalog with Inline Edit**: `screenshots/03_supplier_inline_edit.png` (Click-to-edit cell with active input and save confirmation).
4. **Supplier Incoming Orders Drawer**: `screenshots/04_order_drawer_stock_impact.png` (Stock Impact Simulation showing before and after quantities).
5. **Printable Wholesale Invoice**: `screenshots/05_wholesale_invoice_print.png` (Clean A4 print preview with Drug License numbers).
6. **Administrator Portal**: `screenshots/06_admin_approvals_portal.png` (Pending account triage and platform order chart).

---

## 10. Limitations & Future Scope

While MediLink provides a production-grade workflow for B2B pharmacy operations, the following areas represent natural extensions:
- **Integrated Payment Gateways**: Integration with Razorpay or UPI Intent flow for direct B2B settlement before dispatch.
- **Automated GST E-Invoicing**: Generation of IRN (Invoice Reference Number) and QR codes via Indian GST portal APIs.
- **Hardware Barcode & 2D DataMatrix Scanning**: Integration of USB/Bluetooth barcode scanners for instant GS1 batch verification at intake and sale.
- **SMS & WhatsApp Alerts**: Automated alerts via Twilio/Gupshup when high-value batches reach 30 days to expiry.
- **Supplier Rating & Reliability Scoring**: Public metrics on supplier fulfillment time, cancellation frequency, and batch freshness.
