/* eslint-disable operator-linebreak */
import { useCallback, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, Checkbox } from "react-native-paper";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";

import { updateShripmPrice } from "../../../controllers/ShrimpPonds/updateShripmPrice";
import { getShrimpPrice } from "../../../controllers/ShrimpPonds/getShrimpPrice";

import { Input } from "../../../components/Input";

import {
    Body,
    CheckBoxHolder,
    CheckboxSubtext,
    CheckboxText,
    CheckboxTextWrap,
    Confirmbutton,
    Container,
    ContainerCheckbox,
    ContentCheckbox,
    ContentForm,
    Footer,
    Header,
    SectionHeader,
    SectionMarker,
    SectionTitle,
    Subtitle,
    TipBox,
    TipDescription,
    TipIconWrap,
    TipTitle,
    Title,
    TitleButton,
} from "./styles";
import { sendNotificationAllUsers } from "../../../controllers/Notifications/sendNotifications";
import { theme } from "../../../styles/Theme";

export const ShrimpPrice = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [defaultGrammage, setDefaultGrammage] = useState("0");
    const [defaultPriceGrammage, setDefaultPriceGrammage] = useState("0");
    const [lastDefaultPrice, setLastDefaultPrice] = useState("0");
    const [leftGrammageReference, setLeftGrammageReference] = useState("0");
    const [priceLeftGramageReference, setPriceLeftGramageReference] = useState("0");
    const [rightGrammagereference, setRightGrammagereference] = useState("0");
    const [priceRightGrammageReference, setPriceRightGrammageReference] = useState("0");
    const [showSuggestPrice, setShowSuggestPrice] = useState(true);
    const [showAllUsers, setShowAllUsers] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const getData = async () => {
                setIsLoadingData(true);
                setIsLoading(true);

                const data = await getShrimpPrice();

                setDefaultGrammage(data.defaultGrammage);
                setDefaultPriceGrammage(`${data.defaultPriceGrammage}`);
                setLastDefaultPrice(data.defaultPriceGrammage);
                setLeftGrammageReference(data.leftGrammageReference);
                setPriceLeftGramageReference(`${data.priceLeftGramageReference}`);
                setRightGrammagereference(data.rightGrammagereference);
                setPriceRightGrammageReference(`${data.priceRightGrammageReference}`);
                setShowSuggestPrice(data.showSuggestPrice);
                setShowAllUsers(data.showAllUsers);

                setIsLoadingData(false);
                setIsLoading(false);
            };

            getData();
        }, []),
    );

    const handleChangeShrimpPrice = async () => {
        setIsLoading(true);

        const result = await updateShripmPrice({
            defaultGrammage,
            defaultPriceGrammage: Number(defaultPriceGrammage),
            leftGrammageReference,
            priceLeftGramageReference: Number(priceLeftGramageReference),
            priceRightGrammageReference: Number(priceRightGrammageReference),
            rightGrammagereference,
            showAllUsers,
            showSuggestPrice,
        });

        if (result) {
            Toast.show({
                type: "success",
                text1: "Preço do camarão atualizado!",
            });

            let title = "";

            if (lastDefaultPrice > defaultPriceGrammage) {
                title = "Preço do camarão baixou!";
            } else if (lastDefaultPrice < defaultPriceGrammage) {
                title = "Preço do camarão subiu!";
            } else {
                title = "Camarao manteve o preco!";
            }

            await sendNotificationAllUsers(title, "Venha conferir!");
        } else {
            Toast.show({
                type: "error",
                text1: "Não foi possível atualizar o preço!",
            });
        }

        setIsLoading(false);
    };

    return (
        <>
            <Container>
                <Header>
                    <Title>Preco do Camarao</Title>
                    <Subtitle>
                        Informe a seus usuários o preço do camarão e suas variações.
                    </Subtitle>
                </Header>
                <Body>
                    {isLoadingData ? (
                        <ActivityIndicator animating color={theme.colors.primary} size={45} />
                    ) : (
                        <>
                            <SectionHeader>
                                <SectionMarker />
                                <SectionTitle>Defina os precos</SectionTitle>
                            </SectionHeader>
                            <ContentForm>
                                <Input
                                    label="Gram. base"
                                    icon="package"
                                    onChange={setDefaultGrammage}
                                    value={defaultGrammage}
                                    keyboardType="numeric"
                                    style={{ width: "49%" }}
                                />
                                <Input
                                    label="Preco base"
                                    icon="dollar-sign"
                                    onChange={setDefaultPriceGrammage}
                                    value={defaultPriceGrammage}
                                    keyboardType="numeric"
                                    style={{ width: "49%" }}
                                />
                            </ContentForm>
                            <ContentForm>
                                <Input
                                    label="Gram. menor"
                                    icon="minus-circle"
                                    onChange={setLeftGrammageReference}
                                    value={leftGrammageReference}
                                    keyboardType="numeric"
                                    style={{ width: "49%" }}
                                />
                                <Input
                                    label="Preco menor"
                                    icon="dollar-sign"
                                    onChange={setPriceLeftGramageReference}
                                    value={priceLeftGramageReference}
                                    keyboardType="numeric"
                                    style={{ width: "49%" }}
                                />
                            </ContentForm>
                            <ContentForm>
                                <Input
                                    label="Gram. maior"
                                    icon="plus-circle"
                                    onChange={setRightGrammagereference}
                                    value={rightGrammagereference}
                                    keyboardType="numeric"
                                    style={{ width: "49%" }}
                                />
                                <Input
                                    label="Preco maior"
                                    icon="dollar-sign"
                                    onChange={setPriceRightGrammageReference}
                                    value={priceRightGrammageReference}
                                    keyboardType="numeric"
                                    style={{ width: "49%" }}
                                />
                            </ContentForm>

                            <SectionHeader>
                                <SectionMarker />
                                <SectionTitle>Opcoes de exibicao</SectionTitle>
                            </SectionHeader>
                            <ContainerCheckbox>
                                <ContentCheckbox>
                                    <CheckboxTextWrap>
                                        <CheckboxText>Exibir informacao de preco sugerido!</CheckboxText>
                                        <CheckboxSubtext>
                                            Mostra o preco sugerido para seus usuarios.
                                        </CheckboxSubtext>
                                    </CheckboxTextWrap>
                                    <CheckBoxHolder>
                                        <Checkbox.Android
                                            color={theme.colors.primary}
                                            uncheckedColor={theme.colors.primary}
                                            status={showSuggestPrice ? "checked" : "unchecked"}
                                            onPress={() => setShowSuggestPrice(!showSuggestPrice)}
                                        />
                                    </CheckBoxHolder>
                                </ContentCheckbox>
                                <ContentCheckbox>
                                    <CheckboxTextWrap>
                                        <CheckboxText>Exibir preco para todos os usuarios!</CheckboxText>
                                        <CheckboxSubtext>
                                            Disponibiliza os precos para todos os usuarios.
                                        </CheckboxSubtext>
                                    </CheckboxTextWrap>
                                    <CheckBoxHolder>
                                        <Checkbox.Android
                                            color={theme.colors.primary}
                                            uncheckedColor={theme.colors.primary}
                                            status={showAllUsers ? "checked" : "unchecked"}
                                            onPress={() => setShowAllUsers(!showAllUsers)}
                                        />
                                    </CheckBoxHolder>
                                </ContentCheckbox>

                                <TipBox>
                                    <TipIconWrap>
                                        <Feather name="alert-circle" size={16} color={theme.colors.primary} />
                                    </TipIconWrap>
                                    <>
                                        <TipTitle>Dica</TipTitle>
                                        <TipDescription>
                                            Mantenha seus precos atualizados para oferecer transparencia e confianca aos seus usuarios.
                                        </TipDescription>
                                    </>
                                </TipBox>
                            </ContainerCheckbox>
                        </>
                    )}
                </Body>
            </Container>
            <Footer>
                <Confirmbutton onPress={handleChangeShrimpPrice}>
                    {!isLoading ? (
                        <>
                            <Feather name="tag" size={15} color={theme.colors.white} style={{ marginRight: 8 }} />
                            <TitleButton>Alterar Preco do Camarao</TitleButton>
                        </>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </Confirmbutton>
            </Footer>
        </>
    );
};
