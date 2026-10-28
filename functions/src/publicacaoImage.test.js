const { handlePublicacaoImage, extractImageId, renderPng } = require("./publicacaoImage");

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const pub = { location: "Jaguaruana/CE", ponds: 1, shrimps: [{ grammage: "40", kilo: "1100" }] };
const dbWith = (data) => ({ collection: () => ({ doc: () => ({ get: async () => ({ exists: !!data, data: () => data }) }) }) });
const mkRes = () => {
    const res = { headers: {} };
    res.set = (k, v) => { res.headers[k] = v; return res; };
    res.status = (c) => { res.code = c; return res; };
    res.type = (t) => { res.ctype = t; return res; };
    res.send = (b) => { res.body = b; return res; };
    res.redirect = (c, u) => { res.code = c; res.location = u; return res; };
    return res;
};

test("extractImageId", () => {
    expect(extractImageId("/publicacao/abc_1-X/og.png")).toBe("abc_1-X");
    expect(extractImageId("/publicacao/abc")).toBeNull();
    expect(extractImageId("/publicacao/../og.png")).toBeNull();
});

test("renderPng gera PNG 1200x630", () => {
    const png = renderPng(pub, null);
    expect(png.subarray(0, 4).equals(PNG_MAGIC)).toBe(true);
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
});

test("renderPng escapa XSS/markup em campos", () => {
    expect(() => renderPng({ ...pub, location: "<script>&\"'" }, null)).not.toThrow();
});

test("handler: existente 200 png com cache longo", async () => {
    const res = mkRes();
    await handlePublicacaoImage({ path: "/publicacao/abc/og.png" }, res, dbWith(pub));
    expect(res.code).toBe(200);
    expect(res.ctype).toBe("png");
    expect(res.headers["Cache-Control"]).toContain("max-age=86400");
});

test("handler: inexistente redireciona pro og-image.png", async () => {
    const res = mkRes();
    await handlePublicacaoImage({ path: "/publicacao/nao/og.png" }, res, dbWith(null));
    expect(res.code).toBe(302);
    expect(res.location).toBe("https://querocamarao.com.br/og-image.png");
});

test("handler: erro de leitura cai no fallback", async () => {
    const res = mkRes();
    const db = { collection: () => { throw new Error("boom"); } };
    await handlePublicacaoImage({ path: "/publicacao/abc/og.png" }, res, db);
    expect(res.code).toBe(302);
});
