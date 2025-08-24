/* eslint-disable no-undef */

import ImageResizer from "@bam.tech/react-native-image-resizer";

export const resizeImage = async (uri) => {
    try {
        const resizedImage = await ImageResizer.createResizedImage(
            uri,
            360,
            470,
            "JPEG",
            0.6 * 100,
        );

        return resizedImage.uri;
    } catch (error) {
        console.error("Unexpected erro to resize image:", error);
        return null;
    }
};

export const uriToBlob = async (uri, isVideo) => {
    let resizeUri = uri;

    if (!isVideo) {
        resizeUri = await resizeImage(uri);
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.onload = () => {
            resolve(xhr.response);
        };
        xhr.onerror = () => {
            reject(new Error("uriToBlob failed"));
        };
        xhr.responseType = "blob";

        xhr.open("GET", resizeUri, true);

        xhr.send(null);
    });
};
