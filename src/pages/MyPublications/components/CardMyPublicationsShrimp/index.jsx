/* eslint-disable react/jsx-wrap-multilines */
/* eslint-disable indent */
/* eslint-disable no-nested-ternary */
/* eslint-disable operator-linebreak */
/* eslint-disable function-paren-newline */
/* eslint-disable object-curly-newline */
/* eslint-disable react/no-array-index-key */

import { memo, useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Divider, Menu } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { Modal, TouchableOpacity } from "react-native";
import { v4 } from "uuid";

import {
    deletePublication,
    deletePublicationImages,
} from "../../../../controllers/Publication/delete";
import { requestAnalysis } from "../../../../controllers/Publication/requestAnalysis";

import Carousel from "../../../../components/SnapCarousel/src";
import { ModalShrimpImages } from "../../../../components/CardPublicationShrimp/ModalShrimpImages";
import { RegressivePublicationShrimpTimer } from "../RegressivePublicationShrimpTimer";
import { DialogComponent } from "../../../../components/Dialog";

import shrimpIcon from "../../../../assets/images/shrimpIcon.png";

import {
    ButtonBuy,
    ButtonBuyText,
    ButtonEditSaleponds,
    ButtonMenu,
    ButtonSaleponds,
    Container,
    ContainerInfo,
    ContainerShrimp,
    ContentActionButtons,
    ContentDataShrimp,
    ContentExpired,
    ContentImageShrimp,
    ContentMenu,
    ContentPondsShrimp,
    ContentTextInfo,
    ContentTextShrimp,
    ContentVisualizations,
    LocationText,
    PondText,
    ShrimpIcon,
    ShrimpImage,
    TextButton,
    TextInfo,
    TextShrimp,
    TextVisualizations,
} from "./styles";
import { BoxShadowIos } from "../../../../styles/IosShadow";
import { theme } from "../../../../styles/Theme";
import { dataRoutes } from "../../../../routes/dataRoutes";
import { SelectShrimpForSale } from "../ShirimpSale/SelectShrimpForSale";
import { getShirimpSale } from "../../../../controllers/ShirimpSale/sale";

