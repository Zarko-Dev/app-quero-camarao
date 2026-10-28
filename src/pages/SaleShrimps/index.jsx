/* eslint-disable operator-linebreak */
/* eslint-disable function-paren-newline */
/* eslint-disable indent */
import { FlatList, Keyboard } from "react-native";
import { useEffect, useState } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Toast from "react-native-toast-message";
import { v4 } from "uuid";
import { ActivityIndicator } from "react-native-paper";
import {
    ButtonSale,
    CardShrimp,
    Container,
    ContentCards,
    ContentForm,
    ContentInput,
    ContentTitleCardShrimp,
    InputStyle,
    SalePreviewText,
    TitleButtonSale,
    TitleCardShrimp,
    TitleInfoForm,
    TitleInput,
} from "./styles";
import {
    getShirimpSale,
    getShirimpSaleByCreatedAtLastSevenDays,
    saveShirimpSale,
    updateShiripsOnShirimpSale,
} from "../../controllers/ShirimpSale/sale";
import { updatePublicationWithShirimpSalle } from "../../controllers/Publication/updatePublication";
import { DialogComponent } from "../../components/Dialog";
import { saveShrimpPrice10g } from "../../controllers/ShrimpPonds/saveShrimpPrice10g";
import { sanitizeDecimalInput } from "../../utils/sanitizeDecimalInput";
import { sanitizeGrammageInput } from "../../utils/sanitizeGrammageInput";
import {
    calculateShrimpSalePrice,
    formatPriceValue,
    parseDecimalValue,
} from "../../utils/shrimpSalePricing";

