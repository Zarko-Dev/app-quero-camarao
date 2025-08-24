/* eslint-disable no-nested-ternary */
/* eslint-disable indent */
/* eslint-disable function-paren-newline */
/* eslint-disable operator-linebreak */

import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { FlatList, Modal, SafeAreaView } from "react-native";
import { isNewBackTitleImplementation } from "react-native-screens";

import { theme } from "../../styles/Theme";
import { SearchBarSelect } from "./components/SearchBarSelect";

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

const DropdownComponent = ({
    title = "Selecione o item",
    initialTitle,
    options = [{ id: "", label: "", value: "" }],
    action,
    multipleSelect = false,
    sufix,
    clear,
    style,
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
            setText(
                item.label.length > 20
                    ? `${item.label.substring(0, 20)}...`
                    : isNewBackTitleImplementation.label,
            );
            action(item.value);
            setModalVisible(false);
        } else if (
            dataMultipleSelect.some((object) => object.label === item.label)
        ) {
            const dataFilter = dataMultipleSelect.filter(
                (dataItem) => dataItem.label !== item.label,
            );

            const joinText = dataFilter
                .map((filter) => (sufix ? filter.label + sufix : filter.label))
                .join(", ");

            setText(
                dataFilter.length > 0
                    ? joinText.length > 20
                        ? `${joinText.substring(0, 20)}...`
                        : joinText
                    : title,
            );
            setDataMultipleSelect(dataFilter);
        } else {
            const dataFilter = [...dataMultipleSelect, item];

            const joinText = dataFilter
                .map((filter) => (sufix ? filter.label + sufix : filter.label))
                .join(", ");

            setText(
                dataFilter.length > 0
                    ? joinText.length > 20
                        ? `${joinText.substring(0, 20)}...`
                        : joinText
                    : title,
            );
            setDataMultipleSelect(dataFilter);
        }

        setDataOptions();
        setSearchData();
    };

    const handleSelectAll = () => {
        if (dataMultipleSelect.length < options.length) {
            const joinText = options
                .map((filter) => (sufix ? filter.label + sufix : filter.label))
                .join(", ");

            setText(
                joinText.length > 20
                    ? `${joinText.substring(0, 20)}...`
                    : joinText,
            );
            setDataMultipleSelect(options);
        } else {
            setDataMultipleSelect([]);
        }
    };

    const actionSearch = (value) => {
        setSearchData(value);

        if (value === "") {
            setDataOptions(undefined);
        } else {
            setDataOptions(
                options.filter((item) =>
                    item.label.toLowerCase().includes(value.toLowerCase()),
                ),
            );
        }
    };

    const renderOptions = (item) => (
        <>
            <ButtonOption onPress={() => handleSelectOption(item)}>
                <ButtonOptionText>
                    {`${item.label}${sufix || ""}`}
                </ButtonOptionText>
                {multipleSelect &&
                    dataMultipleSelect.some(
                        (object) => object.label === item.label,
                    ) && (
                        <Feather
                            name="check"
                            size={20}
                            color={theme.colors.primary}
                        />
                    )}
            </ButtonOption>
            <DividerOptions />
        </>
    );

    const handleConfirmSelection = () => {
        if (dataMultipleSelect.length > 0) {
            action(dataMultipleSelect);
        } else {
            action(multipleSelect ? [] : undefined);
        }

        setModalVisible(false);
    };

    return (
        <Container style={style}>
            <SelectButton onPress={() => setModalVisible(true)}>
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
                        <ButtonHeader onPress={handleConfirmSelection}>
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
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => renderOptions(item)}
                        style={{ marginBottom: 10 }}
                    />
                </SafeAreaView>
            </Modal>
        </Container>
    );
};

export default DropdownComponent;