export const CardMyPublicationsShrimp = memo(({ item, action }) => {
    const navigation = useNavigation();

    const [expired, setExpired] = useState(false);
    const [isLoadingDelete, setIsLoadingDelete] = useState(false);
    const [isLoadingExtension, setIsLoadingExtension] = useState(false);
    const [showAlertVisible, setShowAlertVisible] = useState(false);
    const [showAlertExtendsVisible, setShowAlertExtendsVisible] =
        useState(false);
    const [showModalImagesShrimp, setShowModalImagesShrimp] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [showSalePondsDialog, setShowSalePondsDialog] = useState(false);
    const [saleShrimpsList, setSaleShrimpsList] = useState([]);
    const [originalShrimps, setOriginalShrimps] = useState([]);
    const [isEditShrimpSale, setIsEditShrimpSale] = useState(false);

    const {
        id,
        location,
        ponds,
        shrimps,
        createdAt,
        views,
        requestExtensionDate,
        userId,
    } = item;

    useEffect(() => {
        const dateExpiration = new Date(createdAt);
        dateExpiration.setDate(
            dateExpiration.getDate() +
                (requestExtensionDate === "approved" ? 22 : 15),
        );
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() - 3);

        const diferenca = dateExpiration - currentDate;
        if (diferenca <= 0) {
            setExpired(true);
        } else if (shrimps.every((sale) => sale.sale === true)) {
            setExpired(true);
        }
    }, []);

    const ConvertPondsPlural = () =>
        ponds > 1 ? `${ponds} Viveiros` : `${ponds} Viveiro`;

    const handleOpenModalShrimpImage = () => {
        setShowModalImagesShrimp(true);
    };

    const ItemImage = ({ index, item: itemValue }) => (
        <ShrimpImage key={index} uri={itemValue.imageShrimpUri} />
    );

    const handleDeletePublication = () => {
        setShowAlertVisible(false);
        setIsLoadingDelete(true);

        deletePublication(id)
            .then((result) => {
                if (result) {
                    const logImages = [];

                    shrimps.map((image) => {
                        if (image.imageShrimpUri !== "") {
                            logImages.push(
                                image.imageShrimpUri
                                    .split("Shrimp%2F")[1]
                                    .split("?alt=")[0],
                            );
                        }

                        return null;
                    });

                    if (logImages.length > 0) {
                        for (let index = 0; index < logImages.length; index++) {
                            deletePublicationImages(logImages[index])
                                .then()
                                .catch();
                        }
                    }

                    Toast.show({
                        type: "success",
                        text1: "Publicação excluída com sucesso!",
                    });

                    action((data) =>
                        data.filter((dataItem) => dataItem.id !== id),
                    );
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Não foi possível excluir sua publicação!",
                        text2: "Tente novamente em instantes",
                    });
                }
            })
            .catch()
            .finally(() => {
                setIsLoadingDelete(false);
            });
    };

    const handleExtendsPublicationDate = () => {
        setShowAlertExtendsVisible(false);
        setIsLoadingExtension(true);

        requestAnalysis(id)
            .then((result) => {
                if (result) {
                    action((data) =>
                        data.map((dataItem) => {
                            if (dataItem.id === id) {
                                return {
                                    ...dataItem,
                                    requestExtensionDate: "analysis",
                                };
                            }

                            return dataItem;
                        }),
                    );

                    Toast.show({
                        type: "success",
                        text1: "Solicitação enviada!",
                        text2: "Sua solicitação foi enviada para análise!",
                    });
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Erro ao enviar solicitação!",
                        text2: "Tente novamente em instantes!",
                    });
                }
            })
            .catch()
            .finally(() => {
                setIsLoadingExtension(false);
            });
    };

    const generateShrimpImage = () => {
        const hasNonNullImageUri = shrimps.some(
            (itemSome) =>
                itemSome.imageShrimpUri !== null &&
                itemSome.imageShrimpUri !== "",
        );

        if (shrimps.length === 1) {
            return {
                data: shrimps,
                emptyImage: hasNonNullImageUri,
            };
        }

        if (hasNonNullImageUri) {
            return {
                data: shrimps.filter(
                    (itemShrimps) =>
                        itemShrimps.imageShrimpUri !== null &&
                        itemShrimps.imageShrimpUri !== "",
                ),
                emptyImage: hasNonNullImageUri,
            };
        }

        return { data: [shrimps[0]], emptyImage: hasNonNullImageUri };
    };

    const hadleEditPublication = (dataPublication) => {
        navigation.navigate(dataRoutes.publication, {
            editable: true,
            dataPublication,
        });
    };

    const hadleRedirectViewLogs = (publicationViewId) => {
        if (publicationViewId) {
            navigation.navigate(dataRoutes.publicationViewLogs, {
                publicationViewId,
            });
        } else {
            Toast.show({
                type: "success",
                text1: "Sua publicação ainda não possui visualizações!",
            });
        }
    };

    const handleOpenDialogSalePonds = () => {
        const updateShrimps = shrimps.map((shrimp) => ({
            id: v4(),
            ...shrimp,
        }));

        setIsEditShrimpSale(false);
        setSaleShrimpsList(updateShrimps.filter((shrimp) => !shrimp?.sale));
        setOriginalShrimps(updateShrimps);

        setShowSalePondsDialog(true);
    };

    const handleOpenDialogEditSalePonds = async () => {
        const dataResult = await getShirimpSale(id);

        setSaleShrimpsList(dataResult.sales);
        setIsEditShrimpSale(true);

        setShowSalePondsDialog(true);
    };

    const getButtonVisibility = () => {
        const allShrimpsSold = shrimps.every((sale) => sale.sale === true);
        const noShrimpsSold = shrimps.every(
            (sale) => sale.sale === false || sale.sale === undefined,
        );
        const someShrimpsSold =
            shrimps.some((sale) => sale.sale === true) && !allShrimpsSold;

        return {
            info: noShrimpsSold || someShrimpsSold,
            edit: allShrimpsSold || someShrimpsSold,
        };
    };

    const buttonVisibility = getButtonVisibility();

    return (
        <>
            <Container style={BoxShadowIos}>
                <ContentPondsShrimp>
                    <LocationText>{location}</LocationText>
                    <PondText>{ConvertPondsPlural()}</PondText>
                    <ContentMenu>
                        <Menu
                            visible={menuVisible}
                            onDismiss={() => setMenuVisible(false)}
                            anchor={
                                <ButtonMenu
                                    onPress={() => setMenuVisible(true)}
                                >
                                    <FontAwesome
                                        name="ellipsis-v"
                                        size={24}
                                        color="black"
                                    />
                                </ButtonMenu>
                            }
                        >
                            <Menu.Item
                                onPress={() => {
                                    setMenuVisible(false);
                                    hadleEditPublication(item);
                                }}
                                title="Editar publicação"
                                leadingIcon="pencil"
                                disabled={
                                    item.edited !== undefined &&
                                    item.edited === 3
                                }
                            />
                            <Menu.Item
                                onPress={() => {
                                    setMenuVisible(false);
                                    setShowAlertExtendsVisible(true);
                                }}
                                title={
                                    requestExtensionDate === "approved"
                                        ? "Extensão aprovada"
                                        : requestExtensionDate === "analysis"
                                          ? "Extensão em análise"
                                          : "Estender publicação"
                                }
                                leadingIcon={
                                    requestExtensionDate === "approved"
                                        ? "clock-check"
                                        : requestExtensionDate === "analysis"
                                          ? "clock"
                                          : "calendar-clock"
                                }
                                disabled={
                                    !isLoadingExtension &&
                                    (requestExtensionDate === "approved" ||
                                        requestExtensionDate === "analysis" ||
                                        expired)
                                }
                            />
                            <Divider />
                            <Menu.Item
                                onPress={() => {
                                    setMenuVisible(false);
                                    setShowAlertVisible(true);
                                }}
                                title="Excluir publicação"
                                leadingIcon="delete-outline"
                                disabled={isLoadingDelete}
                                theme={{
                                    colors: {
                                        onSurfaceVariant: theme.colors.red,
                                        onSurface: theme.colors.red,
                                    },
                                }}
                            />
                        </Menu>
                    </ContentMenu>
                </ContentPondsShrimp>
                <ContainerInfo>
                    <ContentImageShrimp
                        activeOpacity={0.5}
                        onPress={
                            shrimps.some(
                                (itemSome) =>
                                    itemSome.imageShrimpUri !== null &&
                                    itemSome.imageShrimpUri !== "",
                            )
                                ? handleOpenModalShrimpImage
                                : () => {}
                        }
                    >
                        <Carousel
                            data={generateShrimpImage().data}
                            renderItem={ItemImage}
                            sliderWidth={Number(
                                theme.size.componentSize(103).replace("px", ""),
                            )}
                            itemWidth={Number(
                                theme.size.componentSize(103).replace("px", ""),
                            )}
                            autoplay
                            enableMomentum={false}
                            lockScrollWhileSnapping
                            autoplayInterval={6000}
                            loop
                            decelerationRate="normal"
                        />
                    </ContentImageShrimp>
                    <ContentDataShrimp>
                        <ContentTextInfo>
                            <TextInfo>Gramatura/Quilos</TextInfo>
                        </ContentTextInfo>
                        <ContainerShrimp shrimpDimentions={shrimps.length}>
                            {shrimps.map((shrimp, index) => (
                                <ContentTextShrimp key={index}>
                                    <ShrimpIcon source={shrimpIcon} />
                                    <TextShrimp
                                        shrimpDimentions={shrimps.length}
                                        sale={shrimp?.sale}
                                    >
                                        {`${shrimp.grammage}g / ${shrimp.kilo}Kg`}
                                    </TextShrimp>
                                </ContentTextShrimp>
                            ))}
                        </ContainerShrimp>
                        <ButtonBuy>
                            <ButtonBuyText>
                                <RegressivePublicationShrimpTimer
                                    dateValue={createdAt}
                                    extensionDate={requestExtensionDate}
                                    sale={shrimps.every(
                                        (sale) => sale.sale === true,
                                    )}
                                />
                            </ButtonBuyText>
                        </ButtonBuy>
                    </ContentDataShrimp>
                </ContainerInfo>
                {expired && <ContentExpired />}
            </Container>
            <ContentVisualizations>
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() =>
                        hadleRedirectViewLogs(item?.publicationViewsId)
                    }
                >
                    <TextVisualizations>
                        <FontAwesome name="eye" size={18} color="black" />{" "}
                        Quantidade de visualizações: {views || 0}
                    </TextVisualizations>
                </TouchableOpacity>
            </ContentVisualizations>
            <ContentActionButtons>
                {buttonVisibility.info && (
                    <ButtonSaleponds
                        onPress={handleOpenDialogSalePonds}
                        only={!buttonVisibility.edit}
                    >
                        <TextButton>Informar Venda</TextButton>
                    </ButtonSaleponds>
                )}

                {buttonVisibility.edit && !expired && (
                    <ButtonEditSaleponds
                        onPress={handleOpenDialogEditSalePonds}
                        only={!buttonVisibility.info}
                    >
                        <TextButton>Editar Venda</TextButton>
                    </ButtonEditSaleponds>
                )}
            </ContentActionButtons>
            <ModalShrimpImages
                visible={showModalImagesShrimp}
                onClose={() => setShowModalImagesShrimp(false)}
                dataShrimp={generateShrimpImage().data}
                showActionButton={false}
            />
            <DialogComponent
                visible={showAlertVisible}
                title="Exclusão da publicação!"
                text="Deseja realmente excluir sua publicação?"
                textActionButton="Excluir"
                hideDialog={() => setShowAlertVisible(false)}
                actionButton={() => handleDeletePublication()}
                dismissable={false}
            />
            <DialogComponent
                visible={showAlertExtendsVisible}
                title="Estender o tempo em mais 7 dias?"
                text={`Deseja estender o tempo de sua publicação em mais 7 dias?
\nSua solicitação será enviada para análise!`}
                textActionButton="Solicitar"
                hideDialog={() => setShowAlertExtendsVisible(false)}
                actionButton={() => handleExtendsPublicationDate()}
                dismissable={false}
            />
            <Modal
                animationType="slide"
                visible={showSalePondsDialog}
                onRequestClose={() => setShowSalePondsDialog(false)}
            >
                <SelectShrimpForSale
                    onClose={() => setShowSalePondsDialog(false)}
                    shrimpList={saleShrimpsList}
                    dataPublication={{
                        id,
                        location,
                        shrimps: originalShrimps,
                        responseId: userId,
                    }}
                    isEdit={isEditShrimpSale}
                    navigation={navigation}
                />
            </Modal>
        </>
    );
});
