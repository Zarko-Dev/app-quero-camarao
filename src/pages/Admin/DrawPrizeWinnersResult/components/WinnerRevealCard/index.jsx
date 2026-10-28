import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export const WinnerRevealCard = ({ children, index, animateIn }) => {
    const scale = useRef(new Animated.Value(0.5)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!animateIn) return;
        Animated.sequence([
            Animated.delay(index * 180),
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    tension: 70,
                    friction: 6,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 320,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [animateIn, index]);

    return (
        <Animated.View style={{ opacity, transform: [{ scale }] }}>
            {children}
        </Animated.View>
    );
};
