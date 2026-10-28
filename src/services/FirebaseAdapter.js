/* eslint-disable object-curly-newline */
/* eslint-disable import/no-mutable-exports */

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
    onSnapshot,
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
