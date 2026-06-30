// Análise de postagens por usuário/mês via Firestore REST
const KEY = "AIzaSyChEI8dVYU5b-aOPcRZ4AxatdlND8_CRhg";
const BASE = "https://firestore.googleapis.com/v1/projects/api-quero-camarao/databases/(default)/documents/shrimpPonds";

let docs = [];
let pageToken = "";
do {
    const url = `${BASE}?pageSize=300&key=${KEY}${pageToken ? `&pageToken=${pageToken}` : ""}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.documents) docs.push(...json.documents);
    pageToken = json.nextPageToken ?? "";
} while (pageToken);

const posts = docs.map((d) => ({
    userId: d.fields?.userId?.stringValue ?? "unknown",
    createdAt: d.fields?.createdAt?.timestampValue ?? null,
})).filter((p) => p.createdAt);

const byUser = {};
const byMonth = {};
const byUserMonth = {};

for (const p of posts) {
    const month = p.createdAt.slice(0, 7);
    byUser[p.userId] = (byUser[p.userId] ?? 0) + 1;
    byMonth[month] = (byMonth[month] ?? 0) + 1;
    const key = `${p.userId}|${month}`;
    byUserMonth[key] = (byUserMonth[key] ?? 0) + 1;
}

const totalPosts = posts.length;
const totalUsers = Object.keys(byUser).length;
const months = Object.keys(byMonth).sort();

// Usuários ativos por mês (postou >= 1)
const activeByMonth = {};
for (const key of Object.keys(byUserMonth)) {
    const [, month] = key.split("|");
    activeByMonth[month] = (activeByMonth[month] ?? 0) + 1;
}

// Média posts/mês por usuário ativo
const avgPerActiveUser = months.map((m) => ({
    month: m,
    posts: byMonth[m],
    activeUsers: activeByMonth[m],
    avg: (byMonth[m] / activeByMonth[m]).toFixed(1),
}));

// Top 15 usuários
const topUsers = Object.entries(byUser).sort((a, b) => b[1] - a[1]).slice(0, 15);

// Últimos 6 meses ativos
const last6 = avgPerActiveUser.slice(-8);

// Usuários ativos recentes (postaram nos últimos 60 dias)
const cutoff = new Date(Date.now() - 60 * 86400000).toISOString();
const recentActive = new Set(posts.filter((p) => p.createdAt >= cutoff).map((p) => p.userId));

console.log(JSON.stringify({
    totalPosts,
    totalUsers,
    firstMonth: months[0],
    lastMonth: months[months.length - 1],
    last8Months: last6,
    topUsers,
    activeUsersLast60Days: recentActive.size,
    recentActiveList: [...recentActive].slice(0, 20),
}, null, 2));
