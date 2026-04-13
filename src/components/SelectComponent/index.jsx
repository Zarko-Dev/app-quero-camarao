/* eslint-disable function-paren-newline */
/* eslint-disable operator-linebreak */

import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, Modal, SafeAreaView } from "react-native";

import { theme } from "../../styles/Theme";
import { SearchBarSelect } from "./components/SearchBarSelect";
import { View } from "react-native";

import {
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
}) => {
    const [dataOptions, setDataOptions] = useState();
    const [text, setText] = useState(title);
    const [initialSelectedTitle, setinitialSelectedTitle] =
        useState(initialTitle);
    const [modalVisible, setModalVisible] = useState(false);
    const [dataMultipleSelect, setDataMultipleSelect] = useState([]);
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

  const renderOptions = (item) => (
    <View>
        <ButtonOption onPress={() => handleSelectOption(item)}>
            <ButtonOptionText>{typeof item === "string" ? item : ""}</ButtonOptionText>
            {multipleSelect && dataMultipleSelect.includes(item) && (
                <Feather
                    name="check"
                    size={20}
                    color={theme.colors.primary}
                />
            )}
        </ButtonOption>
        <DividerOptions />
    </View>
);

    return (
        <Container style={style}>
            <SelectButton
                onPress={() => setModalVisible(true)}
                disabled={disabled}
            >
                <TextButton>{initialSelectedTitle || text}</TextButton>
                <Feather name="chevron-down" size={18} color="black" />
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
                                color="black"
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
