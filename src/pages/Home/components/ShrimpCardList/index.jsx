/* eslint-disable operator-linebreak */
import { useMemo, useCallback } from "react";
import { ActivityIndicator, FlatList, Platform } from "react-native";

import { CardPublicationShrimp } from "../../../../components/CardPublicationShrimp";
import { CardPublicationShrimpSkeleton } from "../../../../components/Skeleton/CardPublicationShrimpSkeleton";
import { Ads } from "../Ads";

import { Container, ContentNextLoading, TitleNextEnd } from "./styles";

export const ShrimpCardList = ({
    dataPublication,
    dataAdvertising,
    sharedRef,
    openModal,
    isNextLoading,
    isNestEnd,
    onEndReached,
    isScrolling = false,
    onScrollStart = () => {},
    onScrollEnd = () => {},
}) => {
    const hasDataPublication = dataPublication.length > 0;

    const publicationItens = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
    ];

    const combinedList = useMemo(() => {
        const dataToUse =
            dataPublication.length > 0 ? dataPublication : publicationItens;
        const combined = [];

        dataToUse.forEach((item, index) => {
            combined.push({ ...item, type: "publication" });

            if ((index + 1) % 4 === 0) {
                combined.push({
                    id: `ad_${index}`,
                    type: "ad",
                });
            }
        });

        return combined;
    }, [dataPublication]);

    const renderItem = useCallback(
        ({ item, index }) => {
            if (item.type === "ad") {
                return <Ads />;
            }

            return hasDataPublication ? (
                <CardPublicationShrimp
                    item={item}
                    index={index}
                    dataAdvertising={dataAdvertising}
                    sharedRef={sharedRef}
                    openModal={openModal}
                    isScrolling={isScrolling}
                />
            ) : (
                <CardPublicationShrimpSkeleton />
            );
        },
        [
            hasDataPublication,
            dataAdvertising,
            sharedRef,
            openModal,
            isScrolling,
        ],
    );

    const renderFooter = useCallback(() => {
        if (!isNextLoading && !isNestEnd) return null;

        return (
            <ContentNextLoading>
                {!isNestEnd ? (
                    <ActivityIndicator size="large" color="#F05829" />
                ) : (
                    <TitleNextEnd>Fim das publicações!</TitleNextEnd>
                )}
            </ContentNextLoading>
        );
    }, [isNextLoading, isNestEnd]);

    const keyExtractor = useCallback((item) => item.id.toString(), []);
    return (
        <Container>
            <FlatList
                data={combinedList}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                initialNumToRender={Platform.OS === "android" ? 6 : 10}
                maxToRenderPerBatch={Platform.OS === "android" ? 6 : 12}
                updateCellsBatchingPeriod={Platform.OS === "android" ? 80 : 50}
                windowSize={Platform.OS === "android" ? 9 : 14}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.6}
                ListFooterComponent={renderFooter}
                scrollEventThrottle={16}
                onScrollBeginDrag={onScrollStart}
                onMomentumScrollBegin={onScrollStart}
                onScrollEndDrag={onScrollEnd}
                onMomentumScrollEnd={onScrollEnd}
            />
        </Container>
    );
};
