const shouldUseTextInputMask = (mask) => {
    if (!mask || typeof mask !== "string") {
        return false;
    }

    return !/^\*+$/.test(mask);
};

module.exports = {
    shouldUseTextInputMask,
};
