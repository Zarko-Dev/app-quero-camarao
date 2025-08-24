/* eslint-disable object-curly-newline */
/* eslint-disable operator-linebreak */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { Image } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Video, ResizeMode } from "expo-av";
import { ContainerADS } from "./styles";
import { getAllPublishAdsApproved } from "../../../../controllers/PublishAds/getPublishAds";
import { theme } from "../../../../styles/Theme";
import { useCacheFiles } from "../../../../utils/hooks/useCacheFiles";
import { dataRoutes } from "../../../../routes/dataRoutes";

export const Ads = memo(() => {
    const videoRef = useRef(null);
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [dataADS, setDataADS] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useFocusEffect(
        useCallback(() => {
            const getAds = async () => {
                const publishAds = await getAllPublishAdsApproved();

                if (publishAds) {
                    setDataADS(publishAds.data);
                }

                setLoading(false);
            };

            if (dataADS.length === 0) {
                getAds();
            }
        }, []),
    );

    const cachedFiles = useCacheFiles(dataADS);

    useEffect(() => {
        let timer;

        if (
            !loading &&
            dataADS.length > 0 &&
            dataADS[currentIndex]?.type === "img"
        ) {
            timer = setTimeout(() => {
                setCurrentIndex(
                    (prevIndex) => (prevIndex + 1) % dataADS.length,
                );
            }, 5000);
        }
        return () => clearTimeout(timer);
    }, [currentIndex, loading, dataADS.length]);

    const handlePlaybackStatusUpdate = (status) => {
        if (status.didJustFinish) {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % dataADS.length);
        }
    };

    const currentFile = dataADS[currentIndex];
    const cachedUri = cachedFiles[currentFile?.imageUrl];

    const handleADSListScreen = () => {
        navigation.navigate(dataRoutes.adsList);
    };

    const adsHeight = 150;

    return (
        !loading &&
        dataADS.length > 0 && (
            <ContainerADS height={adsHeight} onPress={handleADSListScreen}>
                {currentFile.type === "img" ? (
                    <Image
                        source={{ uri: cachedUri || currentFile?.imageUrl }}
                        style={{
                            width: "100%",
                            height: Number(
                                theme.size
                                    .componentSize(adsHeight)
                                    .replace("px", ""),
                            ),
                            borderRadius: 5,
                        }}
                        resizeMode="stretch"
                    />
                ) : (
                    <Video
                        ref={videoRef}
                        source={{ uri: cachedUri || currentFile?.imageUrl }}
                        style={{
                            width: "100%",
                            height: Number(
                                theme.size
                                    .componentSize(adsHeight)
                                    .replace("px", ""),
                            ),
                            borderRadius: 5,
                        }}
                        resizeMode={ResizeMode.STRETCH}
                        isLooping={false}
                        shouldPlay
                        isMuted
                        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                        onError={(error) => console.log(error)}
                    />
                )}
            </ContainerADS>
        )
    );
});
