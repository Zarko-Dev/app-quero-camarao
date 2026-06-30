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
import { Modal, FlatList, TouchableOpacity, Linking, ActivityIndicator, View, Text } from "react-native";
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
import { getPublicationViewLogs } from "../../../../controllers/Publication/getPublicationViewsLogs";

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
    const [viewerModalVisible, setViewerModalVisible] = useState(false);
    const [viewerGroups, setViewerGroups] = useState([]);
    const [viewerLoading, setViewerLoading] = useState(false);

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

    const openViewers = async () => {
        setViewerModalVisible(true);
        setViewerLoading(true);
        const result = await getPublicationViewLogs(item?.publicationViewsId);
        const raw = result?.views ?? [];
        const sorted = [...raw].sort((a, b) => {
            const da = a.createdAt?.toDate?.() ?? new Date(a.createdAt);
            const db = b.createdAt?.toDate?.() ?? new Date(b.createdAt);
            return db - da;
        });
        const grouped = sorted.reduce((acc, view) => {
            const d = view.createdAt?.toDate?.() ?? new Date(view.createdAt);
            const key = d.toLocaleDateString("pt-BR");
            if (!acc[key]) acc[key] = [];
            acc[key].push(view);
            return acc;
        }, {});
        setViewerGroups(Object.entries(grouped));
        setViewerLoading(false);
    };

    const contactViewer = (phone) => {
        const clean = String(phone ?? "").replace(/\D/g, "");
        if (!clean) return;
        Linking.openURL(`whatsapp://send?phone=55${clean}`);
    };

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
                <TouchableOpacity onPress={openViewers} activeOpacity={0.7} style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <Text style={{ fontSize: 11, color: "#5f7b94", textDecorationLine: "underline" }}>Ver quem visualizou</Text>
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
                visible={viewerModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setViewerModalVisible(false)}
            >
                <TouchableOpacity
                    style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
                    activeOpacity={1}
                    onPress={() => setViewerModalVisible(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: "#fff",
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            maxHeight: "75%",
                            padding: 16,
                        }}
                    >
                        <Text style={{ fontWeight: "800", fontSize: 16, color: "#36536e", marginBottom: 12 }}>
                            Visualizações
                        </Text>
                        {viewerLoading ? (
                            <ActivityIndicator color="#f55b1f" style={{ marginVertical: 20 }} />
                        ) : viewerGroups.length === 0 ? (
                            <Text style={{ color: "#8fa3b2", textAlign: "center", marginVertical: 20 }}>
                                Nenhuma visualização registrada
                            </Text>
                        ) : (
                            <FlatList
                                data={viewerGroups}
                                keyExtractor={([day]) => day}
                                renderItem={({ item: [day, views] }) => (
                                    <View style={{ marginBottom: 14 }}>
                                        <Text style={{ fontWeight: "700", color: "#f55b1f", marginBottom: 6, fontSize: 13 }}>
                                            {day}
                                        </Text>
                                        {views.map((v, i) => (
                                            <View
                                                key={i}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    paddingVertical: 8,
                                                    borderBottomWidth: 1,
                                                    borderBottomColor: "#f0f5fb",
                                                }}
                                            >
                                                <View style={{ flex: 1 }}>
                                                    <Text style={{ fontWeight: "600", color: "#36536e", fontSize: 13 }}>
                                                        {v.userName || "—"}
                                                    </Text>
                                                    <Text style={{ fontSize: 11, color: "#8fa3b2" }}>
                                                        {v.userType}
                                                    </Text>
                                                </View>
                                                {v.userPhone ? (
                                                    <TouchableOpacity
                                                        onPress={() => contactViewer(v.userPhone)}
                                                        activeOpacity={0.7}
                                                        style={{
                                                            backgroundColor: "#25d366",
                                                            borderRadius: 6,
                                                            paddingHorizontal: 10,
                                                            paddingVertical: 5,
                                                            flexDirection: "row",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                                                            Contato
                                                        </Text>
                                                    </TouchableOpacity>
                                                ) : null}
                                            </View>
                                        ))}
                                    </View>
                                )}
                            />
                        )}
                        <TouchableOpacity
                            onPress={() => setViewerModalVisible(false)}
                            style={{ marginTop: 12, alignItems: "center", paddingVertical: 8 }}
                        >
                            <Text style={{ color: "#5f7b94", fontWeight: "600" }}>Fechar</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
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
