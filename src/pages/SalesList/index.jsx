/* eslint-disable operator-linebreak */
import { FlatList, Modal } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";
import {
    Body,
    ButtonChatProductor,
    ButtonEditSale,
    ButtonText,
    CardItemSale,
    Container,
    ContentGrammage,
    DividerLine,
    Footer,
    Header,
    TitleDateSale,
    TitleGrammage,
    TitleGrammageValue,
    TitleHeader,
} from "./styles";
import { getShirimpSaleByCreatedAtLastSevenDays } from "../../controllers/ShirimpSale/sale";
import { GetUserStorage } from "../../services/Storage/UserStorage";
import { SelectShrimpForSale } from "../MyPublications/components/ShirimpSale/SelectShrimpForSale";
import { dataRoutes } from "../../routes/dataRoutes";
import { redirectWhatsappLink } from "../../utils/redirectFunctions";
import { getDataUserByIds } from "../../controllers/User/authentication";

export const SalesList = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [dataSales, setDataSales] = useState([]);
    const [dataUser, setDataUser] = useState();
    const [saleShrimpsList, setSaleShrimpsList] = useState([]);
    const [showSalePondsDialog, setShowSalePondsDialog] = useState(false);
    const [selectedSale, setSelectedSale] = useState();
    const isAdmin = (dataUser?.rules || []).includes("Admin");

    useFocusEffect(
        useCallback(() => {
            const getData = async () => {
                const user = await GetUserStorage();

                setDataUser(user);

                const resultData =
                    await getShirimpSaleByCreatedAtLastSevenDays();

                setDataSales(resultData);

                setLoading(false);

                if (resultData.length === 0) {
                    Toast.show({
                        type: "info",
                        text1: "Nenhuma venda encontrada!",
                        text2: "Não foi realizado nenhuma venda nos últimos 7 dias!",
                    });
                }
            };

            getData();
        }, []),
    );

    const handleOpenDialogEditSalePonds = async (item) => {
        setSelectedSale(item);
        setSaleShrimpsList(item.sales);

        setShowSalePondsDialog(true);
    };

    const handleChatProductor = async (responseId) => {
        const whatsappMessage = `Olá, venho através do aplicativo *Quero Camarão* 🦐

Vi que vendeu camarão recentemente e gostaria de algumas informações adicionais. Poderia me ajudar?`;

        const dataProductor = await getDataUserByIds([responseId]);

        const contactNumber = dataProductor[0].phone.replace(/\D/g, "");

        navigation.navigate(dataRoutes.redirect, {
            subtext:
                "Estamos lhe redirecionado ao whatsapp do produtor que selecionou",
            actionRediret: redirectWhatsappLink(
                contactNumber,
                whatsappMessage,
                navigation,
            ),
        });
    };

    return (
        <>
            <Container>
                {loading ? (
                    <ActivityIndicator
                        animating
                        color="black"
                        size={60}
                        style={{ marginTop: 40 }}
                    />
                ) : (
                    <FlatList
                        data={dataSales}
                        renderItem={({ item }) => (
                            <CardItemSale
                                isAdmin={isAdmin}
                            >
                                <Header>
                                    <TitleHeader>Macau/RN</TitleHeader>
                                </Header>
                                <Body>
                                    {item.sales.map((sale) => (
                                        <ContentGrammage key={sale.id}>
                                            <TitleGrammage>
                                                {sale.grammage}g{"    "}
                                                {sale.kilo}kg
                                            </TitleGrammage>
                                            <DividerLine />
                                            <TitleDateSale>
                                                {sale.saleDate}
                                            </TitleDateSale>
                                            <DividerLine />
                                            <TitleGrammageValue>
                                                R$ {sale.grammageValue}
                                            </TitleGrammageValue>
                                        </ContentGrammage>
                                    ))}
                                </Body>
                                {isAdmin && (
                                    <Footer>
                                        <ButtonChatProductor
                                            onPress={() =>
                                                handleChatProductor(
                                                    item.responseId,
                                                )
                                            }
                                        >
                                            <FontAwesome
                                                name="whatsapp"
                                                size={24}
                                                color="white"
                                            />
                                            <ButtonText>
                                                Falar com o Produtor
                                            </ButtonText>
                                        </ButtonChatProductor>
                                        <ButtonEditSale
                                            onPress={() =>
                                                handleOpenDialogEditSalePonds(
                                                    item,
                                                )
                                            }
                                        >
                                            <ButtonText>
                                                Editar Venda (Admin)
                                            </ButtonText>
                                        </ButtonEditSale>
                                    </Footer>
                                )}
                            </CardItemSale>
                        )}
                        keyExtractor={(item) => item.id}
                    />
                )}
            </Container>
            <Modal
                animationType="slide"
                visible={showSalePondsDialog}
                onRequestClose={() => setShowSalePondsDialog(false)}
            >
                <SelectShrimpForSale
                    onClose={() => setShowSalePondsDialog(false)}
                    shrimpList={saleShrimpsList}
                    dataPublication={{
                        id: selectedSale?.publicationId,
                        location: selectedSale?.location,
                        shrimps: [],
                        responseId: selectedSale?.responseId,
                    }}
                    isEdit
                    navigation={navigation}
                />
            </Modal>
        </>
    );
};
