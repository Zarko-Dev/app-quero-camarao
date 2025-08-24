/* eslint-disable no-case-declarations */

import { memo, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { Video, ResizeMode } from "expo-av";

import { Dimensions } from "react-native";
import { dataRoutes } from "../../routes/dataRoutes";

import {
    AdvertisingTag,
    Container,
    ImageAdvertising,
    TextAdvertisingTag,
} from "./styles";
import Carousel from "../SnapCarousel/src";
import { shuffleArray } from "../../utils/shuffleArray";

const RenderItem = memo(({ index, item, handle }) => (
    <Container onPress={handle} key={index}>
        {item.type === "video" ? (
            <Video
                source={{
                    uri: item.imageUrl,
                }}
                style={{
                    width: "100%",
                    height: "100%",
                }}
                resizeMode={ResizeMode.COVER}
                isLooping
                shouldPlay
                isMuted
            />
        ) : (
            <ImageAdvertising
                source={{ uri: item.imageUrl }}
                resizeMode="contain"
            />
        )}
        <AdvertisingTag>
            <TextAdvertisingTag>Publicidade</TextAdvertisingTag>
        </AdvertisingTag>
    </Container>
));

export const AdvertisingCard = memo(({ dataAdvertising }) => {
    const navigation = useNavigation();

    const handleRedirectAdvertisingPage = useCallback(() => {
        navigation.navigate(dataRoutes.adsList);
    }, [navigation]);

    const wp = (percentage) => {
        const Screen = Dimensions.get("window");
        const value = (percentage * Screen.width) / 100;

        return Math.round(value);
    };

    return (
        <Carousel
            data={shuffleArray(dataAdvertising)}
            renderItem={({ index, item }) => (
                <RenderItem
                    item={item}
                    index={index}
                    handle={handleRedirectAdvertisingPage}
                />
            )}
            sliderWidth={wp(100)}
            itemWidth={wp(100)}
            autoplay
            enableMomentum={false}
            lockScrollWhileSnapping
            autoplayInterval={5000}
            loop
            decelerationRate="normal"
        />
    );
});
