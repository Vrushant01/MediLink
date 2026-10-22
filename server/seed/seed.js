import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Medicine from '../models/Medicine.js';
import Inventory from '../models/Inventory.js';
import Catalog from '../models/Catalog.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';

dotenv.config();

// Helper to calculate future or past date relative to current time
const getDateOffset = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// Seed database with users, medicines, catalogs, and realistic pharmacy inventory batches
const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/medilink';
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('Connected to database.');

    // 1. Clear existing collections
    console.log('Clearing existing records...');
    await User.deleteMany({});
    await Medicine.deleteMany({});
    await Inventory.deleteMany({});
    await Catalog.deleteMany({});
    await Order.deleteMany({});
    await Notification.deleteMany({});

    // 2. Create Users
    console.log('Creating users...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@medilink.test',
      password: 'admin123',
      role: 'admin',
      approved: true,
    });

    const supplier1 = await User.create({
      name: 'Ramesh Patel',
      businessName: 'Shree Ganesh Pharma Distributors',
      email: 'ganesh@medilink.test',
      password: 'supplier123',
      role: 'supplier',
      phone: '+91 98250 11223',
      address: 'Plot 42, GIDC Phase 2, Vatva',
      city: 'Ahmedabad',
      licenseNumber: 'GJ-AHM-20B-10492',
      approved: true,
    });

    const supplier2 = await User.create({
      name: 'Pravin Shah',
      businessName: 'Navkar Medico Supplies',
      email: 'navkar@medilink.test',
      password: 'supplier123',
      role: 'supplier',
      phone: '+91 98251 33445',
      address: 'Shop 12, Ring Road Trade Center',
      city: 'Surat',
      licenseNumber: 'GJ-SUR-20B-22819',
      approved: true,
    });

    const supplier3 = await User.create({
      name: 'Vikram Desai',
      businessName: 'Aarogya Wholesale Traders',
      email: 'aarogya@medilink.test',
      password: 'supplier123',
      role: 'supplier',
      phone: '+91 98252 55667',
      address: '88 Alkapuri Commercial Complex',
      city: 'Vadodara',
      licenseNumber: 'GJ-BRD-20B-33901',
      approved: true,
    });

    const store1 = await User.create({
      name: 'Bhavik Shah',
      businessName: 'Jay Ambe Medical Store',
      email: 'jayambe@medilink.test',
      password: 'store123',
      role: 'store',
      phone: '+91 97123 44556',
      address: 'Shop 4, Sector 11 Shopping Center',
      city: 'Gandhinagar',
      licenseNumber: 'GJ-GNR-20C-44120',
      approved: true,
    });

    const store2 = await User.create({
      name: 'Dr. Kirit Mehta',
      businessName: 'Healthfirst Chemist',
      email: 'healthfirst@medilink.test',
      password: 'store123',
      role: 'store',
      phone: '+91 97234 88990',
      address: 'GF-2, Navrangpura Cross Road',
      city: 'Ahmedabad',
      licenseNumber: 'GJ-AHM-20C-55891',
      approved: true,
    });

    const unapprovedStore = await User.create({
      name: 'Nilesh Joshi',
      businessName: 'Kalyan Medical & General Store',
      email: 'kalyan@medilink.test',
      password: 'store123',
      role: 'store',
      phone: '+91 98790 66778',
      address: 'Station Road, Opp. Civil Hospital',
      city: 'Rajkot',
      licenseNumber: 'GJ-RJK-20C-66712',
      approved: false,
    });

    // 3. Create 30 Realistic Indian Medicines
    console.log('Seeding 30 master medicines...');
    const medicinesData = [
      { name: 'Dolo 650', genericName: 'Paracetamol', category: 'Painkiller', manufacturer: 'Micro Labs', strength: '650mg', form: 'Tablet' },
      { name: 'Crocin 500', genericName: 'Paracetamol', category: 'Painkiller', manufacturer: 'GlaxoSmithKline', strength: '500mg', form: 'Tablet' },
      { name: 'Azithral 500', genericName: 'Azithromycin', category: 'Antibiotic', manufacturer: 'Alembic Pharmaceuticals', strength: '500mg', form: 'Tablet' },
      { name: 'Pantocid 40', genericName: 'Pantoprazole', category: 'Antacid', manufacturer: 'Sun Pharma', strength: '40mg', form: 'Tablet' },
      { name: 'Metformin 500', genericName: 'Metformin Hydrochloride', category: 'Diabetes', manufacturer: 'USV Ltd', strength: '500mg', form: 'Tablet' },
      { name: 'Amlodipine 5', genericName: 'Amlodipine Besylate', category: 'Cardiovascular', manufacturer: 'Cipla', strength: '5mg', form: 'Tablet' },
      { name: 'Cetirizine 10', genericName: 'Cetirizine Hydrochloride', category: 'Antiallergic', manufacturer: "Dr. Reddy's Laboratories", strength: '10mg', form: 'Tablet' },
      { name: 'Ecosprin 75', genericName: 'Aspirin', category: 'Cardiovascular', manufacturer: 'USV Ltd', strength: '75mg', form: 'Tablet' },
      { name: 'Shelcal 500', genericName: 'Calcium 500mg + Vitamin D3', category: 'Nutritional', manufacturer: 'Torrent Pharma', strength: '500mg', form: 'Tablet' },
      { name: 'Digene Gel', genericName: 'Magnesium Hydroxide + Aluminium Hydroxide', category: 'Antacid', manufacturer: 'Abbott Healthcare', strength: '200ml', form: 'Syrup' },
      { name: 'Electral ORS', genericName: 'Oral Rehydration Salts', category: 'Electrolyte', manufacturer: 'FDC Ltd', strength: '21.8g', form: 'Syrup' },
      { name: 'Augmentin 625 Duo', genericName: 'Amoxicillin + Clavulanic Acid', category: 'Antibiotic', manufacturer: 'GlaxoSmithKline', strength: '625mg', form: 'Tablet' },
      { name: 'Telma 40', genericName: 'Telmisartan', category: 'Cardiovascular', manufacturer: 'Glenmark Pharmaceuticals', strength: '40mg', form: 'Tablet' },
      { name: 'Pan 40', genericName: 'Pantoprazole', category: 'Antacid', manufacturer: 'Alkem Laboratories', strength: '40mg', form: 'Tablet' },
      { name: 'Glycomet GP 1', genericName: 'Glimepiride + Metformin', category: 'Diabetes', manufacturer: 'USV Ltd', strength: '1mg/500mg', form: 'Tablet' },
      { name: 'Montek LC', genericName: 'Montelukast + Levocetirizine', category: 'Respiratory', manufacturer: 'Sun Pharma', strength: '10mg/5mg', form: 'Tablet' },
      { name: 'Combiflam', genericName: 'Ibuprofen + Paracetamol', category: 'Painkiller', manufacturer: 'Sanofi India', strength: '400mg/325mg', form: 'Tablet' },
      { name: 'Becosules', genericName: 'B-Complex Forte with Vitamin C', category: 'Nutritional', manufacturer: 'Pfizer India', strength: 'Forte', form: 'Capsule' },
      { name: 'Omez 20', genericName: 'Omeprazole', category: 'Antacid', manufacturer: "Dr. Reddy's Laboratories", strength: '20mg', form: 'Capsule' },
      { name: 'Calpol 650', genericName: 'Paracetamol', category: 'Painkiller', manufacturer: 'GlaxoSmithKline', strength: '650mg', form: 'Tablet' },
      { name: 'Cifran 500', genericName: 'Ciprofloxacin', category: 'Antibiotic', manufacturer: 'Sun Pharma', strength: '500mg', form: 'Tablet' },
      { name: 'Atorva 10', genericName: 'Atorvastatin', category: 'Cardiovascular', manufacturer: 'Zydus Cadila', strength: '10mg', form: 'Tablet' },
      { name: 'Betadine 5%', genericName: 'Povidone Iodine', category: 'Antiseptic', manufacturer: 'Win-Medicare', strength: '5% w/w', form: 'Ointment' },
      { name: 'Ascoril LS', genericName: 'Levosalbutamol + Ambroxol', category: 'Respiratory', manufacturer: 'Glenmark Pharmaceuticals', strength: '100ml', form: 'Syrup' },
      { name: 'Moxikind-CV 625', genericName: 'Amoxicillin + Clavulanic Acid', category: 'Antibiotic', manufacturer: 'Mankind Pharma', strength: '625mg', form: 'Tablet' },
      { name: 'Voveran 50', genericName: 'Diclofenac Sodium', category: 'Painkiller', manufacturer: 'Novartis India', strength: '50mg', form: 'Tablet' },
      { name: 'Allegra 120', genericName: 'Fexofenadine Hydrochloride', category: 'Antiallergic', manufacturer: 'Sanofi India', strength: '120mg', form: 'Tablet' },
      { name: 'Zocon 150', genericName: 'Fluconazole', category: 'Antifungal', manufacturer: 'FDC Ltd', strength: '150mg', form: 'Tablet' },
      { name: 'Gelusil MPS', genericName: 'Aluminium Hydroxide + Dimethicone', category: 'Antacid', manufacturer: 'Pfizer India', strength: '170ml', form: 'Syrup' },
      { name: 'Novomix 30', genericName: 'Insulin Aspart 30/70', category: 'Diabetes', manufacturer: 'Novo Nordisk', strength: '100IU/ml', form: 'Injection' },
    ];

    const medicines = await Medicine.insertMany(medicinesData);
    console.log(`Created ${medicines.length} medicines.`);

    // 4. Create Supplier Catalogs (13-14 items per supplier with INR pricing)
    console.log('Seeding supplier catalogs...');
    const catalogEntries = [
      // Supplier 1: Shree Ganesh Pharma (14 medicines: Antibiotics, Painkillers, Antacids)
      { supplier: supplier1._id, medicine: medicines[0]._id, price: 26.50, stock: 450, minOrderQty: 10, batchNo: 'S1-DL-801', expiryDate: getDateOffset(420) }, // Dolo 650
      { supplier: supplier1._id, medicine: medicines[1]._id, price: 18.00, stock: 300, minOrderQty: 10, batchNo: 'S1-CR-802', expiryDate: getDateOffset(390) }, // Crocin 500
      { supplier: supplier1._id, medicine: medicines[2]._id, price: 98.00, stock: 220, minOrderQty: 5, batchNo: 'S1-AZ-803', expiryDate: getDateOffset(500) }, // Azithral 500
      { supplier: supplier1._id, medicine: medicines[3]._id, price: 115.00, stock: 180, minOrderQty: 5, batchNo: 'S1-PC-804', expiryDate: getDateOffset(460) }, // Pantocid 40
      { supplier: supplier1._id, medicine: medicines[6]._id, price: 16.50, stock: 500, minOrderQty: 20, batchNo: 'S1-CT-805', expiryDate: getDateOffset(550) }, // Cetirizine 10
      { supplier: supplier1._id, medicine: medicines[9]._id, price: 130.00, stock: 120, minOrderQty: 4, batchNo: 'S1-DG-806', expiryDate: getDateOffset(360) }, // Digene Gel
      { supplier: supplier1._id, medicine: medicines[11]._id, price: 175.00, stock: 140, minOrderQty: 5, batchNo: 'S1-AG-807', expiryDate: getDateOffset(480) }, // Augmentin 625
      { supplier: supplier1._id, medicine: medicines[13]._id, price: 108.00, stock: 200, minOrderQty: 5, batchNo: 'S1-PN-808', expiryDate: getDateOffset(430) }, // Pan 40
      { supplier: supplier1._id, medicine: medicines[16]._id, price: 34.00, stock: 350, minOrderQty: 10, batchNo: 'S1-CB-809', expiryDate: getDateOffset(510) }, // Combiflam
      { supplier: supplier1._id, medicine: medicines[19]._id, price: 27.00, stock: 400, minOrderQty: 10, batchNo: 'S1-CP-810', expiryDate: getDateOffset(450) }, // Calpol 650
      { supplier: supplier1._id, medicine: medicines[20]._id, price: 42.00, stock: 190, minOrderQty: 10, batchNo: 'S1-CF-811', expiryDate: getDateOffset(470) }, // Cifran 500
      { supplier: supplier1._id, medicine: medicines[22]._id, price: 92.00, stock: 110, minOrderQty: 5, batchNo: 'S1-BT-812', expiryDate: getDateOffset(540) }, // Betadine 5%
      { supplier: supplier1._id, medicine: medicines[24]._id, price: 165.00, stock: 160, minOrderQty: 5, batchNo: 'S1-MX-813', expiryDate: getDateOffset(490) }, // Moxikind-CV
      { supplier: supplier1._id, medicine: medicines[25]._id, price: 48.00, stock: 280, minOrderQty: 10, batchNo: 'S1-VV-814', expiryDate: getDateOffset(520) }, // Voveran 50

      // Supplier 2: Navkar Medico Supplies (14 medicines: Cardio, Diabetes, Nutrition, Respiratory)
      { supplier: supplier2._id, medicine: medicines[4]._id, price: 19.50, stock: 600, minOrderQty: 15, batchNo: 'S2-MF-901', expiryDate: getDateOffset(450) }, // Metformin 500
      { supplier: supplier2._id, medicine: medicines[5]._id, price: 28.00, stock: 400, minOrderQty: 10, batchNo: 'S2-AM-902', expiryDate: getDateOffset(490) }, // Amlodipine 5
      { supplier: supplier2._id, medicine: medicines[7]._id, price: 8.50, stock: 750, minOrderQty: 25, batchNo: 'S2-EC-903', expiryDate: getDateOffset(580) }, // Ecosprin 75
      { supplier: supplier2._id, medicine: medicines[8]._id, price: 88.00, stock: 320, minOrderQty: 10, batchNo: 'S2-SC-904', expiryDate: getDateOffset(440) }, // Shelcal 500
      { supplier: supplier2._id, medicine: medicines[12]._id, price: 145.00, stock: 250, minOrderQty: 5, batchNo: 'S2-TL-905', expiryDate: getDateOffset(510) }, // Telma 40
      { supplier: supplier2._id, medicine: medicines[14]._id, price: 95.00, stock: 280, minOrderQty: 10, batchNo: 'S2-GL-906', expiryDate: getDateOffset(460) }, // Glycomet GP 1
      { supplier: supplier2._id, medicine: medicines[15]._id, price: 138.00, stock: 210, minOrderQty: 5, batchNo: 'S2-MN-907', expiryDate: getDateOffset(430) }, // Montek LC
      { supplier: supplier2._id, medicine: medicines[17]._id, price: 38.00, stock: 450, minOrderQty: 10, batchNo: 'S2-BC-908', expiryDate: getDateOffset(530) }, // Becosules
      { supplier: supplier2._id, medicine: medicines[18]._id, price: 46.00, stock: 340, minOrderQty: 10, batchNo: 'S2-OM-909', expiryDate: getDateOffset(470) }, // Omez 20
      { supplier: supplier2._id, medicine: medicines[21]._id, price: 78.00, stock: 220, minOrderQty: 10, batchNo: 'S2-AT-910', expiryDate: getDateOffset(520) }, // Atorva 10
      { supplier: supplier2._id, medicine: medicines[23]._id, price: 94.00, stock: 150, minOrderQty: 6, batchNo: 'S2-AS-911', expiryDate: getDateOffset(380) }, // Ascoril LS
      { supplier: supplier2._id, medicine: medicines[26]._id, price: 122.00, stock: 180, minOrderQty: 5, batchNo: 'S2-AL-912', expiryDate: getDateOffset(480) }, // Allegra 120
      { supplier: supplier2._id, medicine: medicines[27]._id, price: 36.00, stock: 290, minOrderQty: 10, batchNo: 'S2-ZC-913', expiryDate: getDateOffset(500) }, // Zocon 150
      { supplier: supplier2._id, medicine: medicines[29]._id, price: 620.00, stock: 75, minOrderQty: 2, batchNo: 'S2-NV-914', expiryDate: getDateOffset(300) }, // Novomix 30

      // Supplier 3: Aarogya Wholesale Traders (14 medicines: High volume essentials)
      { supplier: supplier3._id, medicine: medicines[0]._id, price: 27.00, stock: 520, minOrderQty: 10, batchNo: 'S3-DL-701', expiryDate: getDateOffset(450) }, // Dolo 650
      { supplier: supplier3._id, medicine: medicines[2]._id, price: 99.50, stock: 190, minOrderQty: 5, batchNo: 'S3-AZ-702', expiryDate: getDateOffset(480) }, // Azithral 500
      { supplier: supplier3._id, medicine: medicines[3]._id, price: 116.00, stock: 220, minOrderQty: 5, batchNo: 'S3-PC-703', expiryDate: getDateOffset(490) }, // Pantocid 40
      { supplier: supplier3._id, medicine: medicines[4]._id, price: 20.00, stock: 450, minOrderQty: 10, batchNo: 'S3-MF-704', expiryDate: getDateOffset(520) }, // Metformin 500
      { supplier: supplier3._id, medicine: medicines[7]._id, price: 9.00, stock: 600, minOrderQty: 20, batchNo: 'S3-EC-705', expiryDate: getDateOffset(540) }, // Ecosprin 75
      { supplier: supplier3._id, medicine: medicines[8]._id, price: 89.00, stock: 310, minOrderQty: 10, batchNo: 'S3-SC-706', expiryDate: getDateOffset(460) }, // Shelcal 500
      { supplier: supplier3._id, medicine: medicines[10]._id, price: 18.50, stock: 500, minOrderQty: 20, batchNo: 'S3-EL-707', expiryDate: getDateOffset(580) }, // Electral ORS
      { supplier: supplier3._id, medicine: medicines[11]._id, price: 178.00, stock: 130, minOrderQty: 5, batchNo: 'S3-AG-708', expiryDate: getDateOffset(470) }, // Augmentin 625
      { supplier: supplier3._id, medicine: medicines[16]._id, price: 35.00, stock: 380, minOrderQty: 10, batchNo: 'S3-CB-709', expiryDate: getDateOffset(480) }, // Combiflam
      { supplier: supplier3._id, medicine: medicines[17]._id, price: 39.50, stock: 400, minOrderQty: 10, batchNo: 'S3-BC-710', expiryDate: getDateOffset(550) }, // Becosules
      { supplier: supplier3._id, medicine: medicines[22]._id, price: 93.00, stock: 125, minOrderQty: 5, batchNo: 'S3-BT-711', expiryDate: getDateOffset(500) }, // Betadine 5%
      { supplier: supplier3._id, medicine: medicines[23]._id, price: 96.00, stock: 140, minOrderQty: 6, batchNo: 'S3-AS-712', expiryDate: getDateOffset(420) }, // Ascoril LS
      { supplier: supplier3._id, medicine: medicines[26]._id, price: 124.00, stock: 170, minOrderQty: 5, batchNo: 'S3-AL-713', expiryDate: getDateOffset(460) }, // Allegra 120
      { supplier: supplier3._id, medicine: medicines[28]._id, price: 110.00, stock: 210, minOrderQty: 6, batchNo: 'S3-GL-714', expiryDate: getDateOffset(410) }, // Gelusil MPS
    ];

    await Catalog.insertMany(catalogEntries);
    console.log(`Created ${catalogEntries.length} catalog listings across 3 suppliers.`);

    // 5. Create Store Inventories
    // Requirement:
    // Each store gets 18 to 22 inventory batches.
    // Spread expiry dates on purpose so EVERY status shows up:
    // - 2 already expired
    // - 3 to 4 expiring within 30 days
    // - 4 to 5 expiring in 31 to 90 days
    // - the rest safe (6 to 24 months away)
    // - Make 3 to 4 items below their reorderLevel
    // - Some medicines should have 2 batches with different expiry dates (to demo FEFO later).
    console.log('Seeding store inventory batches with distributed expiry dates...');

    // Function to generate 20 realistic batches for a store
    const generateStoreInventory = (storeId, prefix) => [
      // 1-2. EXPIRED (2 batches)
      {
        store: storeId,
        medicine: medicines[1]._id, // Crocin 500
        batchNo: `${prefix}-CR-EXP1`,
        quantity: 14,
        expiryDate: getDateOffset(-45),
        purchasePrice: 18.00,
        mrp: 23.50,
        reorderLevel: 25,
        rack: 'A1',
      },
      {
        store: storeId,
        medicine: medicines[10]._id, // Electral ORS
        batchNo: `${prefix}-EL-EXP2`,
        quantity: 8,
        expiryDate: getDateOffset(-12),
        purchasePrice: 18.50,
        mrp: 24.00,
        reorderLevel: 30,
        rack: 'A3',
      },

      // 3-6. CRITICAL: EXPIRING WITHIN 30 DAYS (4 batches)
      {
        store: storeId,
        medicine: medicines[0]._id, // Dolo 650 (Batch 1 of 2 - Near Expiry for FEFO)
        batchNo: `${prefix}-DL-CRT1`,
        quantity: 35,
        expiryDate: getDateOffset(11),
        purchasePrice: 26.50,
        mrp: 34.00,
        reorderLevel: 30,
        rack: 'A1',
      },
      {
        store: storeId,
        medicine: medicines[3]._id, // Pantocid 40 (Batch 1 of 2 - Near Expiry for FEFO)
        batchNo: `${prefix}-PC-CRT2`,
        quantity: 6, // Low stock: below reorderLevel (20)
        expiryDate: getDateOffset(18),
        purchasePrice: 115.00,
        mrp: 155.00,
        reorderLevel: 20,
        rack: 'B2',
      },
      {
        store: storeId,
        medicine: medicines[6]._id, // Cetirizine 10
        batchNo: `${prefix}-CT-CRT3`,
        quantity: 22,
        expiryDate: getDateOffset(24),
        purchasePrice: 16.50,
        mrp: 22.00,
        reorderLevel: 25,
        rack: 'C1',
      },
      {
        store: storeId,
        medicine: medicines[18]._id, // Omez 20
        batchNo: `${prefix}-OM-CRT4`,
        quantity: 4, // Low stock: below reorderLevel (15)
        expiryDate: getDateOffset(29),
        purchasePrice: 46.00,
        mrp: 62.00,
        reorderLevel: 15,
        rack: 'B1',
      },

      // 7-11. WARNING: EXPIRING IN 31 TO 90 DAYS (5 batches)
      {
        store: storeId,
        medicine: medicines[2]._id, // Azithral 500 (Batch 1 of 2)
        batchNo: `${prefix}-AZ-WRN1`,
        quantity: 18,
        expiryDate: getDateOffset(42),
        purchasePrice: 98.00,
        mrp: 132.00,
        reorderLevel: 20,
        rack: 'D1',
      },
      {
        store: storeId,
        medicine: medicines[5]._id, // Amlodipine 5
        batchNo: `${prefix}-AM-WRN2`,
        quantity: 5, // Low stock: below reorderLevel (25)
        expiryDate: getDateOffset(56),
        purchasePrice: 28.00,
        mrp: 38.00,
        reorderLevel: 25,
        rack: 'C2',
      },
      {
        store: storeId,
        medicine: medicines[13]._id, // Pan 40
        batchNo: `${prefix}-PN-WRN3`,
        quantity: 40,
        expiryDate: getDateOffset(68),
        purchasePrice: 108.00,
        mrp: 145.00,
        reorderLevel: 20,
        rack: 'B2',
      },
      {
        store: storeId,
        medicine: medicines[16]._id, // Combiflam
        batchNo: `${prefix}-CB-WRN4`,
        quantity: 75,
        expiryDate: getDateOffset(81),
        purchasePrice: 34.00,
        mrp: 46.00,
        reorderLevel: 30,
        rack: 'A2',
      },
      {
        store: storeId,
        medicine: medicines[23]._id, // Ascoril LS
        batchNo: `${prefix}-AS-WRN5`,
        quantity: 7, // Low stock: below reorderLevel (15)
        expiryDate: getDateOffset(88),
        purchasePrice: 94.00,
        mrp: 125.00,
        reorderLevel: 15,
        rack: 'E1',
      },

      // 12-20. SAFE: EXPIRING IN 6 TO 24 MONTHS (9 batches)
      {
        store: storeId,
        medicine: medicines[0]._id, // Dolo 650 (Batch 2 of 2 - Safe batch for FEFO demonstration)
        batchNo: `${prefix}-DL-SAF1`,
        quantity: 120,
        expiryDate: getDateOffset(400),
        purchasePrice: 26.50,
        mrp: 34.00,
        reorderLevel: 30,
        rack: 'A1',
      },
      {
        store: storeId,
        medicine: medicines[3]._id, // Pantocid 40 (Batch 2 of 2 - Safe batch for FEFO demonstration)
        batchNo: `${prefix}-PC-SAF2`,
        quantity: 80,
        expiryDate: getDateOffset(520),
        purchasePrice: 115.00,
        mrp: 155.00,
        reorderLevel: 20,
        rack: 'B2',
      },
      {
        store: storeId,
        medicine: medicines[2]._id, // Azithral 500 (Batch 2 of 2 - Safe batch)
        batchNo: `${prefix}-AZ-SAF3`,
        quantity: 50,
        expiryDate: getDateOffset(480),
        purchasePrice: 98.00,
        mrp: 132.00,
        reorderLevel: 20,
        rack: 'D1',
      },
      {
        store: storeId,
        medicine: medicines[4]._id, // Metformin 500
        batchNo: `${prefix}-MF-SAF4`,
        quantity: 95,
        expiryDate: getDateOffset(380),
        purchasePrice: 19.50,
        mrp: 27.00,
        reorderLevel: 30,
        rack: 'C3',
      },
      {
        store: storeId,
        medicine: medicines[7]._id, // Ecosprin 75
        batchNo: `${prefix}-EC-SAF5`,
        quantity: 150,
        expiryDate: getDateOffset(600),
        purchasePrice: 8.50,
        mrp: 12.00,
        reorderLevel: 40,
        rack: 'C2',
      },
      {
        store: storeId,
        medicine: medicines[8]._id, // Shelcal 500
        batchNo: `${prefix}-SC-SAF6`,
        quantity: 65,
        expiryDate: getDateOffset(460),
        purchasePrice: 88.00,
        mrp: 118.00,
        reorderLevel: 25,
        rack: 'D2',
      },
      {
        store: storeId,
        medicine: medicines[11]._id, // Augmentin 625
        batchNo: `${prefix}-AG-SAF7`,
        quantity: 45,
        expiryDate: getDateOffset(500),
        purchasePrice: 175.00,
        mrp: 235.00,
        reorderLevel: 15,
        rack: 'D1',
      },
      {
        store: storeId,
        medicine: medicines[17]._id, // Becosules
        batchNo: `${prefix}-BC-SAF8`,
        quantity: 110,
        expiryDate: getDateOffset(450),
        purchasePrice: 38.00,
        mrp: 52.00,
        reorderLevel: 30,
        rack: 'D3',
      },
      {
        store: storeId,
        medicine: medicines[22]._id, // Betadine 5%
        batchNo: `${prefix}-BT-SAF9`,
        quantity: 35,
        expiryDate: getDateOffset(550),
        purchasePrice: 92.00,
        mrp: 122.00,
        reorderLevel: 10,
        rack: 'E2',
      },
    ];

    const store1Batches = generateStoreInventory(store1._id, 'JA');
    const store2Batches = generateStoreInventory(store2._id, 'HF');

    await Inventory.insertMany([...store1Batches, ...store2Batches]);
    console.log(`Created ${store1Batches.length + store2Batches.length} inventory batches across 2 stores.`);

    // 6. Seed Sample B2B Purchase Orders (9 orders spread across 5 months)
    console.log('Seeding sample B2B orders with diverse statuses and history...');
    const getPastDate = (daysAgo) => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      return d;
    };

    const sampleOrders = [
      {
        store: store1._id,
        supplier: supplier1._id,
        status: 'delivered',
        items: [
          { medicine: medicines[0]._id, quantity: 50, price: 26.50, batchNo: 'S1-DL-801', expiryDate: getDateOffset(420) },
          { medicine: medicines[2]._id, quantity: 20, price: 98.00, batchNo: 'S1-AZ-803', expiryDate: getDateOffset(500) },
        ],
        totalAmount: 3285.00,
        createdAt: getPastDate(140),
      },
      {
        store: store2._id,
        supplier: supplier2._id,
        status: 'delivered',
        items: [
          { medicine: medicines[4]._id, quantity: 60, price: 19.50, batchNo: 'S2-MF-901', expiryDate: getDateOffset(450) },
          { medicine: medicines[8]._id, quantity: 40, price: 88.00, batchNo: 'S2-SC-904', expiryDate: getDateOffset(440) },
        ],
        totalAmount: 4690.00,
        createdAt: getPastDate(110),
      },
      {
        store: store1._id,
        supplier: supplier3._id,
        status: 'delivered',
        items: [
          { medicine: medicines[10]._id, quantity: 50, price: 18.50, batchNo: 'S3-EL-707', expiryDate: getDateOffset(580) },
          { medicine: medicines[16]._id, quantity: 40, price: 35.00, batchNo: 'S3-CB-709', expiryDate: getDateOffset(480) },
        ],
        totalAmount: 2325.00,
        createdAt: getPastDate(75),
      },
      {
        store: store2._id,
        supplier: supplier1._id,
        status: 'delivered',
        items: [
          { medicine: medicines[11]._id, quantity: 25, price: 175.00, batchNo: 'S1-AG-807', expiryDate: getDateOffset(480) },
          { medicine: medicines[3]._id, quantity: 30, price: 115.00, batchNo: 'S1-PC-804', expiryDate: getDateOffset(460) },
        ],
        totalAmount: 7825.00,
        createdAt: getPastDate(45),
      },
      {
        store: store1._id,
        supplier: supplier2._id,
        status: 'delivered',
        items: [
          { medicine: medicines[5]._id, quantity: 50, price: 28.00, batchNo: 'S2-AM-902', expiryDate: getDateOffset(490) },
          { medicine: medicines[15]._id, quantity: 20, price: 138.00, batchNo: 'S2-MN-907', expiryDate: getDateOffset(430) },
        ],
        totalAmount: 4160.00,
        createdAt: getPastDate(15),
      },
      {
        store: store2._id,
        supplier: supplier3._id,
        status: 'dispatched',
        items: [
          { medicine: medicines[22]._id, quantity: 20, price: 93.00, batchNo: 'S3-BT-711', expiryDate: getDateOffset(500) },
          { medicine: medicines[28]._id, quantity: 25, price: 110.00, batchNo: 'S3-GL-714', expiryDate: getDateOffset(410) },
        ],
        totalAmount: 4610.00,
        createdAt: getPastDate(4),
      },
      {
        store: store1._id,
        supplier: supplier1._id,
        status: 'accepted',
        items: [
          { medicine: medicines[1]._id, quantity: 30, price: 18.00, batchNo: 'S1-CR-802', expiryDate: getDateOffset(390) },
          { medicine: medicines[6]._id, quantity: 40, price: 16.50, batchNo: 'S1-CT-805', expiryDate: getDateOffset(550) },
        ],
        totalAmount: 1200.00,
        createdAt: getPastDate(2),
      },
      {
        store: store2._id,
        supplier: supplier2._id,
        status: 'rejected',
        note: 'Rejected: Insufficient logistics capacity on this transit route',
        items: [
          { medicine: medicines[29]._id, quantity: 10, price: 620.00, batchNo: 'S2-NV-914', expiryDate: getDateOffset(300) },
        ],
        totalAmount: 6200.00,
        createdAt: getPastDate(8),
      },
      {
        store: store1._id,
        supplier: supplier3._id,
        status: 'placed',
        items: [
          { medicine: medicines[0]._id, quantity: 25, price: 27.00, batchNo: 'S3-DL-701', expiryDate: getDateOffset(450) },
          { medicine: medicines[7]._id, quantity: 50, price: 9.00, batchNo: 'S3-EC-705', expiryDate: getDateOffset(540) },
        ],
        totalAmount: 1125.00,
        createdAt: getPastDate(1),
      },
    ];

    const seededOrders = await Order.insertMany(sampleOrders);
    console.log(`Created ${seededOrders.length} sample B2B purchase orders.`);

    // 7. Print Summary
    console.log('\n=============================================================');
    console.log('              MEDILINK SEED SUMMARY COMPLETED               ');
    console.log('=============================================================');
    console.log('\nUSER ACCOUNTS CREATED:');
    console.log('-------------------------------------------------------------');
    console.log('1. Admin:');
    console.log('   Email:    admin@medilink.test');
    console.log('   Password: admin123');
    console.log('   Status:   Approved');
    console.log('\n2. Approved Suppliers (3):');
    console.log('   - Shree Ganesh Pharma Distributors (Ahmedabad)');
    console.log('     Email: ganesh@medilink.test | Pass: supplier123');
    console.log('   - Navkar Medico Supplies (Surat)');
    console.log('     Email: navkar@medilink.test | Pass: supplier123');
    console.log('   - Aarogya Wholesale Traders (Vadodara)');
    console.log('     Email: aarogya@medilink.test | Pass: supplier123');
    console.log('\n3. Approved Medical Stores (2):');
    console.log('   - Jay Ambe Medical Store (Gandhinagar)');
    console.log('     Email: jayambe@medilink.test | Pass: store123');
    console.log('   - Healthfirst Chemist (Ahmedabad)');
    console.log('     Email: healthfirst@medilink.test | Pass: store123');
    console.log('\n4. Unapproved Medical Store (For testing admin approval):');
    console.log('   - Kalyan Medical & General Store (Rajkot)');
    console.log('     Email: kalyan@medilink.test | Pass: store123');
    console.log('     Status: PENDING ADMIN APPROVAL (approved: false)');
    console.log('\nCATALOG & INVENTORY:');
    console.log('-------------------------------------------------------------');
    console.log(`- Master Medicines:       ${medicines.length} formulations`);
    console.log(`- Supplier Catalog Items:  ${catalogEntries.length} listings (14 per supplier)`);
    console.log(`- Store Inventory Batches: ${store1Batches.length + store2Batches.length} batches (20 per store)`);
    console.log(`- B2B Purchase Orders:    ${seededOrders.length} historical orders (5 delivered, 1 accepted, 1 dispatched, 1 rejected, 1 placed)`);
    console.log('  Per store batch expiry profile:');
    console.log('    • Expired:             2 batches (< 0 days)');
    console.log('    • Critical:            4 batches (1 - 30 days)');
    console.log('    • Warning:             5 batches (31 - 90 days)');
    console.log('    • Safe:                9 batches (180 - 700 days)');
    console.log('    • Low stock (< level): 4 batches');
    console.log('    • Multi-batch FEFO:    Dolo 650, Pantocid 40, Azithral 500');
    console.log('=============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding MediLink database:', error);
    process.exit(1);
  }
};

seedDatabase();
