/* eslint-disable no-case-declarations */
import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { FlatList, ScrollView } from "react-native";

import { dataRoutes } from "../../routes/dataRoutes";
import { getUserPublishAds } from "../../controllers/PublishAds/getPublishAds";
import { GetUserStorage } from "../../services/Storage/UserStorage";

import { CardAds } from "./components/CardAds";
import { CardAdsSkeleton } from "../../components/Skeleton/cardAdsSkeleton";

import {
    ButtonNewAds,
    Container,
    EmptyContainer,
    EmptyText,
    TextButton,
} from "./styles";

export const MyAds = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [dataUserAds, setDataUserAds] = useState([]);
    const [reload, setReload] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const getData = async () => {
                setIsLoading(true);

                const dataUser = await GetUserStorage();

                const dataPublishAds = await getUserPublishAds(dataUser.email);

                if (!dataPublishAds.error) {
                    setDataUserAds(dataPublishAds.data);
                } else {
                    Toast.show({
                        type: "success",
                        text1: "Não há publicidades listadas!",
                    });

                    setDataUserAds([]);
                }

                setIsLoading(false);
            };

            getData();
        }, [reload]),
    );

    const handleRedirectRegisterAds = () => {
        navigation.navigate(dataRoutes.registerMyAds);
    };

    const showSkeleton = () => {
        const dataSkeleton = [1, 2, 3, 4, 5];

        return dataSkeleton.map((item) => <CardAdsSkeleton key={item} />);
    };

    return (
        <Container>
            {!isLoading ? (
                <>
                    <FlatList
                        data={dataUserAds}
                        renderItem={({ item }) => (
                            <CardAds
                                dataUserAds={item}
                                reload={reload}
                                actionReload={setReload}
                            />
                        )}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ flexGrow: 1 }}
                        ListEmptyComponent={(
                            <EmptyContainer>
                                <EmptyText>
                                    Você ainda não tem publicidades. Toque em
                                    &quot;Solicitar publicidade&quot; para criar a primeira.
                                </EmptyText>
                            </EmptyContainer>
                        )}
                    />
                    <ButtonNewAds onPress={handleRedirectRegisterAds}>
                        <TextButton>Solicitar publicidade</TextButton>
                    </ButtonNewAds>
                </>
            ) : (
                <ScrollView>{showSkeleton()}</ScrollView>
            )}
        </Container>
    );
};
