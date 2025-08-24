import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { GetUserStorage } from "../../../../services/Storage/UserStorage";
import { dataRoutes } from "../../../../routes/dataRoutes";

import {
    ButtonAddAddress,
    Container,
    ContentAddressIcon,
    ContentButtonAddress,
    ContentEmptyAddress,
    ContentInfo,
    TextButtonAddAddress,
    TextInfoAddress,
    TitleAddress,
} from "./styles";

export const AddressCard = () => {
    const navigation = useNavigation();

    const [dataUser, setDataUser] = useState();

    useFocusEffect(
        useCallback(() => {
            GetUserStorage()
                .then((data) => setDataUser(data))
                .catch();
        }, []),
    );

    const handleUpdateAddress = () => {
        navigation.navigate(dataRoutes.address, {
            dataUser,
        });
    };

    return dataUser?.address ? (
        <Container onPress={handleUpdateAddress}>
            <ContentAddressIcon>
                <FontAwesome5 name="map-marker-alt" size={15} color="black" />
            </ContentAddressIcon>
            <ContentInfo>
                <TitleAddress>Endereço de cobrança:</TitleAddress>
                <TextInfoAddress>{dataUser.name}</TextInfoAddress>
                <TextInfoAddress>{dataUser.phone}</TextInfoAddress>
                <TextInfoAddress>{dataUser.address.street}</TextInfoAddress>
                <TextInfoAddress>
                    {`${dataUser.address.city}, ${dataUser.address.state}, Brazil, ${dataUser.address.cep}`}
                </TextInfoAddress>
            </ContentInfo>
            <ContentButtonAddress>
                <FontAwesome5 name="chevron-right" size={24} color="black" />
            </ContentButtonAddress>
        </Container>
    ) : (
        <ContentEmptyAddress onPress={handleUpdateAddress}>
            <ButtonAddAddress>
                <TextButtonAddAddress>
                    <FontAwesome5 name="plus" size={17} color="white" />
                    {"  "}
                    Adicionar Endereço
                </TextButtonAddAddress>
            </ButtonAddAddress>
        </ContentEmptyAddress>
    );
};
