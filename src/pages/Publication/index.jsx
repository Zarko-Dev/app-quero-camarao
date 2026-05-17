/* eslint-disable no-await-in-loop */
/* eslint-disable indent */
/* eslint-disable operator-linebreak */

import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import Toast from "react-native-toast-message";
import { ActivityIndicator } from "react-native-paper";

import { dataRoutes } from "../../routes/dataRoutes";
import { PublicationActions } from "./actions";

import { CardLocationPublication } from "./components/CardLocationPublication";
import { CardRegisterShrimp } from "../../components/CardRegisterShrimp";
import { DialogComponent } from "../../components/Dialog";
// import { ResumeComponent } from "./components/ResumeComponent";

import {
    ButtomAddShrimpCard,
    ButtonSendPayment,
    Container,
    Content,
    ContentResume,
    TextButtomAddShrimpCard,
    TextButtonSendPayment,
} from "./styles";
import { BoxShadowIos } from "../../styles/IosShadow";
import { deletePublicationImages } from "../../controllers/Publication/delete";
import { savePondsImages } from "../../controllers/Publication/savePondsImages";
import { updateShrimpsPublication } from "../../controllers/Publication/updatePublication";
import { Ads } from "../Home/components/Ads";

export const Publication = ({ navigation, route }) => {
    const scrollViewRef = useRef(null);
    const dispatch = useDispatch();

    const { configData } = useSelector((state) => state.configSystem);

    const [isLoadingEditable, setIsLoadingEditable] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [alertEmptyImage, setAlertEmptyImage] = useState(false);
    const [deleteCardId, setDeleteCardId] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [dataPonds, setDataPonds] = useState([
        {
            id: v4(),
            imageShrimpUri: "",
            grammage: "",
            kilo: "",
        },
    ]);
    const [resumeConfig, setResumeConfig] = useState({
        subtotal: configData.pondShrimpValue,
        discounts: 0,
        total: configData.pondShrimpValue,
    });

    useEffect(() => {
        if (route.params?.editable) {
            setDataPonds(
                route.params.dataPublication.shrimps.map((shrimp) => ({
                    id: v4(),
                    imageShrimpUri: shrimp.imageShrimpUri || undefined,
                    grammage: shrimp.grammage,
                    kilo: shrimp.kilo,
                })),
            );
        }
    }, []);

    const addResumeConfig = () => {
        const valueWithDiscount = configData.pondShrimpValue / 2;

        setResumeConfig((data) => ({
            subtotal: data.subtotal + configData.pondShrimpValue,
            discounts: data.discounts + valueWithDiscount,
            total:
                data.subtotal +
                configData.pondShrimpValue -
                (data.discounts + valueWithDiscount),
        }));
    };

    const removeResumeConfig = () => {
        const valueWithDiscount = configData.pondShrimpValue / 2;

        setResumeConfig((data) => ({
            subtotal: data.subtotal - configData.pondShrimpValue,
            discounts: data.discounts - valueWithDiscount,
            total:
                data.subtotal -
                configData.pondShrimpValue +
                (data.discounts - valueWithDiscount),
        }));
    };

    const senEndScrollView = () => {
        scrollViewRef.current.scrollToEnd({
            animated: true,
        });
    };

    const handleNewCardPond = () => {
        if (dataPonds.length < 5) {
            if (
                dataPonds.some(
                    (item) => item.grammage === "" || item.kilo === "",
                )
            ) {
                Toast.show({
                    type: "error",
                    text1: "Viveiros vazios",
                    text2: "Todos os viveiros devem conter Gramatura e Quilo!",
                });
            } else {
                setDataPonds((pondsItem) => [
                    ...pondsItem,
                    {
                        id: v4(),
                        imageShrimpUri: "",
                        grammage: "",
                        kilo: "",
                    },
                ]);

                senEndScrollView();

                addResumeConfig();
            }
        }
    };

    const deleteCardpond = (cardId) => {
        if (cardId) {
            setDataPonds(dataPonds.filter((item) => item.id !== cardId));
        } else {
            setDataPonds(dataPonds.filter((item) => item.id !== deleteCardId));
        }

        removeResumeConfig();

        setDeleteCardId("");
        setDialogVisible(false);
    };

    const handleDeleteCardpond = (cardId) => {
        if (
            dataPonds.some((item) => item.grammage === "" && item.kilo === "")
        ) {
            deleteCardpond(cardId);
        } else {
            setDeleteCardId(cardId);
            setDialogVisible(true);
        }
    };

    const handlePopulateDataPonds = (dataItem) => {
        setDataPonds((prevData) => {
            const newData = [...prevData];
            newData[dataItem.index] = {
                ...newData[dataItem.index],
                imageShrimpUri: dataItem.imageShrimpUri,
                grammage: dataItem.grammage,
                kilo: dataItem.kilo,
            };
            return newData;
        });
    };

    const hideDialog = () => {
        setDialogVisible(false);
        setAlertEmptyImage(false);
    };

    const redirectToPayment = (dataValues) => {
        setAlertEmptyImage(false);

        dispatch({
            type: PublicationActions.SET_DATA_PAYMENT_ACTION,
            dataPayment: dataValues,
        });

        navigation.navigate(dataRoutes.payment);
    };

    const handleRedirectPayment = () => {
        if (state === "" || city === "") {
            Toast.show({
                type: "error",
                text1: "LocalizaÃ§Ã£o Ã© obrigatÃ³ria",
                text2: "Verifique se seu Estado ou Cidade estÃ£o vazios",
            });
        } else if (
            dataPonds.some((item) => item.grammage === "" || item.kilo === "")
        ) {
            Toast.show({
                type: "error",
                text1: "Viveiros vazios",
                text2: "Todos os viveiros devem conter Gramatura e Quilo!",
            });
        } else if (
            dataPonds.some(
                (item) =>
                    item.imageShrimpUri === "" ||
                    item.imageShrimpUri === undefined,
            )
        ) {
            setAlertEmptyImage(true);
        } else {
            redirectToPayment({
                state,
                city,
                dataPonds,
                resumeConfig,
            });
        }
    };

    const formatToEditPonds = (ponds) =>
        ponds.map((pond) => ({
            grammage: pond.grammage,
            imageShrimpUri:
                pond.imageShrimpUri === undefined ? "" : pond.imageShrimpUri,
            kilo: pond.kilo,
        }));

    const handleEditPublication = async () => {
        setIsLoadingEditable(true);

        const { shrimps, id, edited } = {
            ...route.params.dataPublication,
            shrimps: route.params.dataPublication.shrimps.map((shrimp) => ({
                ...shrimp,
                imageShrimpUri:
                    shrimp.imageShrimpUri === ""
                        ? undefined
                        : shrimp.imageShrimpUri,
            })),
        };

        for (let index = 0; index < shrimps.length; index++) {
            if (
                shrimps[index].imageShrimpUri !==
                dataPonds[index].imageShrimpUri
            ) {
                if (shrimps[index].imageShrimpUri !== undefined) {
                    const imageUri = shrimps[index].imageShrimpUri
                        .split("Shrimp%2F")[1]
                        .split("?alt=")[0];
                    await deletePublicationImages(imageUri);
                }

                const urlImage = await savePondsImages(
                    dataPonds[index].imageShrimpUri,
                );

                dataPonds[index].imageShrimpUri = urlImage.urlImage;
            }
        }

        const result = await updateShrimpsPublication(
            id,
            formatToEditPonds(dataPonds),
            edited ? edited + 1 : 1,
        );

        if (result) {
            Toast.show({
                type: "success",
                text1: "PublicaÃ§Ã£o atualizada com sucesso!",
            });

            navigation.goBack();
        }

        setIsLoadingEditable(false);
    };

    return (
        <>
            <Ads />
            <Container ref={scrollViewRef}>
                <Content>
                    <CardLocationPublication
                        getDataState={setState}
                        getDataCity={setCity}
                        editState={
                            route.params?.editable
                                ? route.params.dataPublication.location.split(
                                      "/",
                                  )[1]
                                : undefined
                        }
                        editCity={
                            route.params?.editable
                                ? route.params.dataPublication.location.split(
                                      "/",
                                  )[0]
                                : undefined
                        }
                    />
                    {dataPonds.map((dataPond, index) => (
                        <CardRegisterShrimp
                            key={dataPond.id}
                            pondId={dataPond.id}
                            index={index}
                            title={`${index + 1} Viveiro`}
                            onDelete={() => handleDeleteCardpond(dataPond.id)}
                            actionEdit={handlePopulateDataPonds}
                            onPressIn={senEndScrollView}
                            imageShrimpUri={
                                route.params?.editable
                                    ? dataPond.imageShrimpUri
                                    : undefined
                            }
                            initialEditGrammage={
                                route.params?.editable ? dataPond.grammage : ""
                            }
                            initialEditKilo={
                                route.params?.editable ? dataPond.kilo : ""
                            }
                            editable={route.params?.editable}
                        />
                    ))}
                    {dataPonds.length < 5 && !route.params?.editable && (
                        <ButtomAddShrimpCard
                            style={BoxShadowIos}
                            onPress={handleNewCardPond}
                        >
                            <TextButtomAddShrimpCard>
                                Adicionar viveiro com 50% de desconto
                            </TextButtomAddShrimpCard>
                        </ButtomAddShrimpCard>
                    )}
                </Content>
            </Container>
            {!route.params?.editable ? (
                <ContentResume>
                    {/* <ResumeComponent
                        subtotal={resumeConfig.subtotal}
                        discounts={resumeConfig.discounts}
                        total={resumeConfig.total}
                    /> */}
                    <ButtonSendPayment
                        style={BoxShadowIos}
                        onPress={handleRedirectPayment}
                    >
                        <TextButtonSendPayment>
                            Ir para o pagamento
                        </TextButtonSendPayment>
                    </ButtonSendPayment>
                </ContentResume>
            ) : (
                <ContentResume>
                    <ButtonSendPayment
                        style={BoxShadowIos}
                        onPress={handleEditPublication}
                    >
                        {!isLoadingEditable ? (
                            <TextButtonSendPayment>
                                Editar PublicaÃ§Ã£o
                            </TextButtonSendPayment>
                        ) : (
                            <ActivityIndicator animating color="white" />
                        )}
                    </ButtonSendPayment>
                </ContentResume>
            )}
            <DialogComponent
                visible={dialogVisible}
                title="AtenÃ§Ã£o"
                text="Deseja realmente excluir este viveiro?"
                textActionButton="Excluir"
                hideDialog={hideDialog}
                actionButton={() => deleteCardpond()}
                dismissable={false}
            />
            <DialogComponent
                visible={alertEmptyImage}
                title="Sua publicaÃ§Ã£o nÃ£o possui imagem"
                text="A imagem Ã© importante para aumentar o engajamento de sua publicaÃ§Ã£o, deseja adicionar a imagem?"
                textActionButton="Adicionar Imagem"
                hideDialog={hideDialog}
                actionButton={hideDialog}
                textSecondaryActionButton="Continuar"
                secondaryActionButton={() =>
                    redirectToPayment({
                        state,
                        city,
                        dataPonds,
                        resumeConfig,
                    })
                }
                dismissable={false}
            />
        </>
    );
};
