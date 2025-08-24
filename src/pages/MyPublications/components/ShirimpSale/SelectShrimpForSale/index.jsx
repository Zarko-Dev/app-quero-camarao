import { FlatList, View } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import {
    ButtonCardShrimp,
    ButtonClose,
    ButtonNextStep,
    CardShrimp,
    Container,
    Divider,
    Header,
    TitleButtonClose,
    TitleButtonNextStep,
    TitleCardShrimp,
    TitleHeader,
} from "./styles";
import { theme } from "../../../../../styles/Theme";
import { dataRoutes } from "../../../../../routes/dataRoutes";

export const SelectShrimpForSale = ({
    onClose,
    shrimpList,
    dataPublication,
    isEdit,
    navigation,
}) => {
    const [selectedShrimp, setSelectedShrimp] = useState([]);

    const handleSelectShrimp = (shrimp) => {
        if (isEdit) {
            setSelectedShrimp([shrimp]);
        } else if (selectedShrimp.includes(shrimp)) {
            setSelectedShrimp(selectedShrimp.filter((item) => item !== shrimp));
        } else {
            setSelectedShrimp([...selectedShrimp, shrimp]);
        }
    };

    const handleNextStep = () => {
        onClose();

        navigation.navigate(dataRoutes.salesShrimps, {
            shrimpList: selectedShrimp,
            dataPublication,
            isEdit,
        });
    };

    return (
        <Container>
            <Header>
                <View style={{ width: 50 }} />
                <TitleHeader>Selecione os viveiros vendidos</TitleHeader>
                <ButtonClose onPress={onClose}>
                    <TitleButtonClose>
                        <Feather
                            name="x-circle"
                            size={30}
                            color={theme.colors.primary}
                        />
                    </TitleButtonClose>
                </ButtonClose>
            </Header>
            <Divider />
            <FlatList
                data={shrimpList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CardShrimp>
                        <ButtonCardShrimp
                            onPress={() => handleSelectShrimp(item)}
                            selected={selectedShrimp.includes(item)}
                        >
                            <TitleCardShrimp
                                selected={selectedShrimp.includes(item)}
                            >
                                {item.grammage}g / {item.kilo}kg
                            </TitleCardShrimp>
                        </ButtonCardShrimp>
                    </CardShrimp>
                )}
            />
            <ButtonNextStep
                disabled={selectedShrimp.length === 0}
                onPress={handleNextStep}
            >
                <TitleButtonNextStep>Proxima Etapa</TitleButtonNextStep>
                <Feather
                    name="arrow-right"
                    size={30}
                    color={theme.colors.white}
                />
            </ButtonNextStep>
        </Container>
    );
};
