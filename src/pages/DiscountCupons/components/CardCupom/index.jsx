import { useState } from "react";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";

import { DialogComponent } from "../../../../components/Dialog";
import { deleteCupom } from "../../../../controllers/Cupons/deleteCupom";

import {
    Container,
    ButtonDelete,
    Header,
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
    children,
    refresh,
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingDefaultCoupon, setIsLoadingDefaultCoupon] = useState(false);
    const [showAlertVisible, setShowAlertVisible] = useState(false);

    const handleDeleteCupom = () => {
        setShowAlertVisible(false);
        setIsLoading(true);

        deleteCupom(cupomCode)
            .then((data) => {
                if (data) {
                    Toast.show({
                        type: "success",
                        text1: "Cupom excluído com sucesso!",
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
                    text1: `Cupom ${cupomCode} foi removido do padrão!`,
                });

                refresh();
            } else {
                Toast.show({
                    type: "error",
                    text1: "Não foi possível remover o padrão do cupom!",
                });
            }
        } else {
            const result = await SetDefaultCoupon(
                cupomCode,
                heaveDefaultCoupon,
            );

            if (result) {
                Toast.show({
                    type: "success",
                    text1: `Cupom ${cupomCode} foi definido como padrão!`,
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
                <TextHeader>
                    {cupomCode}
                    {isDefault ? " (Principal)" : ""}
                </TextHeader>
            </Header>
            {children}
            <ContentActionButtonCoupon>
                <ButtonDelete onPress={() => setShowAlertVisible(true)}>
                    {!isLoading ? (
                        <TitleButton>Excluir Cupom</TitleButton>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ButtonDelete>
                <ButtonSetDefault
                    isDefault={isDefault}
                    onPress={handleDefineRemoveDefaultCoupon}
                >
                    {!isLoadingDefaultCoupon ? (
                        <TitleButton>
                            {isDefault
                                ? "Remover cupom principal"
                                : "Definir como principal"}
                        </TitleButton>
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
