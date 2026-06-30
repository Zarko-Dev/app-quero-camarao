// Análise de receita real via collection orders
const KEY = "AIzaSyChEI8dVYU5b-aOPcRZ4AxatdlND8_CRhg";
const BASE = "https://firestore.googleapis.com/v1/projects/api-quero-camarao/databases/(default)/documents/orders";

let docs = [];
let pageToken = "";
do {
    const url = `${BASE}?pageSize=300&key=${KEY}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.documents) docs.push(...json.documents);
    pageToken = json.nextPageToken ?? "";
} while (pageToken);

const val = (f) => f?.stringValue ?? f?.integerValue ?? f?.doubleValue ?? f?.booleanValue ?? null;

const orders = docs.map((d) => {
    const f = d.fields ?? {};
    return {
        status: val(f.status),
        value: parseFloat(val(f.paymentValue) ?? 0),
        createdAt: f.createdAt?.timestampValue ?? d.createTime,
        email: val(f.userEmail) ?? val(f.email) ?? (f.user?.mapValue?.fields?.email?.stringValue ?? "?"),
        description: val(f.description) ?? val(f.title) ?? "",
        keys: Object.keys(f).join(","),
    };
});

// primeiro doc raw pra entender estrutura
console.log("SAMPLE KEYS:", orders[0]?.keys);
console.log("TOTAL ORDERS:", orders.length);

const statusCount = {};
orders.forEach((o) => { statusCount[o.status] = (statusCount[o.status] ?? 0) + 1; });
console.log("STATUS:", JSON.stringify(statusCount));

const approved = orders.filter((o) => ["approved", "paid", "pago"].includes(String(o.status).toLowerCase()));
const byMonth = {};
approved.forEach((o) => {
    const m = (o.createdAt ?? "").slice(0, 7);
    if (!byMonth[m]) byMonth[m] = { count: 0, total: 0, emails: new Set() };
    byMonth[m].count++;
    byMonth[m].total += o.value;
    byMonth[m].emails.add(o.email);
});

const months = Object.keys(byMonth).sort().slice(-10);
console.log("\nÚLTIMOS 10 MESES (aprovados):");
months.forEach((m) => {
    const b = byMonth[m];
    console.log(`${m}: ${b.count} pedidos | R$ ${b.total.toFixed(2)} | ${b.emails.size} pagantes únicos`);
});

// valores mais comuns
const valueCount = {};
approved.forEach((o) => { valueCount[o.value] = (valueCount[o.value] ?? 0) + 1; });
console.log("\nVALORES MAIS COMUNS:", JSON.stringify(Object.entries(valueCount).sort((a, b) => b[1] - a[1]).slice(0, 10)));

// pagantes recorrentes
const byEmail = {};
approved.forEach((o) => { byEmail[o.email] = (byEmail[o.email] ?? 0) + 1; });
const repeaters = Object.entries(byEmail).sort((a, b) => b[1] - a[1]).slice(0, 15);
console.log("\nTOP PAGANTES (qtd pedidos):", JSON.stringify(repeaters));
