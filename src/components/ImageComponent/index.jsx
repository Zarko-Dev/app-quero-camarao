/* eslint-disable indent */
/* eslint-disable no-use-before-define */

import React, { useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";

import imageEmpty from "../../assets/images/imageEmpty.png";

import { Container, ContainerImage, ContentInfo } from "./styles";
import { theme } from "../../styles/Theme";

export const ImageComponent = ({ uri, resizeMode = "cover", style }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [, setIsImageLoaded] = useState(false);

    const handleLoadStart = () => {
        setIsLoading(true);
        setIsError(false);
        setIsImageLoaded(false);
    };

    const handleLoadEnd = () => {
        setIsLoading(false);
    };

    const handleLoadError = () => {
        setIsError(true);
    };

    const handleLoadComplete = () => {
        setIsImageLoaded(true);
    };

    return (
        <Container>
            <ContentInfo>
                {isLoading && (
                    <ActivityIndicator
                        animating
                        size={30}
                        color={theme.colors.primary}
                    />
                )}
                {isError && (
                    <MaterialIcons
                        name="broken-image"
                        size={30}
                        color={theme.colors.primary}
                    />
                )}
            </ContentInfo>
            <ContainerImage
                source={
                    uri
                        ? {
                              uri,
                          }
                        : imageEmpty
                }
                style={style}
                resizeMode={resizeMode}
                onLoadStart={handleLoadStart}
                onError={handleLoadError}
                onLoad={handleLoadComplete}
                onLoadEnd={handleLoadEnd}
            />
        </Container>
    );
};
