/* eslint-disable object-curly-newline */
/* eslint-disable function-paren-newline */
/* eslint-disable operator-linebreak */
/* eslint-disable indent */
import { useCallback, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useFocusEffect } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { Portal, Dialog, Button, Text as PaperText } from "react-native-paper";
import { v4 } from "uuid";
import SelectComponent from "../../../components/SelectComponent";
import { getCity, getState } from "../../../utils/getLocation";
import {
    ButtonRemoveTag,
    ClearAll,
    ConfirmeButtom,
    Container,
    Content,
    ContentActions,
    ContentButtons,
    ContentTag,
    ContentTags,
    SaveDrawPriseRule,
    Scroll,
    Subtitle,
    Tag,
    TextButton,
    Title,
    TitleSelect,
    TitleTags,
} from "./styles";
import {
    getDrawPrizeRules,
    saveDrawPrizeRules,
    saveSpecifcDrawPrizeRules,
} from "../../../controllers/DrawPrizes/rules";
import { DialogComponent } from "../../../components/Dialog";
import { InputNoMask } from "../../../components/InputNoMask";

export const DrawPrizeRules = () => {
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedItens, setSelectedItens] = useState([]);
    const [clear, setClear] = useState(false);
    const [dialogInputVisible, setDialogInputVisible] = useState(false);
    const [specificRuleName, setSpecificRuleName] = useState("");
    const [dataEspecifcRule, setDataEspecifcRule] = useState([]);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [ruleToAction, setRuleToAction] = useState(null);
    const [editingSpecificRule, setEditingSpecificRule] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const getData = async () => {
                const dataState = await getState();
                setStates(dataState);

                const data = await getDrawPrizeRules();
                setSelectedItens(data?.[0]?.rules ?? []);
                setDataEspecifcRule(data?.[0]?.specifcRules ?? []);
            };

            getData();
        }, []),
    );

    const handleSelectState = async (uf) => {
        setCities([]);
        setCities(await getCity(uf));
    };

    const setSelectedCity = (dataCity) => {
        const data = [];

        dataCity.forEach((item) => {
            if (!selectedItens.includes(item)) {
                data.push(item);
            }
        });

        setSelectedItens([...selectedItens, ...data]);
    };

    const handleClearAll = () => {
        setSelectedItens([]);
        setClear(!clear);
        setEditingSpecificRule(null);
    };

    const removeSelectedItem = (item) => {
        const data = selectedItens.filter((i) => i !== item);
        setSelectedItens(data);
    };

    const removeEspeficSelectedItemRule = async (item) => {
        const data = dataEspecifcRule.filter((i) => i.id !== item.id);

        const resultSave = await saveSpecifcDrawPrizeRules(data);

        if (resultSave) {
            setDataEspecifcRule(data);

            Toast.show({
                type: "success",
                text1: "Regra específica removida com sucesso!",
            });
        } else {
            Toast.show({
                type: "error",
                text1: "Não foi possível remover a regra específica!",
            });
        }
    };

    const handleSaveSpecifcRule = () => {
        if (selectedItens.length === 0) {
            Toast.show({ type: "error", text1: "Informe ao menos um local!" });
        } else {
            setDialogInputVisible(true);
        }
    };

    const handleCloseSpecificRuleDialog = () => {
        setDialogInputVisible(false);
        setSpecificRuleName("");
    };

    const handleSaveSpecifcRuleData = async () => {
        if (specificRuleName.trim() === "") {
            Toast.show({ type: "error", text1: "Informe o nome do sorteio!" });
        } else {
            const data = [
                ...dataEspecifcRule,
                {
                    id: v4(),
                    name: specificRuleName,
                    rules: selectedItens,
                },
            ];

            const resultSave = await saveSpecifcDrawPrizeRules(data);

            if (resultSave) {
                setDataEspecifcRule(data);

                handleCloseSpecificRuleDialog();

                Toast.show({
                    type: "success",
                    text1: "Regra específica salva com sucesso!",
                });
            } else {
                Toast.show({
                    type: "error",
                    text1: "Não foi possível salvar a regra específica!",
                });
            }
        }
    };

    const handleLoadDataSpecificRule = () => {
        if (ruleToAction) {
            setSelectedItens(ruleToAction.rules);
            setEditingSpecificRule(ruleToAction);
            setDialogVisible(false);
            setRuleToAction(null);
        }
    };

    const handleUpdateSpecificRule = async () => {
        if (!editingSpecificRule) return;

        const updatedSpecificRules = dataEspecifcRule.map((rule) =>
            rule.id === editingSpecificRule.id
                ? { ...rule, rules: selectedItens }
                : rule,
        );

        const resultSave =
            await saveSpecifcDrawPrizeRules(updatedSpecificRules);

        if (resultSave) {
            setDataEspecifcRule(updatedSpecificRules);
            setEditingSpecificRule(null);
            Toast.show({
                type: "success",
                text1: "Regra específica atualizada com sucesso!",
            });
        } else {
            Toast.show({
                type: "error",
                text1: "Não foi possível atualizar a regra específica!",
            });
        }
    };

    const handleSaveRules = async () => {
        await saveDrawPrizeRules(selectedItens);

        Toast.show({ type: "success", text1: "Regra salva com sucesso!" });

        setClear(!clear);
    };

    const areArraysEqual = (arrA, arrB) => {
        if (!arrA || !arrB || arrA.length !== arrB.length) {
            return false;
        }
        const sortedA = [...arrA].sort();
        const sortedB = [...arrB].sort();
        return sortedA.every((value, index) => value === sortedB[index]);
    };

    return (
        <Container>
            <Content>
                <Title>Regras de Sorteio</Title>

                <Subtitle>
                    Selecione o estado e cidade que deverá participar do
                    sorteio!
                </Subtitle>

                <TitleSelect>Estado</TitleSelect>
                <SelectComponent
                    title="Seleciona o Estado"
                    options={states}
                    action={handleSelectState}
                    style={{ marginBottom: 3 }}
                    clear={clear}
                />
                <TitleSelect>Cidade</TitleSelect>
                <SelectComponent
                    title="Seleciona a Cidade"
                    options={cities}
                    action={setSelectedCity}
                    multipleSelect
                    clear={clear}
                />
                <TitleTags>Regra Geral de Locais Selecionados</TitleTags>
                {selectedItens.length === 0 ? (
                    <Subtitle>
                        Ao não informar locais do sorteio, serão considerados
                        todos!
                    </Subtitle>
                ) : (
                    <Scroll>
                        <ContentTags>
                            {selectedItens.map((item) => (
                                <ContentTag key={item}>
                                    <Tag>{item}</Tag>
                                    <ButtonRemoveTag
                                        onPress={() => removeSelectedItem(item)}
                                    >
                                        <FontAwesome
                                            name="remove"
                                            size={18}
                                            color="white"
                                        />
                                    </ButtonRemoveTag>
                                </ContentTag>
                            ))}
                        </ContentTags>
                    </Scroll>
                )}
                <TitleTags>Regra Especifica por Locais Selecionados</TitleTags>
                {dataEspecifcRule.length === 0 ? (
                    <Subtitle>
                        Não há regras de sorteio específicas cadastradas!
                    </Subtitle>
                ) : (
                    <Scroll>
                        <ContentTags>
                            {dataEspecifcRule.map((item) => (
                                <ContentTag key={item.id}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setDialogVisible(true);
                                            setRuleToAction(item);
                                        }}
                                    >
                                        <Tag>{item.name}</Tag>
                                    </TouchableOpacity>
                                    <ButtonRemoveTag
                                        onPress={() =>
                                            removeEspeficSelectedItemRule(item)
                                        }
                                    >
                                        <FontAwesome
                                            name="remove"
                                            size={18}
                                            color="white"
                                        />
                                    </ButtonRemoveTag>
                                </ContentTag>
                            ))}
                        </ContentTags>
                    </Scroll>
                )}
            </Content>
            <ContentButtons>
                {editingSpecificRule &&
                    !areArraysEqual(
                        selectedItens,
                        editingSpecificRule.rules,
                    ) && (
                        <ContentActions>
                            <SaveDrawPriseRule
                                onPress={handleUpdateSpecificRule}
                            >
                                <TextButton>
                                    Salvar Alteração da Regra
                                </TextButton>
                            </SaveDrawPriseRule>
                        </ContentActions>
                    )}
                <ContentActions>
                    <ClearAll onPress={handleClearAll}>
                        <TextButton>Remover Todos</TextButton>
                    </ClearAll>
                    <ConfirmeButtom onPress={handleSaveSpecifcRule}>
                        <TextButton>Salvar Nome Sorteio</TextButton>
                    </ConfirmeButtom>
                </ContentActions>
                <ContentActions>
                    <SaveDrawPriseRule onPress={handleSaveRules}>
                        <TextButton>Salvar Regra Geral</TextButton>
                    </SaveDrawPriseRule>
                </ContentActions>
            </ContentButtons>
            <Portal>
                <Dialog
                    visible={dialogInputVisible}
                    onDismiss={handleCloseSpecificRuleDialog}
                    dismissable={false}
                >
                    <Dialog.Title>Informe o nome do sorteio</Dialog.Title>
                    <Dialog.Content>
                        <PaperText variant="bodyMedium">
                            Informe o nome do sorteio para salvar a regra
                            específica!
                        </PaperText>
                        <InputNoMask
                            label="Descrição"
                            onChange={setSpecificRuleName}
                            value={specificRuleName}
                            autoCapitalize="sentences"
                            multiline={3}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={handleSaveSpecifcRuleData}>
                            Salvar
                        </Button>
                        <Button onPress={handleCloseSpecificRuleDialog}>
                            Cancelar
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <DialogComponent
                visible={dialogVisible}
                title="Visualizar dados"
                text="Deseja vizualizar os dados da regra específica?"
                textActionButton="Visualizar"
                hideDialog={() => setDialogVisible(false)}
                actionButton={handleLoadDataSpecificRule}
                dismissable={false}
            />
        </Container>
    );
};
