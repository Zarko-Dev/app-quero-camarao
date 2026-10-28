const test = require("node:test");
const assert = require("node:assert/strict");

const { buildMessagePreview } = require("../src/utils/messagePreview");

test("preview de localizacao", () => {
    assert.equal(buildMessagePreview({ location: { lat: 1, lng: 2 } }), "📍 Localização");
});
