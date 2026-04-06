/* eslint-disable operator-linebreak */
import { ActivityIndicator, Checkbox } from "react-native-paper";
import { useCallback, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";


import {
    ActionCountButton,
    ButtonDrawPrise,
    ButtonDrawPriseHistory,
    CardSelection,
    Container,
    ContainerCheckbox,
    ContentActionCountButtons,
    ContentCheckBox,
    ContentTag,
    ContentTags,
    CountTitle,
    Scroll,
    Subtitle,
    Tag,
    TextButtonDrawPrize,
    Title,
    TitleCheckbox,
} from "./styles";
import { getAllUsers } from "../../../controllers/User/getAll";
import { dataRoutes } from "../../../routes/dataRoutes";
import { getDrawPrizeRules } from "../../../controllers/DrawPrizes/rules";

export const DrawPrize = ({ navigation }) => {
    const [checkedProductor, setCheckedProductor] = useState(true);
    const [checkedClient, setCheckedClient] = useState(false);
    const [countPrizes, setCountPrizes] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [dataUsers, setDataUsers] = useState([]);
    const [dataRules, setDataRules] = useState([]);
    const [dataEspecifcRule, setDataEspecifcRule] = useState([]);
    const [selectedIdSpecificRule, setSelectedIdSpecificRule] = useState(null);

    const limitDrawPrimzes = 10;

    useFocusEffect(
        useCallback(() => {
            const getAllDataUsers = async () => {
                const data = await getDrawPrizeRules();
                setDataRules(data[0].rules);
                setDataEspecifcRule(data[0].specifcRules);

                setDataUsers(await getAllUsers());

                setIsLoading(false);
            };

            setIsLoading(true);

            getAllDataUsers();
        }, []),
    );

    const addCountPrizes = () => {
        if (countPrizes < limitDrawPrimzes) {
            setCountPrizes((count) => count + 1);
        }
    };

    const removeCountPrizes = () => {
        if (countPrizes > 0) {
            setCountPrizes((count) => count - 1);
        }
    };

    const handleSelectedSpecificRule = (item) => {
        setSelectedIdSpecificRule(item.id);
        setDataRules(item.rules);
    };

    const handleDrawPrize = () => {
        if (countPrizes > 0) {
            let dataUsersPrize;
            const usersWinner = [];

            if (checkedProductor && !checkedClient) {
                dataUsersPrize = dataUsers.filter(
                    (user) =>
                        user.userType === "productor" &&
                        user.address &&
                        user.address.state &&
                        user.address.city &&
                        (dataRules.length === 0 ||
                            dataRules.includes(user.address.city)),
                );
            } else if (!checkedProductor && checkedClient) {
                dataUsersPrize = dataUsers.filter(
                    (user) =>
                        user.userType === "client" &&
                        user.state &&
                        user.city &&
                        (dataRules.length === 0 ||
                            dataRules.includes(user.city)),
                );
            } else {
                dataUsersPrize = dataUsers.filter((user) => {
                    if (
                        user.userType === "productor" &&
                        user.address &&
                        user.address.state &&
                        user.address.city &&
                        (dataRules.length === 0 ||
                            dataRules.includes(user.address.city))
                    ) {
                        return true;
                    }
                    if (
                        user.userType === "client" &&
                        user.state &&
                        user.city &&
                        (dataRules.length === 0 ||
                            dataRules.includes(user.city))
                    ) {
                        return true;
                    }
                    return false;
                });
            }

            for (let index = 0; index < countPrizes; index++) {
                const randomElement =
                    dataUsersPrize[
                        Math.floor(Math.random() * dataUsersPrize.length)
                    ];

                usersWinner.push(randomElement);
            }

            navigation.navigate(dataRoutes.admin.drawPrizeWinnerResult, {
                usersWinner,
            });
        }
    };

    const handleRedirectDrawPrizeHistory = () => {
        navigation.navigate(dataRoutes.admin.drawPrizeHistory);
    };

    return (
        <Container>
            <Title>Sorteio</Title>
            <Subtitle>Quem irá participar do sorteio?</Subtitle>
            <CardSelection>
                <ContainerCheckbox>
                    <ContentCheckBox>
                        <Checkbox.Android
                            status={checkedProductor ? "checked" : "unchecked"}
                            onPress={() =>
                                setCheckedProductor(!checkedProductor)
                            }
                        />
                        <TitleCheckbox>Produtores</TitleCheckbox>
                    </ContentCheckBox>
                    <ContentCheckBox>
                        <Checkbox.Android
                            status={checkedClient ? "checked" : "unchecked"}
                            onPress={() => setCheckedClient(!checkedClient)}
                        />
                        <TitleCheckbox>Clientes</TitleCheckbox>
                    </ContentCheckBox>
                </ContainerCheckbox>
            </CardSelection>
            <Subtitle>Informe quantos serão sorteados!</Subtitle>
            <CardSelection>
                <CountTitle>{countPrizes}</CountTitle>
                <ContentActionCountButtons>
                    <ActionCountButton
                        disabled={countPrizes === 0}
                        onPress={removeCountPrizes}
                    >
                        <Feather name="minus" size={24} color="black" />
                    </ActionCountButton>
                    <ActionCountButton
                        green
                        disabled={countPrizes === limitDrawPrimzes}
                        onPress={addCountPrizes}
                    >
                        <Feather name="plus" size={24} color="black" />
                    </ActionCountButton>
                </ContentActionCountButtons>
            </CardSelection>
            <Subtitle>Selecione o sorteio específico caso necessário!</Subtitle>
            <Scroll>
                <ContentTags>
                    {dataEspecifcRule.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => {
                                handleSelectedSpecificRule(item);
                            }}
                        >
                            <ContentTag
                                selected={item.id === selectedIdSpecificRule}
                            >
                                <Tag
                                    selected={
                                        item.id === selectedIdSpecificRule
                                    }
                                >
                                    {item.name}
                                </Tag>
                            </ContentTag>
                        </TouchableOpacity>
                    ))}
                </ContentTags>
            </Scroll>
            <ButtonDrawPrise disabled={isLoading} onPress={handleDrawPrize}>
                {!isLoading ? (
                    <TextButtonDrawPrize>Sortear</TextButtonDrawPrize>
                ) : (
                    <ActivityIndicator animating color="white" />
                )}
            </ButtonDrawPrise>
            <ButtonDrawPriseHistory onPress={handleRedirectDrawPrizeHistory}>
                <TextButtonDrawPrize>Histórico de Sorteios</TextButtonDrawPrize>
            </ButtonDrawPriseHistory>
        </Container>
    );
};
