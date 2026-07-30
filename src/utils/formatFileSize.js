const formatFileSize = (bytes) => {
    const n = Number(bytes);
    if (!Number.isFinite(n) || n <= 0) return "";
    if (n < 1024) return `${Math.floor(n)} B`;
    const kb = n / 1024;
    if (kb < 1024) return `${kb.toFixed(1).replace(".", ",")} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1).replace(".", ",")} MB`;
};

module.exports = { formatFileSize };
