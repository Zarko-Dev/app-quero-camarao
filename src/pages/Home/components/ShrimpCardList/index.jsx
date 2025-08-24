/* eslint-disable operator-linebreak */
import { useMemo, useCallback } from "react";
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

    return (
        <Container>
            <FlatList
                data={combinedList}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                initialNumToRender={5}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                windowSize={10}
                removeClippedSubviews
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                ListFooterComponent={renderFooter}
                getItemLayout={(data, index) => ({
                    length: 200,
                    offset: 200 * index,
                    index,
                })}
            />
        </Container>
    );
};
