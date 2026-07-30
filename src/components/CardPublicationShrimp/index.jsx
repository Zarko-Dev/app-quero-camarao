import { FontAwesome, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { memo, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, Platform, Share, Text, TouchableOpacity, View } from "react-native";
import { v4 } from "uuid";

import { dataRoutes } from "../../routes/dataRoutes";
import { GetUserStorage } from "../../services/Storage/UserStorage";
import { redirectWhatsappLink } from "../../utils/redirectFunctions";
import { ShrimpCardSharedActions } from "../ShrimpCardShared/actions";
import { setNewVisualizationPublication } from "../../controllers/Publication/setNewVisuaization";
import { ShareNativeAction } from "./ShareNative";
import { formatKilo } from "../../utils/formatKilo";

import Carousel from "../SnapCarousel/src";

import { AdvertisingCard } from "../AdvertisingCard";
import { ModalShrimpImages } from "./ModalShrimpImages";

import shrimpIcon from "../../assets/images/shrimpIcon.png";

import {
    ButtonBuy,
    ButtonBuyText,
    ButtonShare,
    Container,
    ContainerInfo,
    ContainerShrimp,
    ContentDataShrimp,
    ContentImageShrimp,
    ContentPondsShrimp,
    ContentTextInfo,
    LocationText,
    PondText,
    ShrimpIcon,
    ShrimpImage,
    TextInfo,
    TextShrimp,
    TextUnitMeasurement,
    LocationContainer,
    RightHeaderContainer,
    GrammageContainer,
} from "./styles";
import { getPublicationViewLogs } from "../../controllers/Publication/getPublicationViewsLogs";
import { getUserNotificationToken } from "../../controllers/User/notification";
import { SendNotifications } from "../../controllers/Notifications/sendNotifications";

export const CardPublicationShrimp = memo(
    ({
        item,
        index: indexList,
        dataAdvertising,
        sharedRef,
        openModal,
        isScrolling = false,
    }) => {
        const dispatch = useDispatch();

        const navigation = useNavigation();
        const { isAuthenticated, dataUser } = useSelector((state) => state.login);
        const { configData } = useSelector((state) => state.configSystem);

        const [isLoadingTalkProductor, setIsLoadingTalkProductor] =
            useState(false);
        const [isSharingLoading, setIsSharingLoading] = useState(false);

        const {
            id,
            location,
            ponds,
            shrimps,
            contactNumber,
            views,
            publicationViewsId,
            userId,
        } = item;

        const [showModalImagesShrimp, setShowModalImagesShrimp] =
            useState(false);

        const ConvertPondsPlural = () =>
            ponds > 1 ? `${ponds} Viveiros` : `${ponds} Viveiro`;

        const RenderImage = () => {
            const advertisingIndex = Math.floor((indexList - 4) / 5);

            if (
                indexList >= 4 &&
                (indexList - 4) % 5 === 0 &&
                advertisingIndex < dataAdvertising.length
            ) {
                return <AdvertisingCard dataAdvertising={dataAdvertising} />;
            }

            return null;
        };

        const handleRedirectPage = async () => {
            setIsLoadingTalkProductor(true);
            setShowModalImagesShrimp(false);

            if (!isAuthenticated) {
                openModal();
            } else {
                const dataUser = await GetUserStorage();
                const whatsappMessage = `Olá, venho através do aplicativo *Quero Camarão* 🦐\n\nMe chamo *${dataUser.name.split(" ")[0]}*, vi seu anuncio e gostaria de Negociar seu camarão.\n\n*${ConvertPondsPlural()}*\n\n${shrimps.map((shrimp) => `*${shrimp.grammage}g/${shrimp.kilo}kg*`).join("\n")}\n${location}`;

                const dataViews = await getPublicationViewLogs(publicationViewsId);

                await setNewVisualizationPublication(
                    id,
                    publicationViewsId || v4(),
                    views || 0,
                    dataViews.views,
                    {
                        userId: dataUser.email,
                        userName: dataUser.name,
                        userPhone: dataUser.phone,
                        userType: dataUser.userType,
                        userImage: dataUser.userImage,
                        createdAt: new Date(),
                    },
                    {
                        location,
                        shrimps,
                        userId,
                    },
                );

                const result = await getUserNotificationToken(userId);

                if (!result.error) {
                    const notificationToken = result.data;
                    const userNameView = dataUser.name;

                    SendNotifications(
                        [notificationToken],
                        "👀 Sua publicação teve uma visualização!",
                        `${userNameView} Visualizou sua publicação!`,
                    );
                }

                navigation.navigate(dataRoutes.redirect, {
                    subtext: "Estamos lhe redirecionado ao whatsapp do produtor que selecionou",
                    actionRediret: redirectWhatsappLink(
                        contactNumber,
                        whatsappMessage,
                        navigation,
                    ),
                });
            }

            setIsLoadingTalkProductor(false);
        };

        const handleOpenModalShrimpImage = () => {
            setShowModalImagesShrimp(true);
        };

        const handleShareShrimpCard = async () => {
            setIsSharingLoading(true);

            dispatch({
                type: ShrimpCardSharedActions.GET_DATA_SHRIP_CARD_ACTION,
                dataShrimp: {
                    location,
                    ponds: ConvertPondsPlural(),
                    shrimps,
                },
            });

            setTimeout(async () => {
                const dataUri = await sharedRef.current.capture();

                if (Platform.OS === "android") {
                    await ShareNativeAction(
                        configData.androidUrl,
                        configData.iosUrl,
                        ConvertPondsPlural(),
                        location,
                        dataUri,
                    );
                } else if (Platform.OS === "ios") {
                    try {
                        await Share.share({
                            url: dataUri,
                        });
                    } catch (error) {
                        console.error("Erro ao compartilhar:", error.message);
                    }
                }

                setIsSharingLoading(false);
            }, 2000);
        };

        const openChat = async () => {
            const producerName = item.sellerName ?? item.publicationTitle ?? "Produtor";
            const greetingName = producerName.split(" ")[0];
            const dataUser = await GetUserStorage();
            const buyerFirstName = dataUser?.name?.split(" ")[0] || "Comprador";
            const shrimpLines = (item.shrimps ?? [])
                .map((shrimp) => `🦐 Tamanho: ${shrimp.grammage}g / 📦 Quantidade: ${formatKilo(shrimp.kilo)}kg`)
                .join("\n");
            const pondsLine = `🌊 Viveiro: ${item.ponds} ${item.ponds > 1 ? "viveiros" : "viveiro"}`;
            const initialMessage = `Olá, ${greetingName}! Tudo bem?\n\nMeu nome é ${buyerFirstName}. Vi seu anúncio no aplicativo Quero Camarão e tenho interesse na compra:\n\n${shrimpLines}\n${pondsLine}\n\nO camarão ainda está disponível?\n\nQual é o preço da tabela?`;
            navigation.navigate(dataRoutes.publicationChat, {
                publication: item,
                sellerId: item.userId,
                sellerName: producerName,
                initialMessage,
                autoSend: true,
            });
        };

        const ItemImage = ({ index, item: itemValue }) => (
            <ShrimpImage key={index} uri={itemValue.imageShrimpUri} />
        );

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
        const shrimpImageData = useMemo(() => generateShrimpImage(), [shrimps]);
        const shouldUseCarousel =
            Platform.OS !== "android" && shrimpImageData.data.length > 1;

        const wp = (percentage) => {
            const Screen = Dimensions.get("window");
            const value = (percentage * Screen.width) / 100;
            return Math.round(value);
        };

        return (
            <>
                <Container $disableShadow={Platform.OS === "android" && isScrolling}>
                    <ContentPondsShrimp>
                        <LocationContainer>
                            <Feather name="map-pin" size={18} color="#e85d22" />
                            <LocationText numberOfLines={1} ellipsizeMode="tail">
                                {location}
                            </LocationText>
                        </LocationContainer>
                        <RightHeaderContainer>
                            <PondText>{ConvertPondsPlural()}</PondText>
                            <ButtonShare onPress={handleShareShrimpCard}>
                                {!isSharingLoading ? (
                                    <MaterialCommunityIcons name="share-outline" size={24} color="#e85d22" />
                                ) : (
                                    <ActivityIndicator animating size={20} color="#e85d22" />
                                )}
                            </ButtonShare>
                        </RightHeaderContainer>
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
                            {shouldUseCarousel ? (
                                <Carousel
                                    data={shrimpImageData.data}
                                    renderItem={ItemImage}
                                    sliderWidth={wp(38)}
                                    itemWidth={wp(38)}
                                    autoplay
                                    enableMomentum={false}
                                    lockScrollWhileSnapping
                                    autoplayInterval={3000}
                                    loop
                                    decelerationRate="normal"
                                />
                            ) : (
                                <ShrimpImage
                                    uri={shrimpImageData.data?.[0]?.imageShrimpUri}
                                />
                            )}
                        </ContentImageShrimp>

                        <ContentDataShrimp>
                            <GrammageContainer>
                                <ContentTextInfo>
                                    <TextInfo>Gramatura/Quilos</TextInfo>
                                </ContentTextInfo>
                                <View>
                                    {shrimps.map((shrimp, index) => (
                                        <ContainerShrimp key={index}>
                                            <ShrimpIcon source={shrimpIcon} />
                                            <TextShrimp sale={shrimp?.sale}>
                                                {`${shrimp.grammage}`}
                                                <TextUnitMeasurement>g</TextUnitMeasurement>
                                                {" / "}
                                                {`${formatKilo(shrimp.kilo)}`}
                                                <TextUnitMeasurement>Kg</TextUnitMeasurement>
                                            </TextShrimp>
                                        </ContainerShrimp>
                                    ))}
                                </View>
                            </GrammageContainer>
                        </ContentDataShrimp>
                    </ContainerInfo>
                    {isAuthenticated && dataUser?.email !== item.userId && (
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <ButtonBuy
                                onPress={handleRedirectPage}
                                style={{ flex: 1, paddingHorizontal: 16, justifyContent: "center", alignItems: "center", gap: 8 }}
                            >
                                {!isLoadingTalkProductor ? (
                                    <FontAwesome name="whatsapp" size={26} color="white" />
                                ) : (
                                    <ActivityIndicator animating size={20} color="white" />
                                )}
                                <ButtonBuyText>Falar com o produtor</ButtonBuyText>
                            </ButtonBuy>
                            <TouchableOpacity
                                onPress={openChat}
                                activeOpacity={0.8}
                                style={{
                                    flex: 1,
                                    height: 44,
                                    backgroundColor: "#36536e",
                                    borderRadius: 8,
                                    paddingHorizontal: 10,
                                    marginLeft: 8,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                }}
                            >
                                <Feather name="message-circle" size={16} color="#fff" />
                                <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
                                    CHAT
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Container>
                <RenderImage />
                <ModalShrimpImages
                    visible={showModalImagesShrimp}
                    onClose={() => setShowModalImagesShrimp(false)}
                    actionBuy={handleRedirectPage}
                    actionChat={() => {
                        setShowModalImagesShrimp(false);
                        openChat();
                    }}
                    showChatButton={isAuthenticated && dataUser?.email !== item.userId}
                    dataShrimp={shrimpImageData.data}
                    isLoading={isLoadingTalkProductor}
                />
            </>
        );
    },
    (prevProps, nextProps) =>
        prevProps.item === nextProps.item &&
        prevProps.index === nextProps.index &&
        prevProps.dataAdvertising === nextProps.dataAdvertising &&
        prevProps.sharedRef === nextProps.sharedRef &&
        prevProps.openModal === nextProps.openModal &&
        prevProps.isScrolling === nextProps.isScrolling,
);
