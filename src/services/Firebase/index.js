/* eslint-disable object-curly-newline */
/* eslint-disable import/no-mutable-exports */

import { initializeApp, getApps } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import * as Sentry from "@sentry/react-native";

import {
    getAuth,
    initializeAuth,
    getReactNativePersistence,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { reportDiscordError } from "../DiscordAlerts/context";
import { config } from "./config";

let firebaseApp;
let firestore;
let storage;
let firestoreInstance;
let functions;
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
    functions = getFunctions(firebaseApp, "us-central1");
} catch (error) {
    Sentry.captureException(error);
    void reportDiscordError({
        source: "firebase.bootstrap",
        error,
        feature: "firebase",
        action: "initialize",
        extra: { region: "us-central1" },
    });

    firebaseApp = null;
    firestore = null;
    storage = null;
    firestoreInstance = null;
    functions = null;
}

export { firebaseApp, firestore, storage, firestoreInstance, functions };
