// Aceita Timestamp do Firestore (web: toDate/seconds; RNFB: seconds/_seconds), Date ou ms.
const timestampToDate = (value) => {
    if (!value) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value.toDate === "function") return timestampToDate(value.toDate());
    const seconds = value.seconds ?? value._seconds;
    if (typeof seconds === "number") return new Date(seconds * 1000);
    if (typeof value === "number") return new Date(value);
    return null;
};

module.exports = { timestampToDate };
