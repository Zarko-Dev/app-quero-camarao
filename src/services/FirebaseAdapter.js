/* eslint-disable object-curly-newline */
/* eslint-disable import/no-mutable-exports */
import { onSnapshot as rnfbOnSnapshot } from "@react-native-firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { withSnapshotErrorHandler } from "../utils/snapshotArgs";

export {
    initializeApp,
    getApps,
} from "@react-native-firebase/app";

export {
    getAuth,
    signInWithEmailAndPassword,
    signInWithCustomToken,
    signOut,
    deleteUser,
    sendPasswordResetEmail,
    onAuthStateChanged,
} from "@react-native-firebase/auth";

export {
    getFirestore,
    initializeFirestore,
    serverTimestamp,
    increment,
    arrayUnion,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    disableNetwork,
    enableNetwork,
    limit,
    startAfter,
    startAt,
    endAt,
    endBefore,
    limitToLast,
} from "@react-native-firebase/firestore";

export {
    getStorage,
    ref,
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
} from "@react-native-firebase/storage";

export {
    getFunctions,
    httpsCallable,
} from "@react-native-firebase/functions";

// Ver src/utils/snapshotArgs.js: sem onError, uma regra negada (ex.: sessão
// nativa vazia após o update 2.0.x -> 3.0.x) vira snapshot null no callback
// e fecha o app na abertura (crash "Cannot read property 'docs' of null").
export const onSnapshot = (reference, ...args) => rnfbOnSnapshot(
    reference,
    ...withSnapshotErrorHandler(args, (error) => Sentry.captureException(error)),
);
