// fetch().blob() is unreliable for local URIs on Hermes/Android.
// XHR with responseType='blob' is the reliable alternative.
export const localUriToBlob = (uri, { timeout = 0 } = {}) =>
    new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => resolve(xhr.response);
        xhr.onerror = () => reject(new Error("localUriToBlob: fetch failed"));
        xhr.responseType = "blob";
        if (timeout > 0) {
            xhr.ontimeout = () => reject(new Error("localUriToBlob: timeout"));
            xhr.timeout = timeout;
        }
        xhr.open("GET", uri, true);
        xhr.send(null);
    });
