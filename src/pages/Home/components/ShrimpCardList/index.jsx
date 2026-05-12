/* eslint-disable operator-linebreak */
import { useMemo, useCallback, useRef } from "react";
import { ActivityIndicator, FlatList } from "react-native";

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
}) => {
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
        ({ item }) => {
            if (item.type === "ad") {
                return <Ads />;
            }

            return dataPublication.length > 0 ? (
                <CardPublicationShrimp
                    item={item}
                    dataAdvertising={dataAdvertising}
                    sharedRef={sharedRef}
                    openModal={openModal}
                />
            ) : (
                <CardPublicationShrimpSkeleton />
            );
        },
        [dataPublication, dataAdvertising, sharedRef, openModal],
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
    const viewabilityConfigRef = useRef({
        itemVisiblePercentThreshold: 40,
    });

    const onViewableItemsChanged = useCallback(
        ({ viewableItems }) => {
            if (!viewableItems?.length) return;

            let maxIndex = -1;
            viewableItems.forEach((viewable) => {
                if (
                    typeof viewable.index === "number" &&
                    viewable.index > maxIndex
                ) {
                    maxIndex = viewable.index;
                }
            });

            if (maxIndex >= combinedList.length - 8) {
                onEndReached();
            }
        },
        [combinedList.length, onEndReached],
    );

    return (
        <Container>
            <FlatList
                data={combinedList}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={12}
                updateCellsBatchingPeriod={50}
                windowSize={14}
                removeClippedSubviews
                onEndReached={onEndReached}
                onEndReachedThreshold={0.9}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfigRef.current}
                ListFooterComponent={renderFooter}
            />
        </Container>
    );
};
