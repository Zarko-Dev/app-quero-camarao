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
import { RegressivePublicationShrimpTimer } from "../RegressivePublicationShrimpTimer";
import { DialogComponent } from "../../../../../components/Dialog";
import Carousel from "../../../../../components/SnapCarousel/src";

import shrimpIcon from "../../../../../assets/images/shrimpIcon.png";

import {
    ButtonBuy,
    ButtonBuyText,
    ButtonDisablePublication,
    ButtonExtendsPublication,
    ButtonShare,
    Container,
    ContainerInfo,
    ContainerShrimp,
    ContentActionButtons,
    ContentDataShrimp,
    ContentExpired,
    ContentImageShrimp,
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
import { BoxShadowIos } from "../../../../../styles/IosShadow";
import { theme } from "../../../../../styles/Theme";

export const CardMyPublicationsShrimp = memo(({ item, action }) => {
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

    const ConvertPondsPlural = () =>
        ponds > 1 ? `${ponds} Viveiros` : `${ponds} Viveiro`;

    const handleOpenModalShrimpImage = () => {
        setShowModalImagesShrimp(true);
    };

    const ItemImage = ({ index, item: itemValue }) => (
        <ShrimpImage key={index} uri={itemValue.imageShrimpUri} />
    );

    const handleApproveExtensionDatePublication = () => {
        setShowAlertVisible(false);
        setIsLoadingApproved(true);

        changeRequestExtensionDate(id, "approved", createdAt)
            .then((result) => {
                if (result) {
                    Toast.show({
                        type: "success",
                        text1: "Estenção de data aprovada!",
                    });

                    action((data) =>
                        data.filter((dataItem) => dataItem.id !== id),
                    );
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Não foi possível realizar esta solicitação!",
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
                        text1: "Solicitação reprovada!",
                    });

                    action((data) =>
                        data.filter((dataItem) => dataItem.id !== id),
                    );
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Não foi possível realizar esta solicitação!",
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
                    <LocationText>{location}</LocationText>
                    <PondText>{ConvertPondsPlural()}</PondText>
                    <ButtonShare />
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
                                />
                            </ButtonBuyText>
                        </ButtonBuy>
                    </ContentDataShrimp>
                </ContainerInfo>
                {expired && <ContentExpired />}
            </Container>
            <ContentVisualizations>
                <TextVisualizations>
                    <FontAwesome name="eye" size={18} color="black" />{" "}
                    Quantidade de visualizações: {views || 0}
                </TextVisualizations>
            </ContentVisualizations>
            <ContentActionButtons>
                <ButtonDisablePublication
                    onPress={() => setShowAlertVisible(true)}
                >
                    {!isLoadingApproved ? (
                        <TextButton>Aprovar</TextButton>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ButtonDisablePublication>
                <ButtonExtendsPublication
                    onPress={() => setShowAlertRepproved(true)}
                >
                    {!isLoadingRepproved ? (
                        <TextButton>Reprovar</TextButton>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ButtonExtendsPublication>
            </ContentActionButtons>
            <ModalShrimpImages
                visible={showModalImagesShrimp}
                onClose={() => setShowModalImagesShrimp(false)}
                dataShrimp={generateShrimpImage().data}
                showActionButton={false}
            />
            <DialogComponent
                visible={showAlertVisible}
                title="Aprovar extenção de data?"
                text="Deseja aprovar a extenção de data desta publicação?"
                textActionButton="Aprovar"
                hideDialog={() => setShowAlertVisible(false)}
                actionButton={() => handleApproveExtensionDatePublication()}
                dismissable={false}
            />
            <DialogComponent
                visible={showAlertRepproved}
                title="Repovar solicitação?"
                text="Deseja reprova esta solictitação de extenção e data?"
                textActionButton="Reprovar"
                hideDialog={() => setShowAlertRepproved(false)}
                actionButton={() => handleRepproveExtensionDatePublication()}
                dismissable={false}
            />
        </>
    );
});
