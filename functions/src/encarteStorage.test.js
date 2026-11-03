const { handleEncarteWrite, relevantKey, encartePath, encarteUrl } = require("./encarteStorage");

const pub = { location: "Jaguaruana/CE", ponds: 1, shrimps: [{ grammage: "40", kilo: "1100" }] };
const mkBucket = () => {
    const file = { save: jest.fn(async () => {}), delete: jest.fn(async () => {}) };
    return { file: jest.fn(() => file), _file: file };
};
const ev = (before, after) => ({ params: { id: "p1" }, data: { before: { data: () => before }, after: { data: () => after } } });

test("criação gera e salva PNG em encartes/<id>.png", async () => {
    const bucket = mkBucket();
    await handleEncarteWrite(ev(undefined, pub), bucket);
    expect(bucket.file).toHaveBeenCalledWith("encartes/p1.png");
    const [buf, opts] = bucket._file.save.mock.calls[0];
    expect(buf.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBe(true);
    expect(opts.contentType).toBe("image/png");
});

test("mudança irrelevante (views) não regera", async () => {
    const bucket = mkBucket();
    await handleEncarteWrite(ev(pub, { ...pub, views: 9 }), bucket);
    expect(bucket._file.save).not.toHaveBeenCalled();
});

test("mudança de quantidade regera", async () => {
    const bucket = mkBucket();
    await handleEncarteWrite(ev(pub, { ...pub, shrimps: [{ grammage: "40", kilo: "900" }] }), bucket);
    expect(bucket._file.save).toHaveBeenCalledTimes(1);
});

test("vendida não gera", async () => {
    const bucket = mkBucket();
    await handleEncarteWrite(ev(undefined, { ...pub, sold: true }), bucket);
    expect(bucket._file.save).not.toHaveBeenCalled();
});

test("doc apagado remove o PNG", async () => {
    const bucket = mkBucket();
    await handleEncarteWrite(ev(pub, undefined), bucket);
    expect(bucket._file.delete).toHaveBeenCalledWith({ ignoreNotFound: true });
});

test("falha ao salvar não lança (não reprocessa o evento)", async () => {
    const bucket = mkBucket();
    bucket._file.save.mockRejectedValue(new Error("boom"));
    await expect(handleEncarteWrite(ev(undefined, pub), bucket)).resolves.toBeNull();
});

test("helpers", () => {
    expect(encartePath("a")).toBe("encartes/a.png");
    expect(encarteUrl("b", "a")).toBe("https://firebasestorage.googleapis.com/v0/b/b/o/encartes%2Fa.png?alt=media");
    expect(relevantKey(pub)).toBe(relevantKey({ ...pub, views: 3 }));
});
