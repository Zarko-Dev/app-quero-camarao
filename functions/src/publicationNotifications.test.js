const { buildPublicationBody, handlePublicationCreated } = require("./publicationNotifications");

describe("buildPublicationBody", () => {
    test("single shrimp", () => {
        expect(buildPublicationBody({ location: "Jaguaruana/CE", shrimps: [{ kilo: "1100", grammage: "40" }] }))
            .toBe("1100 kg de camarão de 40g foi publicado em Jaguaruana/CE");
    });
    test("sums kg, lists grammages", () => {
        expect(buildPublicationBody({ location: "A/CE", shrimps: [{ kilo: 100, grammage: 40 }, { kilo: 50, grammage: 60 }] }))
            .toBe("150 kg de camarão de 40/60g foi publicado em A/CE");
    });
});

describe("handlePublicationCreated", () => {
    const users = [
        { id: "pub@a.com", notification: { token: "ExponentPushToken[p]" } },
        { id: "u1@a.com", notification: { token: "ExponentPushToken[1]" } },
        { id: "u2@a.com", notification: { token: "ExponentPushToken[1]" } },
        { id: "u3@a.com" },
    ];
    const db = { collection: () => ({ select: () => ({ get: async () => ({ docs: users.map((u) => ({ id: u.id, data: () => u })) }) }) }) };

    test("skips publisher, dedups tokens, sends deep link payload", async () => {
        global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ data: [] }) }));
        const event = { params: { publicationId: "p1" }, data: { data: () => ({ userId: "pub@a.com", location: "X/CE", shrimps: [{ kilo: 10, grammage: 30 }] }) } };
        expect(await handlePublicationCreated(event, db)).toEqual({ sent: 1 });
        const sent = JSON.parse(global.fetch.mock.calls[0][1].body);
        expect(sent).toHaveLength(1);
        expect(sent[0].to).toBe("ExponentPushToken[1]");
        expect(sent[0].data).toEqual({ type: "publication", publicationId: "p1" });
    });
});
