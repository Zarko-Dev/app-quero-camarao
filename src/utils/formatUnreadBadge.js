const formatUnreadBadge = (count) => {
    const n = Number(count);
    if (!Number.isFinite(n) || n <= 0) return "";
    if (n > 99) return "99+";
    return String(n);
};

module.exports = { formatUnreadBadge };
