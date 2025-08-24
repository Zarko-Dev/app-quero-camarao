/* eslint-disable no-nested-ternary */
import { useState, useEffect } from "react";
import { ActivityIndicator, RadioButton } from "react-native-paper";
import { FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "react-native";
import Toast from "react-native-toast-message";
import { Video, ResizeMode } from "expo-av";

import {
    saveImagePublishAds,
    savePublishAds,
} from "../../controllers/PublishAds/saveAds";
import { dataRoutes } from "../../routes/dataRoutes";
import { GetUserStorage } from "../../services/Storage/UserStorage";

import { Input } from "../../components/Input";

import {
    BannerContent,
    ButtonRegisterAds,
    Container,
    ContentForm,
    ContentGroupRadio,
    ContentRadio,
    ContentRedirectType,
    ContentTextBanner,
    TextBanner,
    TextBannerType,
    TextButton,
    TextSelectLink,
    TitleRadio,
} from "./styles";
import { theme } from "../../styles/Theme";
import { SelectTypeFileModal } from "./components/SelectTypeFileModal";

export const RegisterMyAds = ({ navigation, route }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [adsName, setAdsName] = useState("");
    const [description, setDescription] = useState("");
    const [redirectType, setRedirectType] = useState(1);
    const [redirectValue, setRedirectValue] = useState("");
    const [showAlertImage, setShowAlertImage] = useState(false);
    const [bannerUri, setBannerUri] = useState();
    const [adsUserName, setAdsUserName] = useState("");
    const [adsUserPhone, setAdsUserPhone] = useState("");
    const [view, setView] = useState(false);
    const types = [
        "whatsapp",
        "Web site",
        "Instagram",
        "Facebook",
        "Outro link",
    ];
    const [modalVisible, setModalVisible] = useState(false);
    const [isVideo, setIsVideo] = useState(false);

    useEffect(() => {
        if (route.params?.dataAds) {
            const { dataAds } = route.params;

            setAdsName(dataAds.adsName);
            setDescription(dataAds.description);
            setRedirectType(types.indexOf(dataAds.dataRedirect.type) + 1);
            setRedirectValue(dataAds.dataRedirect.value);
            setBannerUri(dataAds.imageUrl);
            setAdsUserName(dataAds.userName);
            setAdsUserPhone(dataAds.userContact);

            if (route.params?.view) {
                setView(true);
            }
        }
    }, []);

    const handleRedirectTypeInput = () => {
        switch (redirectType) {
            case 1:
                return (
                    <Input
                        label="Whatsapp"
                        keyboardType="numeric"
                        onChange={setRedirectValue}
                        value={redirectValue}
                        mask="(99) 99999-9999"
                        disable={view}
                    />
                );

            case 2:
                return (
                    <Input
                        label="Ex.: https://meusite.com.br"
                        onChange={setRedirectValue}
                        value={redirectValue}
                        autoCapitalize="none"
                        disable={view}
                    />
                );

            case 3:
                return (
                    <Input
                        label="Ex.: https://www.instagram.com/perfil"
                        onChange={setRedirectValue}
                        value={redirectValue}
                        autoCapitalize="none"
                        disable={view}
                    />
                );

            case 4:
                return (
                    <Input
                        label="Ex.: https://www.facebook.com/perfil"
                        onChange={setRedirectValue}
                        value={redirectValue}
                        autoCapitalize="none"
                        disable={view}
                    />
                );

            default:
                return (
                    <Input
                        label="Ex.: seu link"
                        onChange={setRedirectValue}
                        value={redirectValue}
                        autoCapitalize="none"
                        disable={view}
                    />
                );
        }
    };

    const handlePickImage = async (type) => {
        const dataImage = await ImagePicker.launchImageLibraryAsync({
            mediaTypes:
                type === "img"
                    ? ImagePicker.MediaTypeOptions.Images
                    : ImagePicker.MediaTypeOptions.Videos,
            quality: 1,
        });

        setShowAlertImage(false);

        if (!dataImage.canceled) {
            const { uri, width, height } = dataImage.assets[0];

            if (width !== 360 && height !== 174) {
                setShowAlertImage(true);
            }

            if (type !== "img") {
                setIsVideo(true);
            }

            setBannerUri(uri);
        }
    };

    const handleOpenSelectFile = () => {
        setModalVisible(true);
    };

    const validateForm = () => {
        if (adsName === "") {
            Toast.show({
                type: "error",
                text1: "Nome da publicidade é obrigatório!",
            });

            return true;
        }

        if (description === "") {
            Toast.show({
                type: "error",
                text1: "Descrição da publicidade é obrigatória!",
            });

            return true;
        }

        if (redirectValue === "") {
            Toast.show({
                type: "error",
                text1: "Link de redirecionamento é obrigatório!",
            });

            return true;
        }

        if (!bannerUri) {
            Toast.show({
                type: "error",
                text1: "Banner da publicidade é obrigatório!",
            });

            return true;
        }

        return false;
    };

    const handleSaveAdsToSenAnalise = async () => {
        if (!validateForm()) {
            setIsLoading(true);

            const resultSaveAdsImage = await saveImagePublishAds(
                bannerUri,
                isVideo,
            );

            if (!resultSaveAdsImage.error) {
                const dataUser = await GetUserStorage();

                const dataAds = {
                    adsName,
                    description,
                    dataRedirect: {
                        type: types[redirectType - 1],
                        value: redirectValue,
                    },
                    imageUrl: resultSaveAdsImage.urlImage,
                    status: "wating",
                    alert: null,
                    userId: dataUser.email,
                    userName: dataUser.name,
                    userContact: dataUser.phone,
                    type: isVideo ? "video" : "img",
                };

                const resultSaveAds = await savePublishAds(dataAds);

                if (resultSaveAds) {
                    Toast.show({
                        type: "success",
                        text1: "Publicidade enviada para análise!",
                    });

                    navigation.navigate(dataRoutes.myAds);
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Não conseguimos enviar sua publicidade!",
                        text2: "Tente novamente em instantes!",
                    });
                }
            } else {
                Toast.show({
                    type: "error",
                    text1: "Não conseguimos salvar seu banner!",
                    text2: "Tente novamente em instantes!",
                });
            }

            setIsLoading(false);
        }
    };

    return (
        <Container>
            <ContentForm>
                {view && (
                    <>
                        <Input
                            label="Nome do publicitário"
                            onChange={setAdsUserName}
                            value={adsUserName}
                            autoCapitalize="sentences"
                            disable={view}
                        />
                        <Input
                            label="Contato do publicitário"
                            onChange={setAdsUserPhone}
                            value={adsUserPhone}
                            autoCapitalize="sentences"
                            disable={view}
                        />
                    </>
                )}
                <Input
                    label="Nome da publicidade"
                    onChange={setAdsName}
                    value={adsName}
                    autoCapitalize="sentences"
                    disable={view}
                />
                <Input
                    label="Descreva o anúncio"
                    onChange={setDescription}
                    value={description}
                    autoCapitalize="sentences"
                    multiline={2}
                    disable={view}
                />
                <TextSelectLink>
                    Selecione a forma para onde os clientes serão direcionados
                    ao clicar em sua publicidade:
                </TextSelectLink>
                <ContentRedirectType>
                    <RadioButton.Group
                        onValueChange={(value) =>
                            !view ? setRedirectType(value) : null
                        }
                        value={redirectType}
                    >
                        <ContentGroupRadio>
                            <ContentRadio>
                                <RadioButton.Android value={1} />
                                <TitleRadio>Whatsapp</TitleRadio>
                            </ContentRadio>
                            <ContentRadio>
                                <RadioButton.Android value={2} />
                                <TitleRadio>Web site</TitleRadio>
                            </ContentRadio>
                            <ContentRadio>
                                <RadioButton.Android value={3} />
                                <TitleRadio>Instagram</TitleRadio>
                            </ContentRadio>
                        </ContentGroupRadio>
                        <ContentGroupRadio>
                            <ContentRadio>
                                <RadioButton.Android value={4} />
                                <TitleRadio>Facebook</TitleRadio>
                            </ContentRadio>
                            <ContentRadio>
                                <RadioButton.Android value={5} />
                                <TitleRadio>Outro link</TitleRadio>
                            </ContentRadio>
                        </ContentGroupRadio>
                    </RadioButton.Group>
                    {handleRedirectTypeInput()}
                </ContentRedirectType>
                <TextSelectLink>Adicione seu banner aqui:</TextSelectLink>
                {showAlertImage && (
                    <TextSelectLink alert>
                        Formato da imagem está fora do indicado 360x174. A
                        imagem poderá ser cortada nos banners de publicidade!
                    </TextSelectLink>
                )}
                <BannerContent onPress={!view ? handleOpenSelectFile : null}>
                    {bannerUri ? (
                        isVideo ? (
                            <Video
                                source={{ uri: bannerUri }}
                                style={{
                                    width: 360,
                                    height: Number(
                                        theme.size
                                            .componentSize(174)
                                            .replace("px", ""),
                                    ),
                                }}
                                resizeMode={ResizeMode.COVER}
                                isLooping
                                shouldPlay
                                isMuted
                            />
                        ) : (
                            <Image
                                source={{ uri: bannerUri }}
                                style={{
                                    width: 360,
                                    height: Number(
                                        theme.size
                                            .componentSize(174)
                                            .replace("px", ""),
                                    ),
                                }}
                            />
                        )
                    ) : (
                        <>
                            <FontAwesome
                                name="camera"
                                size={24}
                                color="black"
                            />
                            <TextBanner>Adicione a foto do banner</TextBanner>
                            <TextBanner>Tamanho indicado: 360x174</TextBanner>
                        </>
                    )}
                </BannerContent>
                <ContentTextBanner>
                    <TextBannerType>
                        Formatos aceitos: png, jpg, jpeg, gif
                    </TextBannerType>
                </ContentTextBanner>
            </ContentForm>
            {!view && (
                <ButtonRegisterAds onPress={handleSaveAdsToSenAnalise}>
                    {!isLoading ? (
                        <TextButton>
                            Solicitar Revisão da publicidade
                        </TextButton>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ButtonRegisterAds>
            )}
            <SelectTypeFileModal
                modalVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                action={handlePickImage}
            />
        </Container>
    );
};
