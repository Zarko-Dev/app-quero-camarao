import React, { useState, useEffect } from "react";
import { Animated } from "react-native";

import { AnimatedStyleView, Container } from "./styles";

export const Skeleton = ({ StyleSheet }) => {
    const [opacity] = useState(new Animated.Value(1));

    const animateSkeleton = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.5,
                    duration: 500,
                    useNativeDriver: false,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: false,
                }),
            ]),
        ).start();
    };

    useEffect(() => {
        animateSkeleton();
    }, []);

    return (
        <Container>
            <Animated.View
                style={[
                    StyleSheet || AnimatedStyleView,
                    { backgroundColor: "#d9d6d6", opacity },
                ]}
            />
        </Container>
    );
};
