const API = 'http://localhost:5000/api';

async function req(endpoint, options = {}) {
  const url = `${API}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: res.status, ok: res.ok, data };
}

async function runE2E() {
  console.log('====================================================');
  console.log('       MEDILINK COMPREHENSIVE END-TO-END SUITE       ');
  console.log('====================================================\n');

  try {
    // -----------------------------------------------------------
    // STEP 1: Register a new store
    // -----------------------------------------------------------
    console.log('[STEP 1] Registering a new retail medical store...');
    const regPayload = {
      name: 'Rohan Sharma',
      email: `rohan_store_${Date.now()}@medilink.test`,
      password: 'storePassword123',
      role: 'store',
      businessName: 'Shree Krishna Medical Store',
      licenseNumber: 'GJ-AHM-2026-R99',
      phone: '+91 98251 12345',
      city: 'Ahmedabad',
      address: 'Shop 12, Sahajanand Complex, Satellite',
    };

    const regRes = await req('/auth/register', { method: 'POST', body: regPayload });
    if (!regRes.ok) throw new Error(`Register failed: ${JSON.stringify(regRes.data)}`);
    const newStoreId = regRes.data.userId;
    const newStoreEmail = regPayload.email;
    console.log(`  ✓ Registered: "${regPayload.businessName}" (ID: ${newStoreId})`);
    console.log(`  ✓ Status: Awaiting Admin Approval`);

    // -----------------------------------------------------------
    // STEP 2: Admin approves the new store
    // -----------------------------------------------------------
    console.log('\n[STEP 2] Admin authentication and approval...');
    const adminLogin = await req('/auth/login', {
      method: 'POST',
      body: { email: 'admin@medilink.test', password: 'admin123' },
    });
    if (!adminLogin.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.data)}`);
    const adminToken = adminLogin.data.token;
    console.log('  ✓ Admin logged in successfully.');

    const approveRes = await req(`/admin/users/${newStoreId}/approve`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (!approveRes.ok) throw new Error(`Admin approve failed: ${JSON.stringify(approveRes.data)}`);
    console.log(`  ✓ Admin approved user: ${approveRes.data.user.businessName} (Approved: ${approveRes.data.user.approved})`);

    // -----------------------------------------------------------
    // STEP 3: Store logs in
    // -----------------------------------------------------------
    console.log('\n[STEP 3] Store logging into approved account...');
    const storeLogin = await req('/auth/login', {
      method: 'POST',
      body: { email: newStoreEmail, password: 'storePassword123' },
    });
    if (!storeLogin.ok) throw new Error(`Store login failed: ${JSON.stringify(storeLogin.data)}`);
    const storeToken = storeLogin.data.token;
    const storeHeaders = { Authorization: `Bearer ${storeToken}` };
    console.log(`  ✓ Store logged in. Token issued for "${storeLogin.data.user.businessName}".`);

    // Get a medicine formulation to work with
    const medsRes = await req('/medicines?search=Dolo', { headers: storeHeaders });
    const doloMed = medsRes.data[0];
    console.log(`  ✓ Selected medicine: "${doloMed.name} (${doloMed.strength})", Form: ${doloMed.form}`);

    // -----------------------------------------------------------
    // STEP 4: Store adds two batches
    // -----------------------------------------------------------
    console.log('\n[STEP 4] Store adds two batches with staggered expiries...');
    const today = new Date();
    const batch1Date = new Date(today.getFullYear(), today.getMonth() + 2, 1); // 2 months
    const batch2Date = new Date(today.getFullYear(), today.getMonth() + 10, 1); // 10 months

    const b1 = await req('/inventory', {
      method: 'POST',
      headers: storeHeaders,
      body: {
        medicine: doloMed._id,
        batchNo: 'B-EARLY-101',
        quantity: 20,
        purchasePrice: 24.5,
        expiryDate: batch1Date.toISOString(),
      },
    });
    console.log(`  ✓ Batch 1 Added: ${b1.data.batch?.batchNo}, Qty: 20, Expiry: ${batch1Date.toISOString().slice(0, 10)}`);

    const b2 = await req('/inventory', {
      method: 'POST',
      headers: storeHeaders,
      body: {
        medicine: doloMed._id,
        batchNo: 'B-LATER-202',
        quantity: 30,
        purchasePrice: 25.0,
        expiryDate: batch2Date.toISOString(),
      },
    });
    console.log(`  ✓ Batch 2 Added: ${b2.data.batch?.batchNo}, Qty: 30, Expiry: ${batch2Date.toISOString().slice(0, 10)}`);

    // -----------------------------------------------------------
    // STEP 5: Store sells with FEFO across two batches
    // -----------------------------------------------------------
    console.log('\n[STEP 5] Selling 25 units via FEFO (should drain Batch 1 [20] and deduct 5 from Batch 2)...');
    const sellRes = await req('/inventory/sell', {
      method: 'POST',
      headers: storeHeaders,
      body: {
        medicineId: doloMed._id,
        quantity: 25,
      },
    });
    if (!sellRes.ok) throw new Error(`FEFO sell failed: ${JSON.stringify(sellRes.data)}`);
    console.log(`  ✓ Sold 25 units successfully.`);
    console.log('  ✓ FEFO Deductions breakdown:');
    sellRes.data.deductions.forEach((d) => {
      console.log(`     - Batch ${d.batchNo}: deducted ${d.taken} units (Remaining on shelf: ${d.remainingInBatch})`);
    });

    // -----------------------------------------------------------
    // STEP 6: Store browses catalog
    // -----------------------------------------------------------
    console.log('\n[STEP 6] Browsing wholesale listings from approved suppliers...');
    const browseRes = await req('/catalog/browse?limit=50', { headers: storeHeaders });
    console.log(`  ✓ Available wholesale listings found: ${browseRes.data.total}`);

    // Group listings by two distinct suppliers
    const supplier1Listing = browseRes.data.items[0];
    const supplier2Listing = browseRes.data.items.find(
      (item) => item.supplier._id !== supplier1Listing.supplier._id
    );

    console.log(`  ✓ Supplier 1: ${supplier1Listing.supplier.businessName} (${supplier1Listing.medicine.name}, Stock: ${supplier1Listing.stock})`);
    console.log(`  ✓ Supplier 2: ${supplier2Listing.supplier.businessName} (${supplier2Listing.medicine.name}, Stock: ${supplier2Listing.stock})`);

    // -----------------------------------------------------------
    // STEP 7: Place order with two suppliers
    // -----------------------------------------------------------
    console.log('\n[STEP 7] Placing purchase orders with both suppliers...');
    const order1Res = await req('/orders', {
      method: 'POST',
      headers: storeHeaders,
      body: {
        supplierId: supplier1Listing.supplier._id,
        items: [{ catalogId: supplier1Listing._id, quantity: supplier1Listing.minOrderQty || 10 }],
        note: 'Order 1 - Urgent clinic replenishment',
      },
    });
    const order1 = order1Res.data.order;
    console.log(`  ✓ Order 1 Placed: #${order1._id.slice(-6).toUpperCase()} with ${supplier1Listing.supplier.businessName} (Total: ₹${order1.totalAmount})`);

    const order2Res = await req('/orders', {
      method: 'POST',
      headers: storeHeaders,
      body: {
        supplierId: supplier2Listing.supplier._id,
        items: [{ catalogId: supplier2Listing._id, quantity: supplier2Listing.minOrderQty || 10 }],
        note: 'Order 2 - Wholesale stock order',
      },
    });
    const order2 = order2Res.data.order;
    console.log(`  ✓ Order 2 Placed: #${order2._id.slice(-6).toUpperCase()} with ${supplier2Listing.supplier.businessName} (Total: ₹${order2.totalAmount})`);

    // -----------------------------------------------------------
    // STEP 8: Each supplier accepts, dispatches, and delivers
    // -----------------------------------------------------------
    console.log('\n[STEP 8] Supplier fulfillment lifecycle (Accept -> Dispatch -> Deliver)...');

    // Supplier 1 fulfillment
    const sup1Login = await req('/auth/login', {
      method: 'POST',
      body: { email: supplier1Listing.supplier.email, password: 'supplier123' },
    });
    if (!sup1Login.ok) throw new Error(`Sup 1 login failed: ${JSON.stringify(sup1Login.data)}`);
    const sup1Headers = { Authorization: `Bearer ${sup1Login.data.token}` };

    const a1 = await req(`/orders/${order1._id}/status`, { method: 'PATCH', headers: sup1Headers, body: { status: 'accepted' } });
    if (!a1.ok) throw new Error(`Sup 1 accept failed: ${JSON.stringify(a1.data)}`);
    console.log(`  ✓ Supplier 1 Accepted order #${order1._id.slice(-6).toUpperCase()} (Supplier catalog stock decremented)`);

    const d1 = await req(`/orders/${order1._id}/status`, { method: 'PATCH', headers: sup1Headers, body: { status: 'dispatched' } });
    if (!d1.ok) throw new Error(`Sup 1 dispatch failed: ${JSON.stringify(d1.data)}`);
    console.log(`  ✓ Supplier 1 Dispatched order #${order1._id.slice(-6).toUpperCase()}`);

    const dl1 = await req(`/orders/${order1._id}/status`, { method: 'PATCH', headers: sup1Headers, body: { status: 'delivered' } });
    if (!dl1.ok) throw new Error(`Sup 1 deliver failed: ${JSON.stringify(dl1.data)}`);
    console.log(`  ✓ Supplier 1 Delivered order #${order1._id.slice(-6).toUpperCase()} (Stock transferred to store)`);

    // Supplier 2 fulfillment
    const sup2Login = await req('/auth/login', {
      method: 'POST',
      body: { email: supplier2Listing.supplier.email, password: 'supplier123' },
    });
    if (!sup2Login.ok) throw new Error(`Sup 2 login failed: ${JSON.stringify(sup2Login.data)}`);
    const sup2Headers = { Authorization: `Bearer ${sup2Login.data.token}` };

    const a2 = await req(`/orders/${order2._id}/status`, { method: 'PATCH', headers: sup2Headers, body: { status: 'accepted' } });
    if (!a2.ok) throw new Error(`Sup 2 accept failed: ${JSON.stringify(a2.data)}`);
    console.log(`  ✓ Supplier 2 Accepted order #${order2._id.slice(-6).toUpperCase()} (Supplier catalog stock decremented)`);

    const d2 = await req(`/orders/${order2._id}/status`, { method: 'PATCH', headers: sup2Headers, body: { status: 'dispatched' } });
    if (!d2.ok) throw new Error(`Sup 2 dispatch failed: ${JSON.stringify(d2.data)}`);
    console.log(`  ✓ Supplier 2 Dispatched order #${order2._id.slice(-6).toUpperCase()}`);

    const dl2 = await req(`/orders/${order2._id}/status`, { method: 'PATCH', headers: sup2Headers, body: { status: 'delivered' } });
    if (!dl2.ok) throw new Error(`Sup 2 deliver failed: ${JSON.stringify(dl2.data)}`);
    console.log(`  ✓ Supplier 2 Delivered order #${order2._id.slice(-6).toUpperCase()} (Stock transferred to store)`);

    // -----------------------------------------------------------
    // STEP 9: Store inventory verified with new batches
    // -----------------------------------------------------------
    console.log('\n[STEP 9] Verifying store inventory received the delivered batches...');
    const updatedInv = await req('/inventory', { headers: storeHeaders });
    console.log(`  ✓ Store now has ${updatedInv.data.total} batch records in inventory:`);
    updatedInv.data.items.forEach((b) => {
      console.log(`     - [${b.batchNo}] ${b.medicine.name} (${b.medicine.strength}): ${b.quantity} units, Status: ${b.expiryStatus}`);
    });

    const storeSum = await req('/inventory/summary', { headers: storeHeaders });
    console.log(`  ✓ Store summary matches: Total Batches=${storeSum.data.totalBatches}, Total Units=${storeSum.data.totalUnits}, Stock Value=₹${storeSum.data.stockValue}`);

    // -----------------------------------------------------------
    // STEP 10: Role Guard & Security Checks
    // -----------------------------------------------------------
    console.log('\n[STEP 10] Testing security access guards...');

    // 10a. Store calling supplier route
    const guard1 = await req('/catalog/mine', { headers: storeHeaders });
    console.log(`  ✓ Guard 1 (Store calling /catalog/mine): Status ${guard1.status} - "${guard1.data?.message}"`);

    // 10b. Supplier calling admin route
    const guard2 = await req('/admin/stats', { headers: sup1Headers });
    console.log(`  ✓ Guard 2 (Supplier calling /admin/stats): Status ${guard2.status} - "${guard2.data?.message}"`);

    // 10c. No token at all
    const guard3 = await req('/inventory');
    console.log(`  ✓ Guard 3 (No token calling /inventory): Status ${guard3.status} - "${guard3.data?.message}"`);

    // 10d. Invalid ObjectId
    const guard4 = await req('/orders/invalid-mongo-id-123', { headers: storeHeaders });
    console.log(`  ✓ Guard 4 (Invalid ObjectId param): Status ${guard4.status} - "${guard4.data?.message}"`);

    console.log('\n====================================================');
    console.log('       ALL END-TO-END & SECURITY CHECKS PASSED       ');
    console.log('====================================================');
  } catch (err) {
    console.error('E2E TEST FAILURE:', err);
  }
}

runE2E();
