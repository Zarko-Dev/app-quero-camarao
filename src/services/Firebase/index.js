/* eslint-disable object-curly-newline */
/* eslint-disable import/no-mutable-exports */

import { initializeApp, getApps } from "@react-native-firebase/app";
import { getFirestore } from "@react-native-firebase/firestore";
import { getStorage } from "@react-native-firebase/storage";
import { getFunctions } from "@react-native-firebase/functions";
import * as Sentry from "@sentry/react-native";

import { reportDiscordError } from "../DiscordAlerts/context";
import { config } from "./config";

let firebaseApp;
let firestore;
let storage;
let firestoreInstance;
let functions;
let firebaseReadyPromise;

const initializeFirebase = async () => {
    try {
        if (!getApps().length) {
            firebaseApp = await initializeApp(config);
        } else {
            firebaseApp = getApps()[0];
        }

        firestore = getFirestore(firebaseApp);
        firestoreInstance = firestore;
        storage = getStorage(firebaseApp);
        functions = getFunctions(firebaseApp, "us-central1");

        return {
            firebaseApp,
            firestore,
            storage,
            firestoreInstance,
            functions,
        };
    } catch (error) {
        console.error("DEBUG ERROR IN FIREBASE INIT:", error);
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

        throw error;
    }
};

firebaseReadyPromise = initializeFirebase();

const ensureFirebaseReady = async () => {
    if (!firebaseReadyPromise) {
        firebaseReadyPromise = initializeFirebase();
    }

    return firebaseReadyPromise;
};

export { firebaseApp, firestore, storage, firestoreInstance, functions, ensureFirebaseReady };
