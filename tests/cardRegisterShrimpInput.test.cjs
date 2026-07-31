const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const filePath = path.join(
    __dirname,
    "..",
    "src",
    "components",
    "CardRegisterShrimp",
    "index.jsx",
);

const fileContent = fs.readFileSync(filePath, "utf8");

test("CardRegisterShrimp keeps sanitizeDecimalInput import for kilo field", () => {
    assert.ok(
        fileContent.includes(
            'import { sanitizeDecimalInput } from "../../utils/sanitizeDecimalInput";',
        ),
    );
    assert.ok(fileContent.includes("setKilo(sanitizeDecimalInput(value, 1));"));
});
