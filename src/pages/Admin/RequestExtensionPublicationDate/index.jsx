import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";

import { getAnalisysPublications } from "../../../controllers/Publication/getUserPublications";
import { GetUserStorage } from "../../../services/Storage/UserStorage";

import { MyShrimpCardList } from "./components/MyShrimpCardList";

import { Container, ContentEmptyList, TitleEmptyList } from "./styles";

export const RequestExtensionPublicationDate = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [dataPublication, setDataPublication] = useState([]);

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);

            GetUserStorage()
                .then((dataUser) => {
                    if (dataUser) {
                        getAnalisysPublications()
                            .then((resultPublications) => {
                                if (!resultPublications.error) {
                                    setDataPublication(resultPublications.data);
                                } else {
                                    Toast.show({
                                        type: "error",
                                        text1: "Erro ao buscar suas publicações!",
                                        text2: "Tente novamente em instantes!",
                                    });
                                }
                            })
                            .catch()
                            .finally(() => {
                                setIsLoading(false);
                            });
                    } else {
                        setIsLoading(false);

                        Toast.show({
                            type: "error",
                            text1: "Usuário não encontrado!",
                            text2: "Reinicie o aplicativo e tente novamente!",
                        });
                    }
                })
                .catch();
        }, []),
    );

    return (
        <Container>
            {dataPublication.length > 0 ? (
                <MyShrimpCardList
                    dataPublication={dataPublication}
                    isLoading={isLoading}
                    actionDataPublication={setDataPublication}
                />
            ) : (
                <ContentEmptyList>
                    <TitleEmptyList>
                        Não há publicações a serem estendidas!
                    </TitleEmptyList>
                    <MaterialIcons name="block" size={28} color="black" />
                </ContentEmptyList>
            )}
        </Container>
    );
};
