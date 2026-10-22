# MediLink: 5-Minute Evaluation Demo Script

> **Purpose:** This script provides an exact, step-by-step walkthrough for demonstrating the MediLink B2B platform to teachers, evaluators, or project viva examiners within 5 minutes.

---

## Preparation Before Starting
1. Ensure the server is running on `http://localhost:5000` and client on `http://localhost:5173`.
2. Seed fresh data: `cd server && npm run seed`.
3. Open two browser windows:
   - **Window 1 (Chrome Regular):** For Retail Store and Admin (`http://localhost:5173/login`)
   - **Window 2 (Incognito / Second Profile):** For Wholesale Supplier (`http://localhost:5173/login`)

---

## Step-by-Step Demonstration

### 1. Store Login & Shelf Health Overview (0:00 – 0:45)
- **Action:**
  - In Window 1, enter `jayambe@medilink.test` / `store123` (or click "Store (Jay Ambe)" under Quick autofill).
  - Click **Sign in**. The browser opens `/store`.
- **What to Say:**
  > *"Good morning. I am demonstrating MediLink, a dedicated B2B platform connecting retail medical stores with licensed pharmaceutical suppliers. We are logged in as Jay Ambe Medical Store in Gandhinagar. Notice our top KPIs: expired batches, batches expiring within 90 days, low stock items, and total inventory value in Rupees. Below is our unique Shelf Health Bar showing the exact proportion of safe versus critical stock, and a 6-month Expiry Runway chart forecasting upcoming liabilities."*

---

### 2. FEFO (First Expiry, First Out) Counter Sale (0:45 – 1:30)
- **Action:**
  - Navigate to **Inventory** in the sidebar (`/store/inventory`).
  - Search for `Dolo 650` or click the **Sell (FEFO)** button on a row.
  - In the Sell modal, type `15` in the quantity input.
- **What to Say:**
  > *"Here is our core innovation: FEFO selling. Traditional stores pick medicines randomly from shelves, causing older batches to expire. When a pharmacist types a quantity here, MediLink scans all non-expired batches in real-time, sorting them by earliest expiry date. As you can see in the breakdown, the system automatically pulls 10 units from the batch expiring in November, and the remaining 5 units from the batch expiring next March. I'll click 'Confirm Sale', and the batches are decremented instantly with full ledger integrity."*

---

### 3. Expiry Alerts & Restock Helper (1:30 – 2:15)
- **Action:**
  - Navigate to **Expiry alerts** (`/store/alerts`).
  - Show the **Expired** tab and click **Low stock**.
  - Navigate to **Browse suppliers** (`/store/browse`).
  - Click the **Restock helper** button at the top right.
- **What to Say:**
  > *"Under Expiry Alerts, the store has separate tabs for expired batches ready for write-off, near-expiry clearance, and low-stock items. When inventory drops below our safety threshold, the store owner does not need to call three different suppliers. Clicking 'Restock helper' analyzes low inventory and instantly recommends the cheapest approved supplier listing across our network. We can add items directly to the wholesale cart with one click."*

---

### 4. Placing a Multi-Supplier Wholesale Order (2:15 – 2:45)
- **Action:**
  - Add items from **Shree Ganesh Pharma** (e.g. Dolo 650 or Azithral 500).
  - Click the **Cart** in the header (`/store/cart`).
  - Review the supplier section with minimum order quantity (MOQ) validation.
  - Add a note: *"Urgent clinic replenishment"* and click **Place Order with Shree Ganesh Pharma**.
- **What to Say:**
  > *"Our cart automatically groups lines by wholesale distributor because each supplier fulfills their own shipment. Minimum order quantities are strictly enforced on the client and server. I'll click 'Place Order', and our order is created in 'placed' status."*

---

### 5. Switching to Supplier: Live Queue & Stock Impact (2:45 – 3:45)
- **Action:**
  - Switch to **Window 2** (Incognito).
  - Log in as `ganesh@medilink.test` / `supplier123`. The browser opens `/supplier`.
  - Point to the **Orders waiting for you** panel and StatCard in accent vermilion.
  - Navigate to **Orders** (`/supplier/orders`).
  - Click on the new order `#...` to open the 440px slide-out drawer.
  - Point out the **Stock impact preview** panel.
- **What to Say:**
  > *"Now we are in the Supplier Portal for Shree Ganesh Pharma Distributors. Every 30 seconds, this view automatically polls the server, highlighting new orders with a gentle pulse. When I open the order drawer, notice the 'Stock impact' box. MediLink checks our live warehouse catalog and displays ordered quantity, available stock, and projected stock after acceptance. If we didn't have enough units, the Accept button would be disabled to prevent fraudulent commitments. Since we have sufficient stock, I will click 'Accept order'. Our catalog stock decrements immediately."*

---

### 6. Dispatch, Delivery & Printable Wholesale Invoice (3:45 – 4:30)
- **Action:**
  - In the drawer, click **Mark as dispatched**.
  - Click **Mark as delivered**. Confirm the dialog: *"The store's inventory will be updated with these batches."*
  - Click **Print invoice** in the drawer header to showcase print styling.
- **What to Say:**
  > *"The supplier marks the consignment dispatched, and upon arrival, confirms delivery. A confirmation modal reminds the supplier that this action officially transfers stock. Clicking 'Print invoice' opens our clean, dedicated A4 invoice containing drug license numbers, batch tags, and delivery terms, hiding the rest of the application completely."*

---

### 7. Verification at Store & Admin Approvals (4:30 – 5:00)
- **Action:**
  - Switch back to **Window 1** (Store).
  - Open `/store/orders` → The order status shows **Delivered** in green with the progress track complete.
  - Navigate to `/store/inventory` → The newly delivered batch and quantity appear in the store ledger.
  - Log out and log in as `admin@medilink.test` / `admin123`.
  - Show the **Admin** dashboard (`/admin`) with pending registrations (e.g. Navjeevan Chemist).
  - Click **Copy** on the Drug License number, then click **Approve**.
- **What to Say:**
  > *"Back in the store portal, the order is marked Delivered and the exact batches have automatically integrated into the store's inventory without manual data entry. Finally, logging in as Admin, we verify compliance: administrators review pending pharmacy registrations, verify drug license numbers with one click, and approve them. This completes the end-to-end B2B pharmaceutical supply chain on MediLink."*
