import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { FlatList, ScrollView } from "react-native";

import { getAllPublishAdsInAnalysis } from "../../../controllers/PublishAds/getPublishAds";

import { CardAds } from "./components/CardAds";
import { CardAdsSkeleton } from "../../../components/Skeleton/cardAdsSkeleton";

import { Container } from "./styles";

export const ListPublishAds = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [dataAds, setDataAds] = useState([]);
    const [reload, setReload] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const getdata = async () => {
                setIsLoading(true);

                const resultData = await getAllPublishAdsInAnalysis();

                if (!resultData.error) {
                    setDataAds(resultData.data);
                } else {
                    Toast.show({
                        type: "success",
                        text1: "Não há publicidades para aprovar!",
                    });

                    setDataAds([]);
                }

                setIsLoading(false);
            };

            getdata();
        }, [reload]),
    );

    const showSkeleton = () => {
        const dataSkeleton = [1, 2, 3, 4, 5];

        return dataSkeleton.map((item) => <CardAdsSkeleton key={item} />);
    };

    return (
        <Container>
            {!isLoading ? (
                <FlatList
                    data={dataAds}
                    renderItem={({ item }) => (
                        <CardAds
                            dataUserAds={item}
                            reload={reload}
                            actionReload={setReload}
                        />
                    )}
                    keyExtractor={(item) => item.id}
                />
            ) : (
                <ScrollView>{showSkeleton()}</ScrollView>
            )}
        </Container>
    );
};
