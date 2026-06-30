const isProductionStatus = (status) =>
    String(status ?? "").trim() === "production";

module.exports = {
    isProductionStatus,
};
