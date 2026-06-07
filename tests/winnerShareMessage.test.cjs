const {
    buildCongratulatoryMessage,
    buildSingleWinnerShareMessage,
    buildWinnersShareMessage,
} = require("../src/utils/winnerShareMessage");

let passed = 0;
let failed = 0;

function assert(condition, label) {
    if (condition) {
        console.log(`  ✅ ${label}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${label}`);
        failed++;
    }
}

// --- buildCongratulatoryMessage ---
console.log("\nbuildCongratulatoryMessage:");

const winner = { name: "João Silva", phone: "11999999999" };
const draw = {
    name: "Sorteio Verão",
    theme: "Praia",
    createdAt: new Date("2026-06-01T14:00:00"),
};

const msg = decodeURIComponent(buildCongratulatoryMessage(winner, draw));
assert(msg.includes("Parabéns João Silva"), "includes winner name");
assert(msg.includes("Sorteio Verão"), "includes draw name");
assert(msg.includes("Praia"), "includes theme");
assert(msg.includes("QUERO CAMARÃO"), "includes brand");
assert(msg.includes("01/06/2026"), "includes formatted date");
assert(msg.startsWith("Parabéns"), "starts with Parabéns");

// no theme
const drawNoTheme = { name: "Sorteio X", createdAt: new Date("2026-01-15T10:30:00") };
const msgNoTheme = decodeURIComponent(buildCongratulatoryMessage(winner, drawNoTheme));
assert(!msgNoTheme.includes(", ,"), "no double comma when theme missing");
assert(msgNoTheme.includes("Sorteio X"), "draw name present without theme");

// no phone — should still build message
const noPhone = { name: "Maria" };
const msgNoPhone = decodeURIComponent(buildCongratulatoryMessage(noPhone, draw));
assert(msgNoPhone.includes("Parabéns Maria"), "works without phone field");

// null winner fallback
const msgNull = decodeURIComponent(buildCongratulatoryMessage(null, draw));
assert(msgNull.includes("Participante"), "fallback name when winner is null");

// --- buildSingleWinnerShareMessage ---
console.log("\nbuildSingleWinnerShareMessage:");

const winnerWithDraw = { name: "João Silva", phone: "11999999999", drawName: "Sorteio Verão", cpf: "12345678901", city: "Fortaleza", state: "CE" };
const single = buildSingleWinnerShareMessage(winnerWithDraw, "https://app.link");
assert(single.includes("Vencedor(a): João Silva"), "includes winner name label");
assert(single.includes("Sorteio: Sorteio Verão"), "includes Sorteio label");
assert(single.includes("11999999999"), "includes phone digits");
assert(single.includes("https://app.link"), "includes app link");

// no app link
const singleNoLink = buildSingleWinnerShareMessage(winnerWithDraw, "");
assert(!singleNoLink.includes("Acompanhe"), "no app link block when empty");

// --- buildWinnersShareMessage ---
console.log("\nbuildWinnersShareMessage:");

const winners = [
    { name: "João Silva", phone: "11999999999", drawName: "Sorteio A", city: "Fortaleza", state: "CE", cpf: "12345678901" },
    { name: "Ana Lima", phone: "85988887777", drawName: "Sorteio A", city: "Recife", state: "PE", cpf: "98765432100" },
    { name: "Carlos", phone: "21999990000", drawName: "Sorteio B", city: "Rio", state: "RJ", cpf: "11122233344" },
];

const many = buildWinnersShareMessage(winners, "https://link");
assert(many.includes("Sorteio A"), "grouped draw A");
assert(many.includes("Sorteio B"), "grouped draw B");
assert(many.includes("João Silva"), "first winner");
assert(many.includes("Ana Lima"), "second winner");
assert(many.includes("Carlos"), "third winner in different draw");
assert(many.includes("https://link"), "app link included");

const single2 = buildWinnersShareMessage([winners[0]]);
assert(single2.includes("Vencedor"), "singular label for one winner");

// empty
const empty = buildWinnersShareMessage([]);
assert(typeof empty === "string", "returns string for empty array");

// --- summary ---
console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
