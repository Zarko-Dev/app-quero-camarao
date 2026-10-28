const fs = require("fs");
const path = require("path");
const { handlePublicacao, extractId, buildMeta, renderPage } = require("./publicacao");

const pub = {
    location: "Jaguaruana/CE",
    ponds: 1,
    shrimps: [{ grammage: "40", kilo: "1100", imageShrimpUri: "https://firebasestorage.googleapis.com/x.jpg" }],
};
const dbWith = (data) => ({ collection: () => ({ doc: () => ({ get: async () => ({ exists: !!data, data: () => data }) }) }) });
const run = async (url, data) => {
    const out = {};
    const res = {
        set: () => res, status: (c) => { out.status = c; return res; }, type: () => res, send: (b) => { out.body = b; return res; },
    };
    await handlePublicacao({ path: url }, res, dbWith(data));
    return out;
};

test("template da function == página do hosting", () => {
    const a = fs.readFileSync(path.join(__dirname, "publicacaoTemplate.html"), "utf8");
    const b = fs.readFileSync(path.join(__dirname, "../../public/publicacao/index.html"), "utf8");
    expect(a).toBe(b);
});

test("extractId", () => {
    expect(extractId("/publicacao/abc-1")).toBe("abc-1");
    expect(extractId("/publicacao/")).toBeNull();
    expect(extractId('/publicacao/"><x')).toBeNull();
});

test("OG específico: título, descrição, imagem, url", () => {
    const m = buildMeta("p1", pub);
    expect(m.title).toBe("Camarão 40g - 1100 kg - Jaguaruana/CE");
    expect(m.description).toContain("Viveiros: 1");
    expect(m.image).toBe("https://querocamarao.com.br/publicacao/p1/og.png");
    expect(m.url).toBe("https://querocamarao.com.br/publicacao/p1");
});

test("sem foto cai na imagem padrão; vários viveiros juntam", () => {
    const m = buildMeta("p1", { location: "X/CE", shrimps: [{ grammage: "20", kilo: "10" }, { grammage: "30", kilo: "5" }] });
    expect(m.image).toBe("https://querocamarao.com.br/publicacao/p1/og.png");
    expect(m.title).toBe("Camarão 20g/30g - 10 kg / 5 kg - X/CE");
});

test("publicação existente: 200 com OG no HTML e página rica preservada", async () => {
    const r = await run("/publicacao/p1", pub);
    expect(r.status).toBe(200);
    expect(r.body).toContain('og:title" content="Camarão 40g - 1100 kg - Jaguaruana/CE"');
    expect(r.body).toContain("openApp");
    expect(r.body).toContain(".map(fieldValue)");
});

test("inexistente: 404 com OG genérico", async () => {
    const r = await run("/publicacao/nada", null);
    expect(r.status).toBe(404);
    expect(r.body).toContain("Camarão disponível no Quero Camarão");
});

test("XSS: campos são escapados e `$&` não é interpretado", () => {
    const html = renderPage("p1", { location: '"><script>alert(1)</script>$&', shrimps: [{ grammage: "1", kilo: "2" }] });
    expect(html).not.toContain("<script>alert(1)");
    expect(html).toContain("&lt;script&gt;");
});