export const SaleShrimps = ({ route, navigation }) => {
    const [dataShirimpSale] = useState(route.params.shrimpList);
    const [dataOriginalPublication] = useState(route.params.dataPublication);
    const [isEdit] = useState(route.params?.isEdit ?? false);
    const [dataSale, setDataSale] = useState([]);
    const [loadingSale, setLoadingSale] = useState(false);
    const [showAlertVisible, setShowAlertVisible] = useState(false);

    const getCurrentSaleDate = () => {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();

        return `${day}/${month}/${year}`;
    };

    useEffect(() => {
        const newDataSale = dataShirimpSale.map((item) => ({
            id: item.id,
            grammage: item.grammage,
            kilo: item.kilo,
            grammageValue: isEdit ? item.grammageValue : "",
            totalSaleValue: isEdit ? item.totalSaleValue : "",
            saleDate: isEdit ? item.saleDate : "",
        }));

        setDataSale(newDataSale);
    }, [dataShirimpSale]);

    const validateSaleShrimp = () => {
        const isValidate = dataSale.every(
            (sale) =>
                sale.grammage &&
                sale.grammageValue,
        );

        const isGrammageValid = dataSale.every((sale) => {
            const shrimp = dataShirimpSale.find((item) => item.id === sale.id);

            return (
                parseFloat(sale.grammage.replace(",", ".")) >=
                    parseFloat(shrimp.grammage.replace(",", ".")) &&
                parseFloat(sale.grammage.replace(",", ".")) <= 70
            );
        });

        if (!isValidate) {
            Toast.show({
                type: "error",
                text1: "Preencha todos os campos obrigatórios",
            });

            return false;
        }
        if (!isGrammageValid) {
            Toast.show({
                type: "error",
                text1: "Gramatura vendida inválida",
                text2:
                    "A gramatura vendida não pode ser menor que a original nem maior que 70g.",
            });

            return false;
        }

        return true;
    };

    const getShrimpPrice10g = async () => {
        const resultDataShrimp = await getShirimpSaleByCreatedAtLastSevenDays();

        if (resultDataShrimp.length > 0) {
            const priceTable10gList = [];

            resultDataShrimp.forEach((item) => {
                item.sales.forEach((sale) => {
                    const grammage = parseDecimalValue(sale.grammage);
                    const tablePrice = parseDecimalValue(sale.grammageValue);
                    const hasCalculatedSaleValue =
                        sale.totalSaleValue !== undefined &&
                        sale.totalSaleValue !== null &&
                        sale.totalSaleValue !== "";

                    let price10g = 0;

                    if (hasCalculatedSaleValue) {
                        price10g = tablePrice;
                    } else if (grammage > 0) {
                        price10g = (10 * tablePrice) / grammage;
                    }

                    priceTable10gList.push(price10g);
                });
            });

            const shrimpTotalValue10g = priceTable10gList.reduce(
                (accumulator, currentValue) => accumulator + currentValue,
                0,
            );

            if (priceTable10gList.length === 0) {
                return;
            }

            await saveShrimpPrice10g(
                Number(
                    (shrimpTotalValue10g / priceTable10gList.length).toFixed(2),
                ),
            );
        }
    };

    const getCleanedSalesData = () =>
        dataSale.map((sale) => ({
            ...sale,
            totalSaleValue: formatPriceValue(
                calculateShrimpSalePrice(sale.grammageValue, sale.grammage),
            ),
            saleDate: getCurrentSaleDate(),
        }));

    const handleSaveShirimpSale = async () => {
        setShowAlertVisible(false);
        setLoadingSale(true);

        const cleanedDataSale = getCleanedSalesData();

        const dataDocShiripSales = {
            id: v4(),
            publicationId: dataOriginalPublication.id,
            responseId: dataOriginalPublication.responseId,
            location: dataOriginalPublication.location,
            sales: cleanedDataSale,
        };

        const resultSaveShirimpSale = await saveShirimpSale(dataDocShiripSales);

        if (resultSaveShirimpSale) {
            const shirimpsUpdated = dataOriginalPublication.shrimps.map(
                (item) => {
                    const sale = dataSale.find(
                        (saleItem) => saleItem.id === item.id,
                    );

                    if (sale) {
                        return {
                            ...item,
                            sale: true,
                        };
                    }

                    return item;
                },
            );

            const shirimpsUpdatedNotId = shirimpsUpdated.map((item) => {
                const { id, ...rest } = item;
                return rest;
            });

            const resultSale = await updatePublicationWithShirimpSalle(
                dataOriginalPublication.id,
                shirimpsUpdatedNotId,
            );

            if (resultSale) {
                await getShrimpPrice10g();

                Toast.show({
                    type: "success",
                    text1: "Venda realizada com sucesso!",
                });

                navigation.goBack();
            } else {
                Toast.show({
                    type: "error",
                    text1: "Erro ao realizar a venda!",
                    text2: "Tente novamente em instantes!",
                });
            }
        }

        setLoadingSale(false);
    };

    const handleUpdateShirimpSale = async () => {
        setLoadingSale(true);

        const result = await getShirimpSale(dataOriginalPublication.id);

        const cleanedDataSale = getCleanedSalesData();

        const dataUpdatedSales = result.sales.map((sale) => {
            const updatedSale = cleanedDataSale.find(
                (item) => item.id === sale.id,
            );
            return updatedSale || sale;
        });

        const resultUpdateSale = await updateShiripsOnShirimpSale(
            result.id,
            dataUpdatedSales,
        );

        if (resultUpdateSale) {
            await getShrimpPrice10g();

            Toast.show({
                type: "success",
                text1: "Venda atualizada com sucesso!",
            });

            navigation.goBack();
        } else {
            Toast.show({
                type: "error",
                text1: "Erro ao atualizar a venda!",
                text2: "Tente novamente em instantes!",
            });
        }

        setLoadingSale(false);
    };

    const handleSaleShrimp = async () => {
        const resultValidate = validateSaleShrimp();

        if (isEdit && resultValidate) {
            await handleUpdateShirimpSale();
        } else {
            let countNotContainSale = 0;

            dataOriginalPublication.shrimps.forEach((item) => {
                if (!item?.sale) {
                    countNotContainSale += 1;
                }
            });

            const restSales =
                dataOriginalPublication.shrimps.length - countNotContainSale;

            if (resultValidate) {
                if (
                    dataOriginalPublication.shrimps.length ===
                        dataSale.length ||
                    restSales === dataSale.length
                ) {
                    // Fecha o teclado antes de abrir a modal: o teclado é um
                    // overlay do SO e cobre o Dialog do Paper se ficar aberto.
                    Keyboard.dismiss();
                    setShowAlertVisible(true);
                } else {
                    await handleSaveShirimpSale();
                }
            }
        }
    };

    return (
        <Container>
            <FlatList
                data={dataShirimpSale}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const currentSale = dataSale.find(
                        (sale) => sale.id === item.id,
                    );
                    const previewSalePrice = currentSale?.grammageValue
                        ? formatPriceValue(
                              calculateShrimpSalePrice(
                                  currentSale.grammageValue,
                                  currentSale.grammage,
                              ),
                          )
                        : null;

                    return (
                        <ContentCards>
                            <CardShrimp>
                                <ContentTitleCardShrimp>
                                    <TitleCardShrimp>
                                        {item.grammage}g / {item.kilo}kg
                                    </TitleCardShrimp>
                                </ContentTitleCardShrimp>
                                <TitleInfoForm>
                                    Informe os dados da venda
                                </TitleInfoForm>
                                <ContentForm>
                                    <ContentInput>
                                        <TitleInput>
                                            *Qual gramatura foi vendida no seu camarão?
                                        </TitleInput>
                                        <InputStyle
                                            label="Ex.: 50g"
                                            keyboardType="decimal-pad"
                                            value={currentSale?.grammage ?? ""}
                                            onChange={(value) => {
                                                const sanitizedValue =
                                                    sanitizeGrammageInput(
                                                        value,
                                                        2,
                                                        70,
                                                    );

                                                if (sanitizedValue.exceeded) {
                                                    Toast.show({
                                                        type: "error",
                                                        text1: "A gramatura máxima é 70g",
                                                        text2: "Informe um valor menor ou igual a 70g.",
                                                    });
                                                }

                                                setDataSale((prevState) =>
                                                    prevState.map((sale) =>
                                                        sale.id === item.id
                                                            ? {
                                                                  ...sale,
                                                                  grammage:
                                                                      sanitizedValue.value,
                                                              }
                                                            : sale,
                                                    ),
                                                );
                                            }}
                                        />
                                    </ContentInput>
                                    {/*
                                    <ContentInput>
                                        <TitleInput>
                                            *Kilo da venda do camarão:
                                        </TitleInput>
                                        <InputStyle
                                            label="Ex.: 100kg"
                                            keyboardType="decimal-pad"
                                            value={
                                                dataSale.find(
                                                    (sale) => sale.id === item.id,
                                                )?.kilo ?? ""
                                            }
                                            onChange={(value) => {
                                                const sanitizedValue =
                                                    sanitizeDecimalInput(
                                                        value,
                                                        1,
                                                    );

                                                setDataSale((prevState) =>
                                                    prevState.map((sale) =>
                                                        sale.id === item.id
                                                            ? {
                                                                  ...sale,
                                                                  kilo: sanitizedValue,
                                                              }
                                                            : sale,
                                                    ),
                                                );
                                            }}
                                        />
                                    </ContentInput>
                                    */}
                                    <ContentInput>
                                        <TitleInput>
                                            *Informe o preço da tabela (10g):
                                        </TitleInput>
                                        <InputStyle
                                            label="Ex.: 20,00"
                                            keyboardType="decimal-pad"
                                            value={currentSale?.grammageValue ?? ""}
                                            onChange={(value) => {
                                                const sanitizedValue =
                                                    sanitizeDecimalInput(
                                                        value,
                                                        2,
                                                        40,
                                                    );

                                                setDataSale((prevState) =>
                                                    prevState.map((sale) =>
                                                        sale.id === item.id
                                                            ? {
                                                                  ...sale,
                                                                  grammageValue:
                                                                      sanitizedValue,
                                                              }
                                                            : sale,
                                                    ),
                                                );
                                            }}
                                        />
                                        <SalePreviewText>
                                            Preço do seu camarão:{" "}
                                            {previewSalePrice
                                                ? `R$ ${previewSalePrice}`
                                                : "-"}
                                        </SalePreviewText>
                                    </ContentInput>
                                    {/*
                                    <ContentInput>
                                        <TitleInput>
                                            *Data da venda do camarão:
                                        </TitleInput>
                                        <InputStyle
                                            label="Ex.: 01/01/2021"
                                            keyboardType="numeric"
                                            value={
                                                dataSale.find(
                                                    (sale) => sale.id === item.id,
                                                )?.saleDate ?? ""
                                            }
                                            onChange={(value) => {
                                                const sanitizedValue =
                                                    value.replace(/[^0-9/]/g, "");

                                                setDataSale((prevState) =>
                                                    prevState.map((sale) =>
                                                        sale.id === item.id
                                                            ? {
                                                                  ...sale,
                                                                  saleDate:
                                                                      sanitizedValue,
                                                              }
                                                            : sale,
                                                    ),
                                                );
                                            }}
                                            mask="99/99/9999"
                                        />
                                    </ContentInput>
                                    */}
                                </ContentForm>
                            </CardShrimp>
                        </ContentCards>
                    );
                }}
            />
            <ButtonSale onPress={handleSaleShrimp}>
                {loadingSale ? (
                    <ActivityIndicator animating color="white" size={30} />
                ) : (
                    <>
                        <FontAwesome name="dollar" size={24} color="white" />
                        <TitleButtonSale>
                            {isEdit
                                ? "Atualizar Venda do Camarão"
                                : "Informar Venda do Camarão"}
                        </TitleButtonSale>
                        <FontAwesome name="dollar" size={24} color="white" />
                    </>
                )}
            </ButtonSale>

            <DialogComponent
                visible={showAlertVisible}
                title="Sua publicação será finalizada!"
                text="Ao vender todos os viveiros da sua publicação, a mesma será dada como finalizada! Deseja continuar sua venda?"
                textActionButton="SIM"
                hideDialog={() => setShowAlertVisible(false)}
                actionButton={handleSaveShirimpSale}
                dismissable={false}
            />
        </Container>
    );
};
