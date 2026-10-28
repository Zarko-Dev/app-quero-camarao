import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";

import { DialogComponent } from "../../../../components/Dialog";
import { deleteCupom } from "../../../../controllers/Cupons/deleteCupom";

import {
    Container,
    ButtonDelete,
    Header,
    HeaderIconWrap,
    TextHeader,
    TitleButton,
    ContentActionButtonCoupon,
    ButtonSetDefault,
} from "./styles";
import {
    RemoveDefaultCoupon,
    SetDefaultCoupon,
} from "../../../../controllers/Cupons/defaultCoupon";

export const CardCupom = ({
    cupomCode = "CUPOM",
    isDefault,
    heaveDefaultCoupon,
    adminEmail,
    children,
    refresh,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDefaultCoupon, setIsLoadingDefaultCoupon] = useState(false);
    const [showAlertVisible, setShowAlertVisible] = useState(false);

    const handleDeleteCupom = () => {
        setShowAlertVisible(false);

        if (!adminEmail) {
            Toast.show({
                type: "error",
                text1: "Não foi possível excluir o cupom.",
                text2: "Sessão inválida.",
            });
            return;
        }

        setIsLoading(true);

        deleteCupom(cupomCode, adminEmail)
            .then((data) => {
                if (data) {
                    Toast.show({
                        type: "success",
                        text1: "Cupom excluido com sucesso!",
                    });

                    refresh();
                } else {
                    Toast.show({
                        type: "error",
                        text1: "Não foi possível excluir o cupom!",
                        text2: "Tente novamente mais tarde",
                    });
                }

                setIsLoading(false);
            })
            .catch(() => {
                Toast.show({
                    type: "error",
                    text1: "Não foi possível excluir o cupom!",
                    text2: "Tente novamente mais tarde",
                });

                setIsLoading(false);
            });
    };

    const handleDefineRemoveDefaultCoupon = async () => {
        setIsLoadingDefaultCoupon(true);

        if (isDefault) {
            const result = await RemoveDefaultCoupon(cupomCode);

            if (result) {
                Toast.show({
                    type: "success",
                    text1: `Cupom ${cupomCode} foi removido do padrao!`,
                });

                refresh();
            } else {
                Toast.show({
                    type: "error",
                    text1: "Não foi possível remover o padrão do cupom!",
                });
            }
        } else {
            const result = await SetDefaultCoupon(cupomCode, heaveDefaultCoupon);

            if (result) {
                Toast.show({
                    type: "success",
                    text1: `Cupom ${cupomCode} foi definido como padrao!`,
                });

                refresh();
            } else {
                Toast.show({
                    type: "error",
                    text1: "Não foi possível definir o cupom como padrão!",
                });
            }
        }

        setIsLoadingDefaultCoupon(false);
    };

    return (
        <Container>
            <Header>
                <HeaderIconWrap>
                    <Feather name={isDefault ? "award" : "tag"} size={14} color="white" />
                </HeaderIconWrap>
                <TextHeader>
                    {cupomCode}
                    {isDefault ? " (Principal)" : ""}
                </TextHeader>
            </Header>
            {children}
            <ContentActionButtonCoupon>
                <ButtonDelete onPress={() => setShowAlertVisible(true)}>
                    {!isLoading ? (
                        <>
                            <Feather name="trash-2" size={13} color="#4a4a4a" style={{ marginRight: 6 }} />
                            <TitleButton>Excluir Cupom</TitleButton>
                        </>
                    ) : (
                        <ActivityIndicator animating color="#4a4a4a" />
                    )}
                </ButtonDelete>
                <ButtonSetDefault isDefault={isDefault} onPress={handleDefineRemoveDefaultCoupon}>
                    {!isLoadingDefaultCoupon ? (
                        <>
                            <Feather
                                name={isDefault ? "x-circle" : "star"}
                                size={13}
                                color="white"
                                style={{ marginRight: 6 }}
                            />
                            <TitleButton style={{ color: "white" }}>
                                {isDefault ? "Remover cupom principal" : "Definir como principal"}
                            </TitleButton>
                        </>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ButtonSetDefault>
            </ContentActionButtonCoupon>
            <DialogComponent
                visible={showAlertVisible}
                title="Excluir Cupom!"
                text="Deseja realmente excluir este cupom?"
                textActionButton="Excluir"
                hideDialog={() => setShowAlertVisible(false)}
                actionButton={() => handleDeleteCupom()}
                dismissable={false}
            />
        </Container>
    );
};
