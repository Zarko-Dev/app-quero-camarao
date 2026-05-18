/* eslint-disable indent */
/* eslint-disable no-nested-ternary */
/* eslint-disable operator-linebreak */
/* eslint-disable function-paren-newline */
/* eslint-disable object-curly-newline */
/* eslint-disable react/no-array-index-key */

import { memo, useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";

import { changeRequestExtensionDate } from "../../../../../controllers/Publication/requestAnalysis";

import { ModalShrimpImages } from "../../../../../components/CardPublicationShrimp/ModalShrimpImages";
import { DialogComponent } from "../../../../../components/Dialog";
import Carousel from "../../../../../components/SnapCarousel/src";

import shrimpIcon from "../../../../../assets/images/shrimpIcon.png";

import {
    ButtonDisablePublication,
    ButtonExtendsPublication,
    ButtonShare,
    Container,
    ContainerInfo,
    ContainerShrimp,
    ContentActionButtons,
    ContentDataShrimp,
    ContentImageShrimp,
    ContentPondsShrimp,
    ContentTextInfo,
    ContentTextShrimp,
    EmptyImageWrap,
    EmptyShrimpImage,
    ExpirationDateRow,
    ExpirationDateText,
    ExpirationLabel,
    ImageColumn,
    ImageViews,
    LocationText,
    MainBadge,
    MainBadgeText,
    MetaItem,
    MetaRow,
    PondText,
    ShrimpInfoColumn,
    ShrimpIcon,
    ShrimpImage,
    StatusPill,
    StatusPillText,
    TextButton,
    TextInfo,
    TextShrimp,
    TextVisualizations,
    TitleWrap,
    UsageLabel,
    UsagePercentText,
    UsageRing,
} from "./styles";
import { BoxShadowIos } from "../../../../../styles/IosShadow";
import { theme } from "../../../../../styles/Theme";

export const CardMyPublicationsShrimp = memo(({ item, index, action }) => {
    const [expired, setExpired] = useState(false);
    const [isLoadingApproved, setIsLoadingApproved] = useState(false);
    const [isLoadingRepproved, setIsLoadingRepproved] = useState(false);
    const [showAlertVisible, setShowAlertVisible] = useState(false);
    const [showAlertRepproved, setShowAlertRepproved] = useState(false);
    const [showModalImagesShrimp, setShowModalImagesShrimp] = useState(false);

    const {
        id,
        location,
        ponds,
        shrimps,
        createdAt,
        views,
        requestExtensionDate,
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
        }
    }, []);

    const extensionDays = requestExtensionDate === "approved" ? 22 : 15;

    const getExpirationDate = () => {
        const dateExpiration = new Date(createdAt);
        dateExpiration.setDate(dateExpiration.getDate() + extensionDays);
        return dateExpiration;
    };

    const getUsagePercent = () => {
        const startDate = new Date(createdAt);
        const currentDate = new Date();
        const expirationDate = getExpirationDate();
        const totalTime = expirationDate - startDate;
        const usedTime = currentDate - startDate;

        if (totalTime <= 0) {
            return 100;
        }

        return Math.min(100, Math.max(0, Math.round((usedTime / totalTime) * 100)));
    };

    const formatExpirationDate = () =>
        getExpirationDate().toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });

    const ConvertPondsPlural = () =>
        ponds > 1 ? `${ponds} Viveiros` : `${ponds} Viveiro`;

    const hasShrimpImage = () =>
        shrimps.some(
            (itemSome) =>
                itemSome.imageShrimpUri !== null &&
                itemSome.imageShrimpUri !== "",
        );

    const handleOpenModalShrimpImage = () => {
        setShowModalImagesShrimp(true);
    };

    const ItemImage = ({ index: imageIndex, item: itemValue }) => (
        <ShrimpImage key={imageIndex} uri={itemValue.imageShrimpUri} />
    );

    const handleApproveExtensionDatePublication = () => {
        setShowAlertVisible(false);
        setIsLoadingApproved(true);

        changeRequestExtensionDate(id, "approved", createdAt)
            .then((result) => {
                if (result) {
                    Toast.show({
                        type: "success",
                        text1: "Extensao de data aprovada!",
                    });

                    action((data) =>
                        data.filter((dataItem) => dataItem.id !== id),
                    );
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Nao foi possivel realizar esta solicitacao!",
                        text2: "Tente novamente em instantes",
                    });
                }
            })
            .catch()
            .finally(() => {
                setIsLoadingApproved(false);
            });
    };

    const handleRepproveExtensionDatePublication = () => {
        setShowAlertRepproved(false);
        setIsLoadingRepproved(true);

        changeRequestExtensionDate(id, "repproved", createdAt)
            .then((result) => {
                if (result) {
                    Toast.show({
                        type: "success",
                        text1: "Solicitacao reprovada!",
                    });

                    action((data) =>
                        data.filter((dataItem) => dataItem.id !== id),
                    );
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Nao foi possivel realizar esta solicitacao!",
                        text2: "Tente novamente em instantes",
                    });
                }
            })
            .catch()
            .finally(() => {
                setIsLoadingRepproved(false);
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

    return (
        <>
            <Container style={BoxShadowIos}>
                <ContentPondsShrimp>
                    <TitleWrap>
                        <LocationText>{location}</LocationText>
                        {index === 0 && (
                            <MainBadge>
                                <FontAwesome name="star" size={11} color={theme.colors.primary} />
                                <MainBadgeText>Principal</MainBadgeText>
                            </MainBadge>
                        )}
                    </TitleWrap>
                    <PondText>{ConvertPondsPlural()}</PondText>
                    <ButtonShare>
                        <FontAwesome name="ellipsis-v" size={16} color="#999" />
                    </ButtonShare>
                </ContentPondsShrimp>
                <ContainerInfo>
                    <ImageColumn>
                        <ContentImageShrimp
                            activeOpacity={0.5}
                            onPress={
                                hasShrimpImage()
                                    ? handleOpenModalShrimpImage
                                    : () => {}
                            }
                        >
                            {hasShrimpImage() ? (
                                <Carousel
                                    data={generateShrimpImage().data}
                                    renderItem={ItemImage}
                                    sliderWidth={Number(
                                        theme.size
                                            .componentSize(94)
                                            .replace("px", ""),
                                    )}
                                    itemWidth={Number(
                                        theme.size
                                            .componentSize(94)
                                            .replace("px", ""),
                                    )}
                                    autoplay
                                    enableMomentum={false}
                                    lockScrollWhileSnapping
                                    autoplayInterval={6000}
                                    loop
                                    decelerationRate="normal"
                                />
                            ) : (
                                <EmptyImageWrap>
                                    <EmptyShrimpImage
                                        source={shrimpIcon}
                                        resizeMode="contain"
                                    />
                                </EmptyImageWrap>
                            )}
                        </ContentImageShrimp>
                        <ImageViews>
                            <FontAwesome name="eye" size={14} color="#4f4f4f" />
                            <TextVisualizations>{views || 0}</TextVisualizations>
                        </ImageViews>
                    </ImageColumn>
                    <ContentDataShrimp>
                        <ShrimpInfoColumn>
                            <ContentTextInfo>
                                <TextInfo>Gram./Kg</TextInfo>
                            </ContentTextInfo>
                            <ContainerShrimp shrimpDimentions={shrimps.length}>
                                {shrimps.map((shrimp, shrimpIndex) => (
                                    <ContentTextShrimp key={shrimpIndex}>
                                        <ShrimpIcon source={shrimpIcon} />
                                        <TextShrimp shrimpDimentions={shrimps.length}>
                                            {`${shrimp.grammage}g / ${shrimp.kilo}Kg`}
                                        </TextShrimp>
                                    </ContentTextShrimp>
                                ))}
                            </ContainerShrimp>
                        </ShrimpInfoColumn>
                    </ContentDataShrimp>
                </ContainerInfo>
                <MetaRow>
                    <MetaItem wide>
                        <FontAwesome
                            name="calendar-o"
                            size={14}
                            color={theme.colors.primary}
                        />
                        <ExpirationLabel>Expira</ExpirationLabel>
                        <StatusPill expired={expired}>
                            <StatusPillText expired={expired}>
                                {expired ? "Expirada" : "Ativa"}
                            </StatusPillText>
                        </StatusPill>
                        <ExpirationDateRow>
                            <ExpirationDateText>
                                {formatExpirationDate()}
                            </ExpirationDateText>
                        </ExpirationDateRow>
                    </MetaItem>
                    <MetaItem>
                        <UsageRing>
                            <UsagePercentText>{getUsagePercent()}%</UsagePercentText>
                        </UsageRing>
                        <UsageLabel>usado</UsageLabel>
                    </MetaItem>
                </MetaRow>
                <ContentActionButtons>
                    <ButtonDisablePublication onPress={() => setShowAlertVisible(true)}>
                        {!isLoadingApproved ? (
                            <>
                                <TextButton>Aprovar</TextButton>
                                <FontAwesome
                                    name="check-circle-o"
                                    size={14}
                                    color="white"
                                    style={{ marginLeft: 6 }}
                                />
                            </>
                        ) : (
                            <ActivityIndicator animating color="white" />
                        )}
                    </ButtonDisablePublication>
                    <ButtonExtendsPublication onPress={() => setShowAlertRepproved(true)}>
                        {!isLoadingRepproved ? (
                            <>
                                <TextButton>Reprovar</TextButton>
                                <FontAwesome
                                    name="times-circle-o"
                                    size={14}
                                    color="white"
                                    style={{ marginLeft: 6 }}
                                />
                            </>
                        ) : (
                            <ActivityIndicator animating color="white" />
                        )}
                    </ButtonExtendsPublication>
                </ContentActionButtons>
            </Container>
            <ModalShrimpImages
                visible={showModalImagesShrimp}
                onClose={() => setShowModalImagesShrimp(false)}
                dataShrimp={generateShrimpImage().data}
                showActionButton={false}
            />
            <DialogComponent
                visible={showAlertVisible}
                title="Aprovar extensao de data?"
                text="Deseja aprovar a extensao de data desta publicacao?"
                textActionButton="Aprovar"
                hideDialog={() => setShowAlertVisible(false)}
                actionButton={() => handleApproveExtensionDatePublication()}
                dismissable={false}
            />
            <DialogComponent
                visible={showAlertRepproved}
                title="Reprovar solicitacao?"
                text="Deseja reprovar esta solicitacao de extensao de data?"
                textActionButton="Reprovar"
                hideDialog={() => setShowAlertRepproved(false)}
                actionButton={() => handleRepproveExtensionDatePublication()}
                dismissable={false}
            />
        </>
    );
});
