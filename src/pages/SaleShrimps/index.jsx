/* eslint-disable operator-linebreak */
/* eslint-disable function-paren-newline */
/* eslint-disable indent */
import { FlatList } from "react-native";
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

export const SaleShrimps = ({ route, navigation }) => {
    const [dataShirimpSale] = useState(route.params.shrimpList);
    const [dataOriginalPublication] = useState(route.params.dataPublication);
    const [isEdit] = useState(route.params?.isEdit ?? false);
    const [dataSale, setDataSale] = useState([]);
    const [loadingSale, setLoadingSale] = useState(false);
    const [showAlertVisible, setShowAlertVisible] = useState(false);

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
                sale.kilo &&
                sale.grammageValue &&
                sale.saleDate,
        );

        const isGrammageValid = dataSale.every((sale) => {
            const shrimp = dataShirimpSale.find((item) => item.id === sale.id);

            return (
                parseFloat(sale.grammage.replace(",", ".")) >=
                parseFloat(shrimp.grammage.replace(",", "."))
            );
        });

        const isDateValid = dataSale.every((sale) => {
            if (sale.saleDate === "") {
                return false;
            }

            const convertDate = sale.saleDate.split("/");

            const date = new Date(
                convertDate[2],
                convertDate[1] - 1,
                convertDate[0],
            );

            const currentDate = new Date();

            return date <= currentDate;
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
                text1: "Gramatura de venda inválida",
                text2: "A gramatura de venda não pode ser menor que a original",
            });

            return false;
        }
        if (!isDateValid) {
            Toast.show({
                type: "error",
                text1: "Data da venda inválida",
                text2: "A data não pode ser maior que a data atual",
            });

            return false;
        }

        return true;
    };

    const getShrimpPrice10g = async () => {
        const resultDataShrimp = await getShirimpSaleByCreatedAtLastSevenDays();

        if (resultDataShrimp.length > 0) {
            const salesList = [];
            const salesListShrimp10g = [];
            let shrimpTotalValue10g = 0;

            resultDataShrimp.forEach((item) => {
                item.sales.forEach((sale) => {
                    salesList.push({
                        id: sale.id,
                        grammage: parseFloat(sale.grammage.replace(",", ".")),
                        grammageValue: parseFloat(
                            sale.grammageValue.replace(",", "."),
                        ),
                    });
                });
            });

            salesList.forEach((sale) => {
                const resultValueSale10g =
                    (10 * sale.grammageValue) / sale.grammage;

                salesListShrimp10g.push({
                    id: sale.id,
                    grammage: 10,
                    grammageValue: Math.ceil(resultValueSale10g),
                });
            });

            salesListShrimp10g.forEach((sale) => {
                shrimpTotalValue10g += sale.grammageValue;
            });

            await saveShrimpPrice10g(
                shrimpTotalValue10g / salesListShrimp10g.length,
            );
        }
    };

    const getCleanedSalesData = () =>
        dataSale.map((sale) => ({
            ...sale,
            grammageValue: (sale.grammageValue ?? "").split(",")[0],
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
                renderItem={({ item }) => (
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
                                        *Gramatura de venda do camarão:
                                    </TitleInput>
                                    <InputStyle
                                        label="Ex.: 50g"
                                        keyboardType="numeric"
                                        value={
                                            dataSale.find(
                                                (sale) => sale.id === item.id,
                                            )?.grammage ?? ""
                                        }
                                        onChange={(value) => {
                                            const sanitizedValue =
                                                value.replace(/[^0-9,]/g, "");

                                            setDataSale((prevState) =>
                                                prevState.map((sale) =>
                                                    sale.id === item.id
                                                        ? {
                                                              ...sale,
                                                              grammage:
                                                                  sanitizedValue,
                                                          }
                                                        : sale,
                                                ),
                                            );
                                        }}
                                    />
                                </ContentInput>
                                <ContentInput>
                                    <TitleInput>
                                        *Kilo da venda do camarão:
                                    </TitleInput>
                                    <InputStyle
                                        label="Ex.: 100kg"
                                        keyboardType="numeric"
                                        value={
                                            dataSale.find(
                                                (sale) => sale.id === item.id,
                                            )?.kilo ?? ""
                                        }
                                        onChange={(value) => {
                                            const sanitizedValue =
                                                value.replace(/[^0-9,]/g, "");

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
                                <ContentInput>
                                    <TitleInput>
                                        *Preço por kilo do camarão:
                                    </TitleInput>
                                    <InputStyle
                                        label="Ex.: 28,00"
                                        keyboardType="numeric"
                                        value={
                                            dataSale.find(
                                                (sale) => sale.id === item.id,
                                            )?.grammageValue ?? ""
                                        }
                                        onChange={(value) => {
                                            const sanitizedValue =
                                                value.replace(/[^0-9]/g, "");

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
                                        onFocus={() => {
                                            setDataSale((prevState) =>
                                                prevState.map((sale) => {
                                                    if (
                                                        sale.id === item.id &&
                                                        sale.grammageValue &&
                                                        sale.grammageValue.includes(
                                                            ",",
                                                        )
                                                    ) {
                                                        return {
                                                            ...sale,
                                                            grammageValue:
                                                                sale.grammageValue.split(
                                                                    ",",
                                                                )[0],
                                                        };
                                                    }
                                                    return sale;
                                                }),
                                            );
                                        }}
                                        onBlur={() => {
                                            setDataSale((prevState) =>
                                                prevState.map((sale) => {
                                                    if (
                                                        sale.id === item.id &&
                                                        sale.grammageValue &&
                                                        !sale.grammageValue.includes(
                                                            ",",
                                                        )
                                                    ) {
                                                        return {
                                                            ...sale,
                                                            grammageValue: `${sale.grammageValue},00`,
                                                        };
                                                    }
                                                    return sale;
                                                }),
                                            );
                                        }}
                                    />
                                </ContentInput>
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
                            </ContentForm>
                        </CardShrimp>
                    </ContentCards>
                )}
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
                title="Sua publicação será finalizda!"
                text="Ao vender todos os viveiros da sua publicação, a mesma será dada como finalizada! Deseja continuar sua venda?"
                textActionButton="SIM"
                hideDialog={() => setShowAlertVisible(false)}
                actionButton={handleSaveShirimpSale}
                dismissable={false}
            />
        </Container>
    );
};
