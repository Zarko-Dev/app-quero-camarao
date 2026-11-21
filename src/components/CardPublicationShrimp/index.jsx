import { Feather, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { memo, useMemo, useRef, useState, useEffect } from "react";
import { ActivityIndicator, Dimensions, Linking, Platform, Text, TouchableOpacity, View } from "react-native";
import { v4 } from "uuid";

import { dataRoutes } from "../../routes/dataRoutes";
import { GetUserStorage } from "../../services/Storage/UserStorage";
import { buildWhatsAppAppUrl } from "../../utils/adminPublicationWhatsApp";
import { ShrimpCardSharedActions } from "../ShrimpCardShared/actions";
import { isAdmin } from "../../controllers/Cupons/isAdmin";
import { setPublicationImageHidden } from "../../controllers/Publication/updatePublication";
import { setNewVisualizationPublication } from "../../controllers/Publication/setNewVisuaization";
import { ShareNativeAction } from "./ShareNative";
import { formatKilo } from "../../utils/formatKilo";

import Carousel from "../SnapCarousel/src";

import { AdvertisingCard } from "../AdvertisingCard";
import { ModalShrimpImages } from "./ModalShrimpImages";

import shrimpIcon from "../../assets/images/shrimpIcon.png";

import {
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
import { getUserNotificationToken } from "../../controllers/User/notification";
import { SendNotifications } from "../../controllers/Notifications/sendNotifications";

const adminCheckCache = new Map();

// Uma leitura por e-mail: a lista renderiza muitos cards.
const getCachedIsAdmin = (email) => {
    if (!adminCheckCache.has(email)) {
        adminCheckCache.set(email, isAdmin(email));
    }

    return adminCheckCache.get(email);
};

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
        const { isAuthenticated } = useSelector((state) => state.login);
        const [localUser, setLocalUser] = useState(null);
        const [userIsAdmin, setUserIsAdmin] = useState(false);
        const [imageHidden, setImageHidden] = useState(Boolean(item.imageHidden));

        useEffect(() => {
            setImageHidden(Boolean(item.imageHidden));
        }, [item.imageHidden]);

        useEffect(() => {
            if (isAuthenticated) {
                GetUserStorage()
                    .then((user) => {
                        setLocalUser(user);
                        return getCachedIsAdmin(user?.email);
                    })
                    .then(setUserIsAdmin)
                    .catch(() => {});
            }
        }, [isAuthenticated]);

        const handleToggleImageHidden = async () => {
            const next = !imageHidden;
            setImageHidden(next);

            const saved = await setPublicationImageHidden(item.id, next);

            if (!saved) {
                setImageHidden(!next);
            }
        };

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

        // Mesmo id de log para WhatsApp e chat enquanto o item não traz o id salvo.
        const fallbackViewsIdRef = useRef(v4());
        // A home só recarrega ao ganhar foco; o WhatsApp sai e volta sem trocar
        // de tela, então o contador é atualizado localmente após gravar.
        const [viewsCount, setViewsCount] = useState(views || 0);
        const [viewsLogId, setViewsLogId] = useState(publicationViewsId || null);

        useEffect(() => {
            setViewsCount(views || 0);
            if (publicationViewsId) setViewsLogId(publicationViewsId);
        }, [views, publicationViewsId]);

        // Conta a visualização (WhatsApp e chat) e avisa o produtor.
        const registerView = async (dataUser) => {
            const logId = publicationViewsId || fallbackViewsIdRef.current;
            const saved = await setNewVisualizationPublication(
                id,
                logId,
                // Nome e telefone: o produtor chama o comprador no WhatsApp pela lista.
                {
                    userName: dataUser.name,
                    userPhone: dataUser.phone ?? "",
                    createdAt: new Date(),
                },
                {
                    location,
                    shrimps,
                    userId,
                },
            );

            if (!saved) return;

            setViewsCount((count) => count + 1);
            setViewsLogId(logId);

            const result = await getUserNotificationToken(userId);

            if (!result.error) {
                SendNotifications(
                    [result.data],
                    "👀 Sua publicação teve uma visualização!",
                    `${dataUser.name} Visualizou sua publicação!`,
                );
            }
        };

        const handleRedirectPage = async () => {
            setIsLoadingTalkProductor(true);
            setShowModalImagesShrimp(false);

            if (!isAuthenticated) {
                openModal();
            } else {
                const dataUser = await GetUserStorage();
                const whatsappMessage = `Olá, venho através do aplicativo *Quero Camarão* 🦐\n\nMe chamo *${dataUser.name.split(" ")[0]}*, vi seu anuncio e gostaria de Negociar seu camarão.\n\n*${ConvertPondsPlural()}*\n\n${shrimps.map((shrimp) => `*${shrimp.grammage}g/${shrimp.kilo}kg*`).join("\n")}\n${location}`;

                await registerView(dataUser);

                const whatsappUrl = buildWhatsAppAppUrl(
                    contactNumber,
                    whatsappMessage,
                );

                try {
                    if (!whatsappUrl) throw new Error("sem telefone");
                    await Linking.openURL(whatsappUrl);
                } catch {
                    Toast.show({
                        type: "error",
                        text1: "Não conseguimos abrir o WhatsApp",
                        text2: whatsappUrl
                            ? "Verifique se o WhatsApp está instalado."
                            : "Este anúncio não tem telefone válido.",
                    });
                }
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
                await ShareNativeAction({
                    id, location, ponds: ConvertPondsPlural(), shrimps,
                });

                setIsSharingLoading(false);
            }, 2000);
        };

        const openChat = async () => {
            if (localUser) registerView(localUser).catch(() => {});

            const producerName = item.sellerName ?? item.publicationTitle ?? "Produtor";
            const greetingName = producerName.split(" ")[0];
            const buyerFirstName = localUser?.name?.split(" ")[0] || "Comprador";
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

        const canSeeViews = userIsAdmin || (localUser?.email && localUser.email === userId);

        const handleOpenViewLogs = () => {
            if (viewsLogId) {
                navigation.navigate(dataRoutes.publicationViewLogs, {
                    publicationViewId: viewsLogId,
                });
            } else {
                Toast.show({
                    type: "success",
                    text1: "Sua publicação ainda não possui visualizações!",
                });
            }
        };

        const ItemImage = ({ index, item: itemValue }) => (
            <ShrimpImage key={index} uri={itemValue.imageShrimpUri} />
        );

        const generateShrimpImage = () => {
            if (imageHidden) {
                return { data: [{ ...shrimps[0], imageShrimpUri: null }], emptyImage: false };
            }

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
        const shrimpImageData = useMemo(() => generateShrimpImage(), [shrimps, imageHidden]);
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
                            {userIsAdmin && (
                                <ButtonShare
                                    onPress={handleToggleImageHidden}
                                    accessibilityLabel={imageHidden ? "Mostrar imagem" : "Ocultar imagem"}
                                >
                                    <MaterialCommunityIcons
                                        name={imageHidden ? "image-outline" : "image-off-outline"}
                                        size={22}
                                        color={imageHidden ? "#25D366" : "#d32f2f"}
                                    />
                                </ButtonShare>
                            )}
                            {canSeeViews && (
                                <ButtonShare
                                    onPress={handleOpenViewLogs}
                                    accessibilityLabel={`${viewsCount} visualizações. Ver quem visualizou`}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 4,
                                        marginRight: 10,
                                    }}
                                >
                                    <MaterialCommunityIcons name="eye-outline" size={20} color="#e85d22" />
                                    <Text style={{ color: "#e85d22", fontWeight: "700" }}>{viewsCount}</Text>
                                </ButtonShare>
                            )}
                            <PondText>{ConvertPondsPlural()}</PondText>
                            <ButtonShare onPress={handleShareShrimpCard} accessibilityLabel="Compartilhar encarte">
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
                                !imageHidden && shrimps.some(
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
                                            <TextShrimp sale={shrimp?.sale} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                                                {`${shrimp.grammage}`}
                                                <TextUnitMeasurement>g</TextUnitMeasurement>
                                                {" / "}
                                                {`${formatKilo(shrimp.kilo)}`}
                                                <TextUnitMeasurement>kg</TextUnitMeasurement>
                                            </TextShrimp>
                                        </ContainerShrimp>
                                    ))}
                                </View>
                            </GrammageContainer>
                        </ContentDataShrimp>
                    </ContainerInfo>
                    {isAuthenticated && localUser?.email !== item.userId && (
                        <View style={{ flexDirection: "row", alignItems: "center", margin: 15, marginTop: 12, gap: 10 }}>
                            <TouchableOpacity
                                onPress={handleRedirectPage}
                                disabled={isLoadingTalkProductor}
                                activeOpacity={0.8}
                                accessibilityLabel="Falar com o produtor pelo WhatsApp"
                                style={{
                                    flex: 1,
                                    height: 44,
                                    backgroundColor: "#25D366",
                                    borderRadius: 12,
                                    paddingHorizontal: 10,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                }}
                            >
                                {!isLoadingTalkProductor ? (
                                    <FontAwesome name="whatsapp" size={18} color="#fff" />
                                ) : (
                                    <ActivityIndicator animating size={16} color="#fff" />
                                )}
                                <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
                                    WhatsApp
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={openChat}
                                activeOpacity={0.8}
                                accessibilityLabel="Falar com o produtor pelo chat do app"
                                style={{
                                    flex: 1,
                                    height: 44,
                                    backgroundColor: "#e85d22",
                                    borderRadius: 12,
                                    paddingHorizontal: 10,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 6,
                                }}
                            >
                                <Feather name="message-circle" size={16} color="#fff" />
                                <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
                                    Fale com Produtor
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
                    showChatButton={isAuthenticated && localUser?.email !== item.userId}
                    showWhatsappButton={isAuthenticated && localUser?.email !== item.userId}
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
