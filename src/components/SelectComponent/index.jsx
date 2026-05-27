/* eslint-disable function-paren-newline */
/* eslint-disable operator-linebreak */

import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, Modal, SafeAreaView } from "react-native";

import { theme } from "../../styles/Theme";
import { SearchBarSelect } from "./components/SearchBarSelect";
import { View } from "react-native";

import {
    BadgeCount,
    BadgeCountText,
    ButtonHeader,
    ButtonOption,
    ButtonOptionText,
    ButtonSelectAll,
    CancelText,
    Container,
    ContentSearchBar,
    Divider,
    DividerOptions,
    HeaderContent,
    HeaderTitle,
    SelectButton,
    TextButton,
    TitleSelectAllButton,
} from "./styles";

const SelectComponent = ({
    title = "Selecione o item",
    initialTitle,
    options = [],
    action,
    multipleSelect = false,
    sufix,
    clear,
    style,
    disabled = false,
    selectedValues = []
}) => {
    const [dataOptions, setDataOptions] = useState();
    const [text, setText] = useState(title);
    const [initialSelectedTitle, setinitialSelectedTitle] =
        useState(initialTitle);
    const [modalVisible, setModalVisible] = useState(false);
    const [dataMultipleSelect, setDataMultipleSelect] = useState(selectedValues);
    const [searchData, setSearchData] = useState();


    useEffect(() => {
        setinitialSelectedTitle(initialTitle);
    }, [initialTitle]);

    useEffect(() => {
        setDataOptions();
        setText(title);
        setinitialSelectedTitle(initialTitle);
        setDataMultipleSelect([]);
        setSearchData();
    }, [clear]);

        useEffect(() => {
    setDataMultipleSelect(selectedValues)
    if (selectedValues.length > 0) {
        setText(selectedValues.map(v => sufix ? v + sufix : v).join(', '))
    }
}, [selectedValues.length])


    const handleSelectOption = (item) => {
        setinitialSelectedTitle(undefined);

        if (!multipleSelect) {
            setText(item);
            action(item);
            setModalVisible(false);
        } else if (dataMultipleSelect.includes(item)) {
            const dataFilter = dataMultipleSelect.filter(
                (dataItem) => dataItem !== item,
            );

            setDataMultipleSelect(dataFilter);
            action(dataFilter);
        } else {
            const dataFilter = [...dataMultipleSelect, item];

            setText(
                dataFilter
                    .map((filter) => (sufix ? filter + sufix : filter))
                    .join(", "),
            );
            setDataMultipleSelect(dataFilter);
            action(dataFilter);
        }

        setDataOptions();
        setSearchData();
    };

    const handleSelectAll = () => {
        if (dataMultipleSelect.length < options.length) {
            setText(
                options
                    .map((filter) => (sufix ? filter + sufix : filter))
                    .join(", "),
            );
            setDataMultipleSelect(options);
            action(options);
        } else {
            setDataMultipleSelect([]);
            action([]);
        }
    };

    const actionSearch = (value) => {
        setSearchData(value);

        if (value === "") {
            setDataOptions(undefined);
        } else {
            setDataOptions(
                options.filter((item) =>
                    (typeof item === "string" ? item : "")
                        .toLowerCase()
                        .includes((value || "").toLowerCase()),
                ),
            );
        }
    };

  const parseLabel = (label) => {
    if (typeof label !== "string") return { name: "", cpf: "", type: "" };
    // format: "Nome - CPF (Tipo)"
    const dashIdx = label.lastIndexOf(" - ");
    if (dashIdx === -1) return { name: label, cpf: "", type: "" };
    const name = label.substring(0, dashIdx).trim();
    const rest = label.substring(dashIdx + 3).trim();
    const parenIdx = rest.indexOf(" (");
    const cpf = parenIdx !== -1 ? rest.substring(0, parenIdx).trim() : rest;
    const type = parenIdx !== -1 ? rest.substring(parenIdx + 2, rest.length - 1) : "";
    return { name, cpf, type };
  };

  const renderOptions = (item) => {
    const isSelected = multipleSelect && dataMultipleSelect.includes(item);
    const { name, cpf, type } = parseLabel(item);
    const isProdutor = type === "Produtor";
    return (
        <View>
            <ButtonOption selected={isSelected} onPress={() => handleSelectOption(item)}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <ButtonOptionText selected={isSelected} style={{ marginRight: 0 }}>
                            {name || item}
                        </ButtonOptionText>
                        {type ? (
                            <View style={{
                                backgroundColor: isProdutor ? "#e8f4ea" : "#e8f0ff",
                                borderRadius: 4,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                            }}>
                                <ButtonOptionText style={{
                                    fontSize: 11,
                                    fontWeight: "600",
                                    color: isProdutor ? "#2e7d32" : "#1565c0",
                                    flex: 0,
                                }}>
                                    {type}
                                </ButtonOptionText>
                            </View>
                        ) : null}
                    </View>
                    {cpf ? (
                        <ButtonOptionText style={{
                            fontSize: 12,
                            color: "#888",
                            fontWeight: "400",
                            marginTop: 2,
                            flex: 0,
                        }}>
                            {cpf}
                        </ButtonOptionText>
                    ) : null}
                </View>
                {isSelected && (
                    <Feather name="check-circle" size={20} color={theme.colors.primary} />
                )}
            </ButtonOption>
            <DividerOptions />
        </View>
    );
};

    return (
        <Container style={style}>
            <SelectButton
                onPress={() => setModalVisible(true)}
                disabled={disabled}
            >
                <TextButton>
                    {multipleSelect && dataMultipleSelect.length > 0
                        ? title
                        : initialSelectedTitle || text}
                </TextButton>
                {multipleSelect && dataMultipleSelect.length > 0 && (
                    <BadgeCount>
                        <BadgeCountText>{dataMultipleSelect.length}</BadgeCountText>
                    </BadgeCount>
                )}
                <Feather name="chevron-down" size={18} color="#E8572A" />
            </SelectButton>
            <Modal
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView>
                    <HeaderContent>
                        <ButtonHeader onPress={() => setModalVisible(false)}>
                            <Feather
                                name="arrow-left"
                                size={24}
                                color="white"
                            />
                        </ButtonHeader>
                        <HeaderTitle multipleSelect={dataMultipleSelect}>
                            {title}
                        </HeaderTitle>
                        <ButtonHeader onPress={() => setModalVisible(false)}>
                            <CancelText>
                                {dataMultipleSelect.length > 0
                                    ? "Ok"
                                    : "Cancelar"}
                            </CancelText>
                        </ButtonHeader>
                    </HeaderContent>
                    <Divider />
                    <ContentSearchBar>
                        <SearchBarSelect
                            value={searchData}
                            action={actionSearch}
                            decrease={multipleSelect}
                        />
                        {multipleSelect && (
                            <ButtonSelectAll onPress={handleSelectAll}>
                                <TitleSelectAllButton
                                    remove={
                                        dataMultipleSelect.length ===
                                        options.length
                                    }
                                >
                                    {dataMultipleSelect.length ===
                                    options.length
                                        ? "Remover Todos"
                                        : "Selecionar Todos"}
                                </TitleSelectAllButton>
                            </ButtonSelectAll>
                        )}
                    </ContentSearchBar>
                    <FlatList
                        data={dataOptions || options}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => renderOptions(item)}
                        style={{ marginBottom: 10 }}
                    />
                </SafeAreaView>
            </Modal>
        </Container>
    );
};

export default SelectComponent;
