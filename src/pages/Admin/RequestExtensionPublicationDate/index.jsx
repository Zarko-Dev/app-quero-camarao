import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";
import { Feather, MaterialIcons } from "@expo/vector-icons";

import { getAnalisysPublications } from "../../../controllers/Publication/getUserPublications";
import { GetUserStorage } from "../../../services/Storage/UserStorage";
import { SearchBar } from "../../../components/SearchBar";
import { theme } from "../../../styles/Theme";

import { MyShrimpCardList } from "./components/MyShrimpCardList";

import {
    Container,
    ContentEmptyList,
    FilterButton,
    FilterText,
    SearchWrap,
    TitleEmptyList,
    Toolbar,
} from "./styles";

export const RequestExtensionPublicationDate = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [dataPublication, setDataPublication] = useState([]);
    const [searchValue, setSearchValue] = useState("");

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
                                        text1: "Erro ao buscar suas publicacoes!",
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
                            text1: "Usuario nao encontrado!",
                            text2: "Reinicie o aplicativo e tente novamente!",
                        });
                    }
                })
                .catch();
        }, []),
    );

    const filteredPublications = searchValue
        ? dataPublication.filter((publication) => {
            const normalizedSearch = searchValue.toLowerCase();
            const shrimpText = (publication.shrimps || [])
                .map((shrimp) => `${shrimp.grammage} ${shrimp.kilo}`)
                .join(" ")
                .toLowerCase();

            return (
                publication.location?.toLowerCase().includes(normalizedSearch)
                  || shrimpText.includes(normalizedSearch)
            );
        })
        : dataPublication;

    return (
        <Container>
            <Toolbar>
                <SearchWrap>
                    <SearchBar
                        searchText={searchValue}
                        onChange={setSearchValue}
                        isLoadingSearch={false}
                        placeholder="Buscar publicacoes, viveiros..."
                    />
                </SearchWrap>
                <FilterButton>
                    <Feather name="filter" size={15} color={theme.colors.primary} />
                    <FilterText>Filtrar</FilterText>
                    <Feather name="chevron-down" size={15} color={theme.colors.primary} />
                </FilterButton>
            </Toolbar>
            {isLoading || filteredPublications.length > 0 ? (
                <MyShrimpCardList
                    dataPublication={filteredPublications}
                    isLoading={isLoading}
                    actionDataPublication={setDataPublication}
                />
            ) : (
                <ContentEmptyList>
                    <TitleEmptyList>
                        Nao ha publicacoes a serem estendidas!
                    </TitleEmptyList>
                    <MaterialIcons name="block" size={28} color="#4d4d4d" />
                </ContentEmptyList>
            )}
        </Container>
    );
};
