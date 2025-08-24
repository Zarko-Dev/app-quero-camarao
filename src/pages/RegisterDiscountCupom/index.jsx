/* eslint-disable indent */
/* eslint-disable no-use-before-define */
/* eslint-disable operator-linebreak */

import { ActivityIndicator, RadioButton } from "react-native-paper";
import { useCallback, useState } from "react";
import Toast from "react-native-toast-message";

import { CreateCupom } from "../../controllers/Cupons/createCupom";

import { Input } from "../../components/Input";
import { PickerModal } from "./components/PickerModal";
import SelectComponent from "../../components/SelectComponent";

import {
    ButtonRegister,
    Container,
    ContainerDate,
    Content,
    ContentCard,
    ContentRadio,
    ContentSelectTime,
    TitleButton,
    TitleCard,
    TitleRadio,
    TitleSelectTime,
} from "./styles";
import { BoxShadowIos } from "../../styles/IosShadow";

export const RegisterDiscountCupom = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [cupomCode, setCupomCode] = useState("");
    const [durationRadioCupon, setDurationRadioCupon] = useState(0);
    const [cupomQuantity, setCupomQuantity] = useState("");
    const [openSelectHours, setOpenSelectHours] = useState(false);
    const [selectedHour, setSelectedHour] = useState();
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState({
        date: new Date(),
        formatDate: "",
    });
    const [discountRadioCupon, setDiscountRadioCupon] = useState(0);
    const [cupomPercentage, setCupomPercentage] = useState("");
    const [cupomValue, setCupomValue] = useState("");
    const [pondsDiscount, setPoundsDiscount] = useState(0);

    const onDismissDatePicker = useCallback(() => {
        setOpenDatePicker(false);
    }, [setOpenDatePicker]);

    const onDismissSelectHours = useCallback(() => {
        setOpenSelectHours(false);
    }, [setOpenSelectHours]);

    const onConfirmDatePicker = useCallback(
        (params) => {
            const date = new Date(params.date);
            const formatDate = `${date.getFullYear()}-${String(
                date.getMonth() + 1,
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

            setOpenDatePicker(false);
            setSelectedDate({ date: params.date, formatDate });
        },
        [setOpenDatePicker, setSelectedDate],
    );

    const onConfirmHours = useCallback(
        ({ hours, minutes }) => {
            setOpenSelectHours(false);
            const hour = hours.toString().length === 1 ? `0${hours}` : hours;
            const minute =
                minutes.toString().length === 1 ? `0${minutes}` : minutes;

            setSelectedHour(`${hour}:${minute}:00.000Z`);
        },
        [setOpenSelectHours],
    );

    const formatDate = (inverter = false) => {
        const date = new Date(selectedDate.date);

        return !inverter
            ? `${String(date.getDate()).padStart(2, "0")}/${String(
                  date.getMonth() + 1,
              ).padStart(2, "0")}/${date.getFullYear()}`
            : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
                  2,
                  "0",
              )}-${String(date.getDate()).padStart(2, "0")}`;
    };

    const formatHour = () => selectedHour.split(".")[0];

    const handleCuponInputDuration = () => {
        switch (durationRadioCupon) {
            case 1:
                return (
                    <Input
                        label="Ex.: 5"
                        keyboardType="numeric"
                        value={cupomQuantity}
                        onChange={setCupomQuantity}
                    />
                );

            case 2:
                return (
                    <ContainerDate>
                        <ContentSelectTime
                            style={BoxShadowIos}
                            onPress={() => setOpenDatePicker(true)}
                        >
                            <TitleSelectTime>
                                {selectedDate.date
                                    ? formatDate()
                                    : "Data de expiração"}
                            </TitleSelectTime>
                        </ContentSelectTime>
                        <ContentSelectTime
                            style={BoxShadowIos}
                            onPress={() => setOpenSelectHours(true)}
                        >
                            <TitleSelectTime>
                                {selectedHour
                                    ? formatHour()
                                    : "Horário de expiração"}
                            </TitleSelectTime>
                        </ContentSelectTime>
                    </ContainerDate>
                );

            default:
                return null;
        }
    };

    const handleCuponInputDiscount = () => {
        switch (discountRadioCupon) {
            case 1:
                return (
                    <Input
                        label="Ex.: 10%"
                        keyboardType="numeric"
                        value={cupomPercentage}
                        onChange={setCupomPercentage}
                    />
                );

            case 2:
                return (
                    <Input
                        label="Ex.: 50 Reais"
                        keyboardType="numeric"
                        value={cupomValue}
                        onChange={setCupomValue}
                    />
                );

            case 3:
                // eslint-disable-next-line no-case-declarations
                const dataOptions = [1, 2, 3, 4, 5];

                return (
                    <SelectComponent
                        title="Selecione o viveiro"
                        options={dataOptions}
                        action={setPoundsDiscount}
                        style={{ marginBottom: 3 }}
                    />
                );

            default:
                return null;
        }
    };

    const validateCupomCode = () => {
        if (cupomCode === "" || cupomCode.length < 5) {
            Toast.show({
                type: "error",
                text1: "Código do cupom inválido",
                text2: "Código do cupom deverá conter no mínimo 5 caracteres!",
            });

            return false;
        }

        return true;
    };

    const validateCupomDuration = () => {
        switch (durationRadioCupon) {
            case 0:
                Toast.show({
                    type: "error",
                    text1: "Selecione o tempo de expiração",
                });

                return false;

            case 1:
                if (cupomQuantity === "") {
                    Toast.show({
                        type: "error",
                        text1: "Informe a quantidade de cupons",
                    });

                    return false;
                }

                return true;

            case 2:
                return true;

            case 3:
                return true;

            default:
                Toast.show({
                    type: "error",
                    text1: "Selecione o tempo de expiração",
                });

                return false;
        }
    };

    const validateCupomDiscount = () => {
        switch (discountRadioCupon) {
            case 0:
                Toast.show({
                    type: "error",
                    text1: "Selecione o desconto",
                });

                return false;

            case 1:
                if (cupomPercentage === "") {
                    Toast.show({
                        type: "error",
                        text1: "Informe a porcentagem do cupom",
                    });

                    return false;
                }

                return true;

            case 2:
                if (cupomValue === "") {
                    Toast.show({
                        type: "error",
                        text1: "Informe o valor de desconto do cupom",
                    });

                    return false;
                }

                return true;

            case 3:
                if (pondsDiscount === 0) {
                    Toast.show({
                        type: "error",
                        text1: "Informe a quantidade de viveiros grátis",
                    });

                    return false;
                }

                return true;

            default:
                Toast.show({
                    type: "error",
                    text1: "Selecione o desconto",
                });

                return false;
        }
    };

    const validateCupom = () => {
        if (validateCupomCode()) {
            if (validateCupomDuration()) {
                if (validateCupomDiscount()) {
                    return true;
                }
            }
        }

        return false;
    };

    const handleRegisterCupom = async () => {
        if (validateCupom()) {
            setIsLoading(true);

            const durationTypeProps = ["Quantity", "Time", "Unlimited"];
            const discountTypeProps = ["Percentage", "Value", "QuantityPonds"];
            const durationValueProps = [
                cupomQuantity,
                selectedHour
                    ? new Date(`${formatDate(true)}T${selectedHour}`)
                    : new Date(formatDate(true)),
                "Unlimited",
            ];
            const discountValueProps = [
                cupomPercentage,
                cupomValue,
                pondsDiscount,
            ];

            const dataCupom = {
                cupomCode,
                durationType: durationTypeProps[durationRadioCupon - 1],
                durationInitialValue:
                    durationValueProps[durationRadioCupon - 1],
                durationValue: durationValueProps[durationRadioCupon - 1],
                discountType: discountTypeProps[discountRadioCupon - 1],
                discountValue: discountValueProps[discountRadioCupon - 1],
            };

            if (dataCupom.durationType !== "Quantity") {
                dataCupom.useCount = 0;
            }

            const resultCreateCupom = await CreateCupom(dataCupom);

            if (resultCreateCupom) {
                Toast.show({
                    type: "success",
                    text1: `Cupom ${cupomCode}, criado!`,
                });

                navigation.goBack();
            } else {
                Toast.show({
                    type: "error",
                    text1: "Não foi possível criar o cupom!",
                    text2: "Tente novamente mais tarde",
                });
            }

            setIsLoading(false);
        }
    };

    return (
        <Container>
            <Content>
                <ContentCard>
                    <TitleCard>Código do cupom</TitleCard>
                    <Input
                        label="Ex.: CAMARAO50"
                        autoCapitalize="characters"
                        value={cupomCode}
                        onChange={setCupomCode}
                    />
                </ContentCard>
                <ContentCard>
                    <TitleCard>Duração do cupom</TitleCard>
                    <RadioButton.Group
                        onValueChange={(value) => setDurationRadioCupon(value)}
                        value={durationRadioCupon}
                    >
                        <ContentRadio>
                            <RadioButton.Android value={1} />
                            <TitleRadio>Quantidade</TitleRadio>
                        </ContentRadio>
                        <ContentRadio>
                            <RadioButton.Android value={2} />
                            <TitleRadio>Tempo</TitleRadio>
                        </ContentRadio>
                        <ContentRadio>
                            <RadioButton.Android value={3} />
                            <TitleRadio>Não Expira</TitleRadio>
                        </ContentRadio>
                    </RadioButton.Group>
                    {handleCuponInputDuration()}
                </ContentCard>
                <ContentCard>
                    <TitleCard>Desconto</TitleCard>
                    <RadioButton.Group
                        onValueChange={(value) => setDiscountRadioCupon(value)}
                        value={discountRadioCupon}
                    >
                        <ContentRadio>
                            <RadioButton.Android value={1} />
                            <TitleRadio>Porcentagem %</TitleRadio>
                        </ContentRadio>
                        <ContentRadio>
                            <RadioButton.Android value={2} />
                            <TitleRadio>Valor de desconto</TitleRadio>
                        </ContentRadio>
                        <ContentRadio>
                            <RadioButton.Android value={3} />
                            <TitleRadio>
                                Quantidade de viveiros grátis
                            </TitleRadio>
                        </ContentRadio>
                    </RadioButton.Group>
                    {handleCuponInputDiscount()}
                </ContentCard>
            </Content>
            <ButtonRegister onPress={handleRegisterCupom}>
                {!isLoading ? (
                    <TitleButton>Cadastrar Cupom</TitleButton>
                ) : (
                    <ActivityIndicator animating color="white" />
                )}
            </ButtonRegister>
            <PickerModal
                openSelectHours={openSelectHours}
                onDismissSelectHours={onDismissSelectHours}
                onConfirm={onConfirmHours}
                openDatePicker={openDatePicker}
                onDismissDatePicker={onDismissDatePicker}
                selectedDate={selectedDate.date}
                onConfirmDatePicker={onConfirmDatePicker}
            />
        </Container>
    );
};
