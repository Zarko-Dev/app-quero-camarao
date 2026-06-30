/* eslint-disable operator-linebreak */
/* eslint-disable indent */

import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity, View, Modal } from "react-native";
import Toast from "react-native-toast-message";

import { ShrimpCamera } from "../Camera/ShrimpCamera";
import { sanitizeGrammageInput } from "../../utils/sanitizeGrammageInput";

import {
    ButtonDeleteCardPond,
    Container,
    ContentForm,
    ContentImage,
    ContentInput,
    ContentInternalHeader,
    Header,
    ImageShrimp,
    InputStyle,
    TitleHeader,
    TitleInput,
} from "./styles";

import imageEmpty from "../../assets/images/imageEmpty.png";

export const CardRegisterShrimp = ({
    index,
    title,
    imageShrimpUri,
    onDelete,
    actionEdit = () => {},
    onPressIn,
    initialEditGrammage,
    initialEditKilo,
    editable,
}) => {
    const [showCameraModal, setShowCameraModal] = useState(false);
    const [dataImageShrimpUri, setDataImageShrimpUri] =
        useState(imageShrimpUri);
    const [grammage, setGrammage] = useState(initialEditGrammage);
    const [kilo, setKilo] = useState(initialEditKilo);

    useEffect(() => {
        actionEdit({
            index,
            imageShrimpUri: dataImageShrimpUri,
            grammage,
            kilo,
        });
    }, [dataImageShrimpUri, grammage, kilo]);

    const handleSelectShrimpImage = async () => {
        setShowCameraModal(true);
    };

    return (
        <>
            <Container>
                <Header>
                    <ContentInternalHeader />
                    <TitleHeader>{title}</TitleHeader>
                    <ContentInternalHeader>
                        {index !== 0 && !editable && (
                            <ButtonDeleteCardPond onPress={onDelete}>
                                <Feather name="x" size={18} color="white" />
                            </ButtonDeleteCardPond>
                        )}
                    </ContentInternalHeader>
                </Header>
                <ContentForm>
                    <ContentImage>
                        <TouchableOpacity onPress={handleSelectShrimpImage}>
                            <ImageShrimp
                                source={
                                    dataImageShrimpUri
                                        ? {
                                              uri: dataImageShrimpUri,
                                          }
                                        : imageEmpty
                                }
                            />
                        </TouchableOpacity>
                    </ContentImage>
                    <ContentInput>
                        <TitleInput>Gramatura do camarao</TitleInput>
                        <InputStyle
                            label="Ex.: 50g"
                            keyboardType="decimal-pad"
                            value={grammage}
                            onChange={(value) => {
                                const nextValue = sanitizeGrammageInput(
                                    value,
                                    2,
                                    70,
                                );

                                if (nextValue.exceeded) {
                                    Toast.show({
                                        type: "error",
                                        text1: "A gramatura máxima é 70g",
                                        text2: "Informe um valor menor ou igual a 70g.",
                                    });
                                }

                                setGrammage(nextValue.value);
                            }}
                            onPressIn={onPressIn}
                        />
                    </ContentInput>
                    <ContentInput>
                        <TitleInput>Quilo do camarao</TitleInput>
                        <InputStyle
                            label="Ex.: 1000kg"
                            keyboardType="decimal-pad"
                            value={kilo}
                            onChange={(value) => {
                                setKilo(sanitizeDecimalInput(value, 1));
                            }}
                            onPressIn={onPressIn}
                        />
                    </ContentInput>
                </ContentForm>
            </Container>
            <View>
                <Modal
                    animationType="slide"
                    visible={showCameraModal}
                    onRequestClose={() => setShowCameraModal(false)}
                >
                    <ShrimpCamera
                        onClose={() => setShowCameraModal(false)}
                        actionGetImage={setDataImageShrimpUri}
                    />
                </Modal>
            </View>
        </>
    );
};
