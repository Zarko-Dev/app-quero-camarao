export function navigateWhenReady(
    navigationRef,
    routeName,
    params,
    { timeoutMs = 3000 } = {},
) {
    return new Promise((resolve, reject) => {
        if (navigationRef.isReady()) {
            navigationRef.navigate(routeName, params);
            resolve();
            return;
        }

        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error(`navigateWhenReady timed out after ${timeoutMs}ms waiting for navigationRef`));
        }, timeoutMs);

        const unsubscribe = navigationRef.addListener("state", () => {
            if (navigationRef.isReady()) {
                cleanup();
                navigationRef.navigate(routeName, params);
                resolve();
            }
        });

        const cleanup = () => {
            clearTimeout(timeout);
            unsubscribe();
        };
    });
}
