import * as ExpoCrypto from "expo-crypto";

if (typeof globalThis.crypto !== "object" || globalThis.crypto == null) {
    globalThis.crypto = {};
}

if (typeof globalThis.crypto.getRandomValues !== "function") {
    if (typeof ExpoCrypto.getRandomValues === "function") {
        globalThis.crypto.getRandomValues = ExpoCrypto.getRandomValues;
    } else if (typeof ExpoCrypto.getRandomBytes === "function") {
        globalThis.crypto.getRandomValues = (typedArray) => {
            const bytes = ExpoCrypto.getRandomBytes(typedArray.byteLength);
            typedArray.set(bytes);
            return typedArray;
        };
    }
}
