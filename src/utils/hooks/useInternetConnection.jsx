import { useState, useEffect, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";
import { disableNetwork, enableNetwork } from "firebase/firestore";
import Toast from "react-native-toast-message";
import { firestoreInstance } from "../../services/Firebase";

export function useInternetConnection() {
    const [isConnected, setIsConnected] = useState(true);

    const checkConnectionQuality = async () => {
        const start = Date.now();
        try {
            await fetch("https://www.google.com");
            const latency = Date.now() - start;

            if (latency > 4000) {
                Toast.show({
                    type: "error",
                    text1: "Conexão com a internet está ruim!",
                    text2: "Isso pode dificultar a utilização da aplicação!",
                });
            } else if (latency > 3000) {
                Toast.show({
                    type: "info",
                    text1: "Conexão com a internet está moderada!",
                    text2: "Isso pode causar lentidão na aplicação",
                });
            }
        } catch (error) {
            console.log("Sem conexão");
        }
    };

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(async (state) => {
            const connected =
                Boolean(state.isConnected) &&
                state.isInternetReachable !== false;
            setIsConnected(connected);
            checkConnectionQuality();
        });

        return () => unsubscribe();
    }, []);

    const updateNetwork = useCallback(async () => {
        if (!firestoreInstance) {
            return;
        }

        try {
            if (isConnected) {
                await enableNetwork(firestoreInstance);
            } else {
                await disableNetwork(firestoreInstance);
            }
        } catch (error) {
            console.log("Falha ao atualizar rede do Firestore:", error);
        }
    }, [isConnected]);

    useEffect(() => {
        updateNetwork();
    }, [updateNetwork]);

    return isConnected;
}
