# MediLink: Comprehensive Viva Voce Examination Q&A

> **Preparation Guide:** 15 technical and architectural questions commonly asked by professors, external examiners, and viva evaluators, with answers grounded directly in the MediLink source code.

---

### Q1: Why did you choose the MERN stack for this project?
**Answer:**
MERN (MongoDB, Express, React, Node.js) allows full-stack development using a single language—modern JavaScript. React provides a reactive, component-based user interface suited for real-time dashboards and interactive modals. Node and Express deliver a lightweight, event-driven REST API capable of asynchronous I/O (handling multi-item batch deductions and concurrent orders). MongoDB’s flexible BSON document model is ideal for pharmaceutical data, where inventory batches, order item arrays, and supplier catalog entries have dynamic nested attributes.

---

### Q2: What is a JSON Web Token (JWT), and how is authentication implemented in MediLink?
**Answer:**
A JWT is a digitally signed, stateless token containing encoded JSON claims. In `server/controllers/authController.js`, upon successful email/password validation, the server generates a token signed with `process.env.JWT_SECRET` containing the user's `_id` and `role`. On the client, Axios sends this token in the `Authorization: Bearer <token>` header with every API request. The `protect` middleware in `server/middleware/auth.js` verifies the signature using `jwt.verify()` and attaches the active Mongoose user document to `req.user`.

---

### Q3: How are user passwords securely stored in the database?
**Answer:**
Passwords are never stored in plaintext. In `server/models/User.js`, we use Mongoose’s `pre('save')` hook. If the password field was modified, `bcryptjs.genSalt(10)` generates a cryptographic salt and `bcryptjs.hash()` produces a one-way hash. When a user logs in, `user.matchPassword(enteredPassword)` executes `bcrypt.compare()` to verify credentials securely without exposing or decrypting the stored hash.

---

### Q4: What is FEFO, and how does your code implement it?
**Answer:**
FEFO stands for **First Expiry, First Out**. It guarantees that medicines expiring soonest are dispensed first to prevent expired shelf stock. In `server/utils/fefo.js`, when a store sells a formulation, the server queries all store batches with `quantity > 0` and `expiryDate >= today`, sorting them in ascending order of `expiryDate`. The requested quantity is decremented across these batches chronologically until satisfied. If the combined quantity across valid batches is insufficient, the transaction errors before modifying data.

---

### Q5: How is Role-Based Access Control (RBAC) enforced?
**Answer:**
Access is governed by the `allowRoles(...roles)` middleware in `server/middleware/role.js`. Every protected route specifies authorized roles (e.g., `router.use(allowRoles('store'))` in `inventoryRoutes.js`, or `allowRoles('supplier')` on catalog management). If `req.user.role` does not match the permitted roles, the server immediately rejects the request with an HTTP 403 Forbidden status code (`"Not authorized for this role"`).

---

### Q6: How is data strictly isolated between different stores and suppliers?
**Answer:**
Data isolation is enforced at the database query level on the backend, rather than trusting the client. Every inventory query in `inventoryController.js` filters explicitly by `store: req.user._id`. Similarly, in `catalogController.js`, queries for listings in `/mine` are scoped to `supplier: req.user._id`. A store owner cannot inspect or manipulate another store's inventory batches, even if they alter API request payloads.

---

### Q7: What is a Mongoose schema, and why is it beneficial over raw MongoDB?
**Answer:**
While MongoDB is naturally schema-less, Mongoose schemas (`server/models/`) enforce structure, type safety, field validations, and default values at the application level. For example, `models/Inventory.js` validates that `quantity >= 0`, `purchasePrice >= 0`, and requires mandatory references (`ref: 'Medicine'`). Mongoose also provides lifecycle middleware (pre-save hooks) and compound indexes for fast querying.

---

### Q8: What exact state and database changes occur when a supplier marks an order as "delivered"?
**Answer:**
In `server/controllers/orderController.js` (`updateOrderStatus`), when status changes to `'delivered'`:
1. The order status in the `Order` collection is updated to `'delivered'`.
2. The server iterates over each item in `order.items`.
3. For each item, `addOrMergeStoreBatch()` (`server/utils/inventoryMerge.js`) checks if the destination store already has a batch with matching `medicine` and `batchNo`. If found, the incoming quantity is added to the existing batch; otherwise, a new `Inventory` document is created.
4. A notification of type `'order'` is created for the store owner.

