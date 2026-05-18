const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, orderBy, limit, getDocs } = require('firebase/firestore');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf('=');
    if (idx < 0) continue;
    const key = t.slice(0, idx).trim();
    let value = t.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function currentMonthYear() {
  const d = new Date();
  d.setHours(d.getHours() - 3);
  const month = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(d);
  const year = d.getFullYear();
  return { month, year };
}

(async () => {
  loadEnv();

  const app = initializeApp({
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTHDOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAG_EBUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID,
    measurementId: process.env.MEASUREMENT_ID,
  });

  const db = getFirestore(app);
  const q = query(
    collection(db, 'orders'),
    where('status', '==', 'approved'),
    orderBy('createdAt', 'desc'),
    limit(300)
  );

  const snap = await getDocs(q);
  const rows = snap.docs.map((d) => d.data());
  const { month, year } = currentMonthYear();

  const normalized = rows.map((r) => {
    const createdAt = r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000) : null;
    const dateMonth = createdAt
      ? new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(createdAt)
      : null;
    const dateYear = createdAt ? createdAt.getFullYear() : null;

    return {
      idOrder: r.idOrder,
      hasCreatedAt: !!createdAt,
      hasUserName: !!r.user?.name,
      hasShrimps: Array.isArray(r.dataPublication?.shrimps),
      paymentValueIsNumber: typeof r.paymentValue === 'number',
      inCurrentMonthYear: dateMonth === month && dateYear === year,
    };
  });

  const valid = normalized.filter((r) => r.hasCreatedAt && r.hasUserName && r.hasShrimps && r.paymentValueIsNumber);
  const currentMonthOrders = valid.filter((r) => r.inCurrentMonthYear);

  assert.ok(rows.length >= 0, 'query executada');

  console.log(JSON.stringify({
    totalApprovedFetched: rows.length,
    validForAdminCard: valid.length,
    invalidForAdminCard: normalized.length - valid.length,
    currentMonthOrders: currentMonthOrders.length,
    sampleInvalid: normalized.filter((r) => !(r.hasCreatedAt && r.hasUserName && r.hasShrimps && r.paymentValueIsNumber)).slice(0, 3),
  }, null, 2));
})();
