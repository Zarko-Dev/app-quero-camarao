/* eslint-disable operator-linebreak */
/* eslint-disable indent */

import { useEffect, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity, View, Modal } from "react-native";

import { ShrimpCamera } from "../Camera/ShrimpCamera";

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
                            keyboardType="numeric"
                            value={grammage.replace(/[ \-.]/g, "")}
                            onChange={(value) => {
                                setGrammage(value.replace(/[ \-.]/g, ""));
                            }}
                            onPressIn={onPressIn}
                        />
                    </ContentInput>
                    <ContentInput>
                        <TitleInput>Quilo do camarao</TitleInput>
                        <InputStyle
                            label="Ex.: 1000kg"
                            keyboardType="numeric"
                            value={kilo.replace(/[ \-,]/g, "")}
                            onChange={(value) => {
                                setKilo(value.replace(/[ \-,]/g, ""));
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
