/* eslint-disable object-curly-newline */
import { collection, doc, getDocs, query, setDoc, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import * as Sentry from "@sentry/react-native";

import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";

export const saveDrawPrizeRules = async (dataRules) => {
    try {
        const drawPrizesDoc = doc(
            firestore,
            models.drawPrizesRules,
            "lR0dLwDArzxmD4Fp9wMK",
        );

        await setDoc(
            drawPrizesDoc,
            {
                rules: dataRules,
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }
};

export const getDrawPrizeRules = async () => {
    try {
        const drawPrizeRef = collection(firestore, models.drawPrizesRules);
        const drawPrizeQuery = query(drawPrizeRef);

        const querySnapshot = await getDocs(drawPrizeQuery);

        const datDrawPrizes = [];

        querySnapshot.forEach((document) => {
            datDrawPrizes.push({
                id: document.id,
                ...document.data(),
            });
        });

        return datDrawPrizes;
    } catch (error) {
        Sentry.captureException(error);

        return [];
    }
};

// pega a nova regra de sorteio
export const getNewDrawPrizeRules = async () => {
    try {
        const drawPrizeRef = collection(firestore, models.newDrawPrizeRules);
        const drawPrizeQuery = query(drawPrizeRef);

        const querySnapshot = await getDocs(drawPrizeQuery);

        const data = [];

        querySnapshot.forEach((document) => {
        data.push({
        firestoreId: document.id,  // ← ID real do Firestore
        ...document.data(),
            });
        });

        return data;
    } catch (error) {
        Sentry.captureException(error);
        return [];
    }
};

export const saveSpecifcDrawPrizeRules = async (dataSpecifcRules) => {
    try {
        const drawPrizesDoc = doc(
            firestore,
            models.drawPrizesRules,
            "lR0dLwDArzxmD4Fp9wMK",
        );

        await setDoc(
            drawPrizesDoc,
            {
                specifcRules: dataSpecifcRules,
            },
            { merge: true },
        );

        return true;
    } catch (error) {
        Sentry.captureException(error);

        return false;
    }


    
};

// Salva a nova regra de sorteio
export const saveUsersDrawPrizeRules = async (ruleData) => {
  try {
    await addDoc(collection(firestore, models.newDrawPrizeRules), {
      id: ruleData.id,
      store: ruleData.store,
      cities: ruleData.cities,
      cpfs: ruleData.cpfs
    })

    return true
  } catch (error) {
    Sentry.captureException(error)
    return false
  }
}
/*exemplo de objeto no firebase 
drawPrizesRules
   └── lR0dLwDArzxmD4Fp9wMK
         └── specificUsersRules
               ├── store
               ├── city
               └── users[] */


// Faz o bloqueio de sorteados pra nao participar mais de sorteio
 export const blockWinners = async (ruleId, updatedCpfs) => {
    try {
        const ruleRef = doc(firestore, models.newDrawPrizeRules, ruleId)
        await updateDoc(ruleRef, { cpfs: updatedCpfs })
        return true
    } catch (error) {
        Sentry.captureException(error)
        return false
    }
}

// Deleta regras. Usado no draw prize new
export const deleteDrawPrizeRule = async (firestoreId) => {
    try {
        await deleteDoc(doc(firestore, models.newDrawPrizeRules, firestoreId))
        return true
    } catch (error) {
        Sentry.captureException(error)
        return false
    }
}
