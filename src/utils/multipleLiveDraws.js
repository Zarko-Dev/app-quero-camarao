const DRAW_CODE_MIN = 1;
const DRAW_CODE_MAX = 50;
const DRAW_NAME_MIN = 2;
const DRAW_NAME_MAX = 50;
const DRAW_THEME_MIN = 2;
const DRAW_THEME_MAX = 50;

const validateDrawCode = (code) => {
    if (typeof code !== "string" || code.trim().length === 0) {
        return { valid: false, error: "code_required" };
    }

    const trimmed = code.trim();

    if (trimmed.length < DRAW_CODE_MIN) {
        return { valid: false, error: "code_too_short" };
    }

    if (trimmed.length > DRAW_CODE_MAX) {
        return { valid: false, error: "code_too_long" };
    }

    return { valid: true, value: trimmed };
};

const validateDrawName = (name) => {
    if (typeof name !== "string" || name.trim().length === 0) {
        return { valid: false, error: "name_required" };
    }

    const trimmed = name.trim();

    if (trimmed.length < DRAW_NAME_MIN) {
        return { valid: false, error: "name_too_short" };
    }

    if (trimmed.length > DRAW_NAME_MAX) {
        return { valid: false, error: "name_too_long" };
    }

    return { valid: true, value: trimmed };
};

const validateDrawTheme = (theme) => {
    if (typeof theme !== "string" || theme.trim().length === 0) {
        return { valid: false, error: "theme_required" };
    }

    const trimmed = theme.trim();

    if (trimmed.length < DRAW_THEME_MIN) {
        return { valid: false, error: "theme_too_short" };
    }

    if (trimmed.length > DRAW_THEME_MAX) {
        return { valid: false, error: "theme_too_long" };
    }

    return { valid: true, value: trimmed };
};

const validateDrawCreation = ({ name, theme } = {}) => {
    const nameResult = validateDrawName(name);
    if (!nameResult.valid) {
        return { valid: false, error: nameResult.error };
    }

    const themeResult = validateDrawTheme(theme);
    if (!themeResult.valid) {
        return { valid: false, error: themeResult.error };
    }

    return {
        valid: true,
        value: { name: nameResult.value, theme: themeResult.value },
    };
};

const buildDrawSummary = (doc) => {
    const participants = Array.isArray(doc?.participants)
        ? doc.participants
        : [];
    const winners = Array.isArray(doc?.winners) ? doc.winners : [];
    const fallbackName = Array.isArray(doc?.names) ? doc.names[0] ?? "" : "";

    return {
        id: doc?.id,
        code: doc?.code,
        name: doc?.name ?? fallbackName ?? "",
        theme: doc?.theme ?? "",
        status: Boolean(doc?.status),
        participantsCount: participants.length,
        winnersCount: winners.length,
        createdAtSeconds: doc?.createdAt?.seconds ?? null,
    };
};

const sortDrawsByCreatedDesc = (draws) =>
    [...draws].sort(
        (a, b) => (b?.createdAtSeconds ?? 0) - (a?.createdAtSeconds ?? 0),
    );

const filterActiveDraws = (draws) =>
    draws.filter((draw) => draw?.status === true);

const findDrawById = (draws, id) => {
    if (!id) return null;
    const match = draws.find((draw) => draw?.id === id);
    return match ?? null;
};

const applyDrawNameEdit = (draws, id, newName) => {
    const validation = validateDrawName(newName);

    if (!validation.valid) {
        throw new Error(validation.error);
    }

    const target = findDrawById(draws, id);

    if (!target) {
        throw new Error("draw_not_found");
    }

    return draws.map((draw) =>
        draw.id === id ? { ...draw, name: validation.value } : draw,
    );
};

const applyDrawCodeEdit = (draws, id, newCode) => {
    const validation = validateDrawCode(newCode);

    if (!validation.valid) {
        throw new Error(validation.error);
    }

    const target = findDrawById(draws, id);

    if (!target) {
        throw new Error("draw_not_found");
    }

    return draws.map((draw) =>
        draw.id === id ? { ...draw, code: validation.value } : draw,
    );
};

const applyDrawThemeEdit = (draws, id, newTheme) => {
    const validation = validateDrawTheme(newTheme);

    if (!validation.valid) {
        throw new Error(validation.error);
    }

    const target = findDrawById(draws, id);

    if (!target) {
        throw new Error("draw_not_found");
    }

    return draws.map((draw) =>
        draw.id === id ? { ...draw, theme: validation.value } : draw,
    );
};

module.exports = {
    validateDrawCode,
    validateDrawName,
    validateDrawTheme,
    validateDrawCreation,
    buildDrawSummary,
    sortDrawsByCreatedDesc,
    filterActiveDraws,
    findDrawById,
    applyDrawCodeEdit,
    applyDrawNameEdit,
    applyDrawThemeEdit,
};
