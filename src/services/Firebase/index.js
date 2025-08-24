/* eslint-disable object-curly-newline */
/* eslint-disable import/no-mutable-exports */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import * as Sentry from "@sentry/react-native";

import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { config } from "./config";

let firebaseApp;
let firestore;
let storage;
let firestoreInstance;

try {
    if (!getApps.length) {
        firebaseApp = initializeApp(config);

        initializeAuth(firebaseApp, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage),
        });

        firestore = initializeFirestore(firebaseApp, {
            experimentalForceLongPolling: true,
        });

        firestoreInstance = getFirestore(firebaseApp);

        storage = getStorage(firebaseApp);
    } else {
        firestore = null;
        firestoreInstance = null;
    }
} catch (error) {
    Sentry.captureException(error);

    firestore = null;
    storage = null;
    firestoreInstance = null;
}

export { firebaseApp, firestore, storage, firestoreInstance };
