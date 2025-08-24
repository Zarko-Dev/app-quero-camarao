/* eslint-disable indent */
/* eslint-disable object-curly-newline */
/* eslint-disable operator-linebreak */
/* eslint-disable react/no-array-index-key */

import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { memo, useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import { Dimensions, Platform, Share } from "react-native";
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
    ContentTextShrimp,
    LocationText,
    PondText,
    ShrimpIcon,
    ShrimpImage,
    TextInfo,
    TextShrimp,
    TextUnitMeasurement,
} from "./styles";
import { BoxShadowIos } from "../../styles/IosShadow";
import { getPublicationViewLogs } from "../../controllers/Publication/getPublicationViewsLogs";
import { getUserNotificationToken } from "../../controllers/User/notification";
import { SendNotifications } from "../../controllers/Notifications/sendNotifications";

export const CardPublicationShrimp = memo(
    ({ item, index: indexList, dataAdvertising, sharedRef, openModal }) => {
        const dispatch = useDispatch();

        const navigation = useNavigation();
        const { isAuthenticated } = useSelector((state) => state.login);
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
                const whatsappMessage = `Olá, venho através do aplicativo *Quero Camarão* 🦐

Me chamo *${
                    dataUser.name.split(" ")[0]
                }*, vi seu anuncio e gostaria de Negociar seu camarão.

*${ConvertPondsPlural()}*

${shrimps.map(
    (shrimp) => `*${shrimp.grammage}g/${shrimp.kilo}kg*
`,
)}
${location}`;

                const dataViews =
                    await getPublicationViewLogs(publicationViewsId);

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
                    subtext:
                        "Estamos lhe redirecionado ao whatsapp do produtor que selecionou",
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

        const wp = (percentage) => {
            const Screen = Dimensions.get("window");
            const value = (percentage * Screen.width) / 100;

            return Math.round(value);
        };

        return (
            <>
                <Container style={BoxShadowIos}>
                    <ContentPondsShrimp>
                        <LocationText>{location}</LocationText>
                        <PondText>{ConvertPondsPlural()}</PondText>
                        <ButtonShare onPress={handleShareShrimpCard}>
                            {!isSharingLoading ? (
                                <FontAwesome
                                    name="share"
                                    size={18}
                                    color="black"
                                />
                            ) : (
                                <ActivityIndicator
                                    animating
                                    size={20}
                                    color="black"
                                />
                            )}
                        </ButtonShare>
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
                                sliderWidth={wp(29.4)}
                                itemWidth={wp(29.4)}
                                autoplay
                                enableMomentum={false}
                                lockScrollWhileSnapping
                                autoplayInterval={3000}
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
                                            {`${shrimp.grammage}`}
                                            <TextUnitMeasurement
                                                shrimpDimentions={
                                                    shrimps.length
                                                }
                                            >
                                                g
                                            </TextUnitMeasurement>{" "}
                                            / {`${formatKilo(shrimp.kilo)}`}
                                            <TextUnitMeasurement
                                                shrimpDimentions={
                                                    shrimps.length
                                                }
                                            >
                                                Kg
                                            </TextUnitMeasurement>
                                        </TextShrimp>
                                    </ContentTextShrimp>
                                ))}
                            </ContainerShrimp>
                            <ButtonBuy onPress={handleRedirectPage}>
                                {!isLoadingTalkProductor ? (
                                    <>
                                        <FontAwesome
                                            name="whatsapp"
                                            size={24}
                                            color="white"
                                        />
                                        <ButtonBuyText>
                                            Falar com o Produtor
                                        </ButtonBuyText>
                                    </>
                                ) : (
                                    <ActivityIndicator
                                        animating
                                        size={20}
                                        color="white"
                                    />
                                )}
                            </ButtonBuy>
                        </ContentDataShrimp>
                    </ContainerInfo>
                </Container>
                <RenderImage />
                <ModalShrimpImages
                    visible={showModalImagesShrimp}
                    onClose={() => setShowModalImagesShrimp(false)}
                    actionBuy={handleRedirectPage}
                    dataShrimp={generateShrimpImage().data}
                    isLoading={isLoadingTalkProductor}
                />
            </>
        );
    },
);
