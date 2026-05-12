import { useState, useEffect, useRef } from "react";
import NetInfo from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";

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
                    text1: "Conexao com a internet esta ruim!",
                    text2: "Isso pode dificultar a utilizacao da aplicacao!",
                });
            } else if (latency > 3000) {
                qualityToastAtRef.current = now;
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

    return isConnected;
}
