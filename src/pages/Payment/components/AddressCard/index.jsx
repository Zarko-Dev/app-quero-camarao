import { FontAwesome5 } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { GetUserStorage } from "../../../../services/Storage/UserStorage";
import { dataRoutes } from "../../../../routes/dataRoutes";
import { getUserAddressValue } from "../../../../utils/userAddress";

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
        <Container onPress={handleUpdateAddress} activeOpacity={0.85}>
            <ContentAddressIcon>
                <FontAwesome5 name="map-marker-alt" size={18} color="#e85d22" />
            </ContentAddressIcon>
            <ContentInfo>
                <TitleAddress>Endereço de cobrança</TitleAddress>
                <TextInfoAddress>{dataUser.name}</TextInfoAddress>
                <TextInfoAddress>{dataUser.phone}</TextInfoAddress>
                <TextInfoAddress>
                    {`${dataUser.address.city}, ${dataUser.address.state}, Brasil`}
                </TextInfoAddress>  
                <TextInfoAddress>
                    {`CEP ${getUserAddressValue(dataUser, "cep") || "não informado"}`}
                </TextInfoAddress>
                <TextInfoAddress>
                    {[getUserAddressValue(dataUser, "street"), getUserAddressValue(dataUser, "number")]
                        .filter(Boolean)
                        .join(", ")}
                </TextInfoAddress>
            </ContentInfo>
            <ContentButtonAddress>
                <FontAwesome5 name="chevron-right" size={20} color="#e85d22" />
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
