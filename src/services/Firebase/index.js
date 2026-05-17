/* eslint-disable object-curly-newline */
/* eslint-disable import/no-mutable-exports */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import * as Sentry from "@sentry/react-native";

import {
    getAuth,
    initializeAuth,
    getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { config } from "./config";

let firebaseApp;
let firestore;
let storage;
let firestoreInstance;
const firestoreSettings = {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
};

try {
    if (!getApps().length) {
        firebaseApp = initializeApp(config);
    } else {
        // eslint-disable-next-line prefer-destructuring
        firebaseApp = getApps()[0];
    }

    try {
        initializeAuth(firebaseApp, {
            persistence: getReactNativePersistence(ReactNativeAsyncStorage),
        });
    } catch (authError) {
        getAuth(firebaseApp);
    }

    try {
        firestore = initializeFirestore(firebaseApp, firestoreSettings);
    } catch (firestoreError) {
        firestore = getFirestore(firebaseApp);
    }

    firestoreInstance = firestore;
    storage = getStorage(firebaseApp);
} catch (error) {
    Sentry.captureException(error);

    firebaseApp = null;
    firestore = null;
    storage = null;
    firestoreInstance = null;
}

export { firebaseApp, firestore, storage, firestoreInstance };