---

### Q9: When does supplier catalog stock decrement? Why not wait until delivery?
**Answer:**
Supplier catalog stock is decremented immediately when the supplier **accepts** the order (`status: 'accepted'`). Decrementing at acceptance reserves the physical units in the warehouse, preventing the supplier from inadvertently overselling the same inventory to multiple buyers while the order is in transit. If an order is subsequently rejected, the units can be restored.

---

### Q10: How does the automated daily expiry cron job function?
**Answer:**
In `server/jobs/expiryCron.js`, we utilize `node-cron` configured with the schedule `'0 8 * * *'` (08:00 AM IST daily). The cron queries all inventory batches in the system where `quantity > 0` and calculates whole days until expiration using `getDaysLeft()`. Any batch within 30 days or already expired generates a targeted in-app notification in the `Notification` collection for that store's owner.

---

### Q11: How does the client handle real-time background polling without excessive bandwidth?
**Answer:**
In `SupplierOrders.jsx`, a lightweight `setInterval` fires every 30 seconds to fetch `GET /api/orders?status=...`. React compares the returned order IDs against a `useRef` of previous order IDs. If a new ID is detected, it is placed in a `newOrderIds` state set that applies a temporary 2-second fading background highlight (`bg-brand-soft`) to draw the supplier's attention without reloading the entire page or interrupting user input.

---

### Q12: How is client-side inline editing designed and validated in the Supplier Catalog?
**Answer:**
In `client/src/components/supplier/InlineEditCell.jsx`, each cell (Price, Stock, Min Order) maintains internal editing state. Clicking mounts an `<input>` element with the current value. Validation runs immediately on client keypress/blur (`price > 0`, `stock >= 0`, `minOrderQty >= 1`). On <kbd>Enter</kbd> or blur, if the value changed, a `PUT /api/catalog/:id` request updates only the modified field. A checkmark icon flashes for 1.5 seconds upon success, and pressing <kbd>Escape</kbd> reverts changes without making an HTTP request.

---

### Q13: What security headers and protections were implemented during backend hardening?
**Answer:**
1. **Helmet**: Configured in `server.js` to set secure HTTP headers (XSS filter, Content Security Policy, frameguard preventing clickjacking, HSTS).
2. **Rate Limiting**: `express-rate-limit` is mounted on `/api/auth/login` and `/api/auth/register` to prevent brute-force password guessing (limited to 20 attempts per 15 minutes per IP).
3. **ObjectId Validation**: `server/middleware/validateObjectId.js` checks any route containing an ID parameter with `mongoose.Types.ObjectId.isValid()`, returning HTTP 400 (`"Invalid id"`) instead of crashing with an unhandled CastError 500.
4. **Environment Check**: The server aborts startup immediately with a fatal error if `JWT_SECRET` or `MONGO_URI` are undefined.

---

### Q14: How is print layout isolation achieved for the Wholesale Invoice?
**Answer:**
In `client/src/index.css`, `@media print` rules specify:
```css
@media print {
  body * { visibility: hidden; }
  #printable-invoice, #printable-invoice * { visibility: visible; }
  #printable-invoice { position: absolute; left: 0; top: 0; width: 100%; background: #ffffff !important; }
}
```
When `window.print()` is executed, the entire UI (sidebar, header, order drawer, buttons) is hidden from the print renderer, outputting exclusively the `#printable-invoice` component on standard A4 paper.

---

### Q15: How would you scale MediLink to handle 100,000 stores and 10,000 suppliers?
**Answer:**
1. **Database Indexing & Sharding**: Compound indexes on `(store, expiryDate)` and `(supplier, createdAt)` are already configured. For 100,000 stores, MongoDB collection sharding based on geographical region or `storeId` hash would distribute write loads.
2. **Caching with Redis**: Frequently queried static data, such as master medicine formulations (`/api/medicines`) and supplier profile details, can be cached in Redis with short TTLs.
3. **Asynchronous Message Queues**: Stock updates, notification dispatch, and delivery synchronization could be offloaded from Express HTTP threads to a distributed queue like BullMQ or RabbitMQ.
4. **Microservices Split**: Decouple the wholesale marketplace/ordering engine from the store shelf-health FEFO tracking engine into independent containerized services.
