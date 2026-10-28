// Lógica pura de papel admim reutilizada no gate admin de cupons.
// CommonJS para permitir teste direto via node --test (sem Firebase nativo).
const isAdminRole = (rules) => {
    if (Array.isArray(rules)) {
        return rules.includes("Admin") || rules.includes("admin");
    }

    return rules === "Admin" || rules === "admin";
};

module.exports = { isAdminRole };
