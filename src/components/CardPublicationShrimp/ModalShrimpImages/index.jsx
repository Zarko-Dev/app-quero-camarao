import { useState } from "react";
import { Modal, TouchableOpacity, Dimensions } from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";

import Carousel from "../../SnapCarousel/src";

import {
    ButtonBuyShrimp,
    Container,
    ContentEmpty,
    ContentImages,
    ContentModal,
    HeaderGrammageShrimp,
    HeaderTitle,
    ShrimpImage,
    TextButton,
} from "./styles";

export const ModalShrimpImages = ({
    visible,
    onClose,
    actionBuy,
    dataShrimp,
    showActionButton = true,
    isLoading,
}) => {
    const [headerTitle, setHeaderTitle] = useState(dataShrimp[0]);

    const sliderWidth = Dimensions.get("window").width;
    const itemWidth = sliderWidth * 0.8;

    const handleChangeShrinpInfo = (index) => {
        setHeaderTitle(dataShrimp[index]);
    };

    const ItemImage = ({ index, item }) => (
        <ContentImages key={index} itemWidth={itemWidth}>
            <ShrimpImage uri={item.imageShrimpUri} />
        </ContentImages>
    );

    return (
        <Container>
            <Modal
                animationType="slide"
                transparent
                visible={visible}
                onRequestClose={onClose}
            >
                <ContentModal>
                    <HeaderGrammageShrimp>
                        <ContentEmpty>
                            <TouchableOpacity onPress={onClose}>
                                <Feather
                                    name="arrow-left"
                                    size={28}
                                    color="white"
                                />
                            </TouchableOpacity>
                        </ContentEmpty>
                        <HeaderTitle>{`Camarão de ${headerTitle.grammage}g / ${headerTitle.kilo}kg`}</HeaderTitle>
                        <ContentEmpty />
                    </HeaderGrammageShrimp>
                    <Carousel
                        data={dataShrimp}
                        renderItem={ItemImage}
                        sliderWidth={sliderWidth}
                        itemWidth={itemWidth}
                        useScrollView
                        onSnapToItem={handleChangeShrinpInfo}
                    />
                    {showActionButton && (
                        <ButtonBuyShrimp onPress={actionBuy}>
                            {!isLoading ? (
                                <>
                                    <FontAwesome
                                        name="whatsapp"
                                        size={24}
                                        color="white"
                                    />
                                    <TextButton>
                                        {" "}
                                        Falar com o Produtor
                                    </TextButton>
                                </>
                            ) : (
                                <ActivityIndicator
                                    animating
                                    size={20}
                                    color="white"
                                />
                            )}
                        </ButtonBuyShrimp>
                    )}
                </ContentModal>
            </Modal>
        </Container>
    );
};
