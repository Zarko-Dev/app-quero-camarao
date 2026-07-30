import { useState } from "react";
import { Modal, Text, TouchableOpacity, View, Dimensions } from "react-native";
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
    actionChat,
    showChatButton = false,
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

    const ItemImage = ({ item }) => (
        <ContentImages itemWidth={itemWidth}>
            <ShrimpImage uri={item.imageShrimpUri} resizeMode="contain" />
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
                        <View style={{ flexDirection: "row", width: "100%", paddingHorizontal: 16, marginBottom: 8 }}>
                            <ButtonBuyShrimp
                                onPress={actionBuy}
                                style={{
                                    flex: 1,
                                    paddingHorizontal: 16,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 8,
                                    marginBottom: 0,
                                }}
                            >
                                {!isLoading ? (
                                    <FontAwesome name="whatsapp" size={26} color="white" />
                                ) : (
                                    <ActivityIndicator animating size={20} color="white" />
                                )}
                                <TextButton>Falar com o produtor</TextButton>
                            </ButtonBuyShrimp>
                            {showChatButton && (
                                <TouchableOpacity
                                    onPress={actionChat}
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
                            )}
                        </View>
                    )}
                </ContentModal>
            </Modal>
        </Container>
    );
};
