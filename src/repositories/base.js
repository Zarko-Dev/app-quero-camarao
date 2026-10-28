import {
    collection,
    doc,
} from "../services/FirebaseAdapter";
import { firestore } from "../services/Firebase";

export const getCollection = (collectionName) => collection(firestore, collectionName);

export const docRef = (collectionName, documentId) => doc(firestore, collectionName, documentId);
