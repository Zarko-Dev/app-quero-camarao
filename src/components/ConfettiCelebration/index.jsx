import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { MAX_DELAY_MS, MIN_DUR_MS, MAX_DUR_MS } from "./constants";

const { width: W, height: H } = Dimensions.get("window");

const PALETTE = [
    "#FFD700", // gold
    "#F05829", // brand orange
    "#FF8C42", // light orange
    "#FFE2CC", // brand cream
    "#FFFFFF", // white
    "#FFC43D", // amber
    "#FF6B35", // deep orange
    "#FFCDA8", // brand tertiary
];

const COUNT = 50;

const makeParticles = () =>
    Array.from({ length: COUNT }, (_, i) => ({
        id: i,
        x: Math.random() * W,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        delay: Math.random() * MAX_DELAY_MS,
        dur: MIN_DUR_MS + Math.random() * (MAX_DUR_MS - MIN_DUR_MS),
        turns: 1 + Math.floor(Math.random() * 4),
    }));

export const ConfettiCelebration = () => {
    const particles = useRef(makeParticles()).current;
    const anims = useRef(
        particles.map(() => ({
            y: new Animated.Value(-60),
            rot: new Animated.Value(0),
            op: new Animated.Value(0),
        })),
    ).current;
    const compositeRef = useRef(null);

    useEffect(() => {
        compositeRef.current = Animated.parallel(
            particles.map((p, i) => {
                const { y, rot, op } = anims[i];
                return Animated.sequence([
                    Animated.delay(p.delay),
                    Animated.parallel([
                        Animated.timing(y, {
                            toValue: H + 60,
                            duration: p.dur,
                            useNativeDriver: true,
                        }),
                        Animated.timing(rot, {
                            toValue: p.turns,
                            duration: p.dur,
                            useNativeDriver: true,
                        }),
                        Animated.sequence([
                            Animated.timing(op, {
                                toValue: 1,
                                duration: 120,
                                useNativeDriver: true,
                            }),
                            Animated.delay(p.dur - 500),
                            Animated.timing(op, {
                                toValue: 0,
                                duration: 380,
                                useNativeDriver: true,
                            }),
                        ]),
                    ]),
                ]);
            }),
        );
        compositeRef.current.start();
        return () => compositeRef.current && compositeRef.current.stop();
    }, []);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {particles.map((p, i) => {
                const rotate = anims[i].rot.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", "360deg"],
                });
                return (
                    <Animated.View
                        key={p.id}
                        style={{
                            position: "absolute",
                            left: p.x,
                            top: -60,
                            width: p.w,
                            height: p.h,
                            backgroundColor: p.color,
                            borderRadius: 1,
                            opacity: anims[i].op,
                            transform: [
                                { translateY: anims[i].y },
                                { rotate },
                            ],
                        }}
                    />
                );
            })}
        </View>
    );
};
