import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";

import { getUserPublications } from "../../controllers/Publication/getUserPublications";
import { dataRoutes } from "../../routes/dataRoutes";
import { GetUserStorage } from "../../services/Storage/UserStorage";

import { MyShrimpCardList } from "./components/MyShrimpCardList";

import { ButtonAddPublication, Container, TextButton } from "./styles";

export const MyPublications = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [dataPublication, setDataPublication] = useState();

    useFocusEffect(
        useCallback(() => {
            setIsLoading(true);

            GetUserStorage()
                .then((dataUser) => {
                    if (dataUser) {
                        getUserPublications(dataUser.email)
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

    const handleRedirectRegisterPublication = () => {
        navigation.navigate(dataRoutes.publication);
    };

    return (
        <Container>
            <MyShrimpCardList
                dataPublication={dataPublication}
                isLoading={isLoading}
                actionDataPublication={setDataPublication}
            />
            <ButtonAddPublication onPress={handleRedirectRegisterPublication}>
                <TextButton>Publicar meu Camarão</TextButton>
            </ButtonAddPublication>
        </Container>
    );
};
