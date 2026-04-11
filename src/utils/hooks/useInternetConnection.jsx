import { useState, useEffect, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";
import { disableNetwork, enableNetwork } from "firebase/firestore";
import Toast from "react-native-toast-message";
import { firestoreInstance } from "../../services/Firebase";

export function useInternetConnection(enabled = true) {
    const [isConnected, setIsConnected] = useState(true);

    const checkConnectionQuality = async () => {
        if (!enabled) {
            return;
        }

        const start = Date.now();
        try {
            await fetch("https://www.google.com");
            const latency = Date.now() - start;

            if (latency > 4000) {
                Toast.show({
                    type: "error",
                    text1: "Conexao com a internet esta ruim!",
                    text2: "Isso pode dificultar a utilizacao da aplicacao!",
                });
            } else if (latency > 3000) {
                Toast.show({
                    type: "info",
                    text1: "Conexao com a internet esta moderada!",
                    text2: "Isso pode causar lentidao na aplicacao",
                });
            }
        } catch (error) {
            console.log("Sem conexao");
        }
    };

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        const unsubscribe = NetInfo.addEventListener(async (state) => {
            setIsConnected(state.isConnected);
            checkConnectionQuality();
        });

        return () => unsubscribe();
    }, [enabled]);

    const updateNetwork = useCallback(async () => {
        if (!enabled || !firestoreInstance) {
            return;
        }

        if (isConnected) {
            await enableNetwork(firestoreInstance);
        } else {
            await disableNetwork(firestoreInstance);
        }
    }, [enabled, isConnected]);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        updateNetwork();
    }, [enabled, updateNetwork]);

    return isConnected;
}
