import { useState, useEffect, useRef, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";
import { disableNetwork, enableNetwork } from "firebase/firestore";
import Toast from "react-native-toast-message";

import { firestoreInstance } from "../../services/Firebase";

export function useInternetConnection(enabled = true) {
    const [isConnected, setIsConnected] = useState(true);
    const offlineTimerRef = useRef(null);
    const qualityToastAtRef = useRef(0);

    const OFFLINE_CONFIRMATION_DELAY_MS = 3000;
    const QUALITY_TOAST_COOLDOWN_MS = 20000;

    const checkConnectionQuality = async () => {
        if (!enabled) {
            return;
        }

        const start = Date.now();
        try {
            await fetch("https://www.google.com", { method: "HEAD" });
            const latency = Date.now() - start;
            const now = Date.now();

            if (now - qualityToastAtRef.current < QUALITY_TOAST_COOLDOWN_MS) {
                return;
            }

            if (latency > 4000) {
                qualityToastAtRef.current = now;
                Toast.show({
                    type: "error",
                    text1: "Conexão com a internet está ruim!",
                    text2: "Isso pode dificultar a utilização da aplicação!",
                });
            } else if (latency > 3000) {
                qualityToastAtRef.current = now;
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
        if (!enabled) {
            return undefined;
        }

        const unsubscribe = NetInfo.addEventListener((state) => {
            const hasConnection =
                state.isConnected === true &&
                state.isInternetReachable !== false;

            if (hasConnection) {
                if (offlineTimerRef.current) {
                    clearTimeout(offlineTimerRef.current);
                    offlineTimerRef.current = null;
                }

                setIsConnected(true);
                checkConnectionQuality();
                return;
            }

            if (!offlineTimerRef.current) {
                offlineTimerRef.current = setTimeout(() => {
                    setIsConnected(false);
                    offlineTimerRef.current = null;
                }, OFFLINE_CONFIRMATION_DELAY_MS);
            }
        });

        return () => {
            if (offlineTimerRef.current) {
                clearTimeout(offlineTimerRef.current);
                offlineTimerRef.current = null;
            }
            unsubscribe();
        };
    }, [enabled]);

    const updateNetwork = useCallback(async () => {
        if (!firestoreInstance || !enabled) {
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
    }, [enabled, isConnected]);

    useEffect(() => {
        updateNetwork();
    }, [updateNetwork]);

    return isConnected;
}