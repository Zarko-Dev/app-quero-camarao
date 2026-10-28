export const VIEW_DEDUP_WINDOW_MS = 30 * 60 * 1000;

const getMillis = (value) => {
    if (!value) return 0;
    if (typeof value.toMillis === "function") return value.toMillis();
    if (typeof value.seconds === "number") return value.seconds * 1000;
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
};

export const wasRecentlyViewedBy = (viewerId, existingViews, now = Date.now()) =>
    (Array.isArray(existingViews) ? existingViews : []).some(
        (view) => view?.userId === viewerId && now - getMillis(view?.createdAt) < VIEW_DEDUP_WINDOW_MS,
    );
