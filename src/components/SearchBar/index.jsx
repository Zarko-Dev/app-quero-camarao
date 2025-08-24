/* eslint-disable react/jsx-wrap-multilines */

import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, TextInput } from "react-native-paper";

import { Container, SearchInput } from "./styles";
import { theme } from "../../styles/Theme";

export const SearchBar = ({
    searchText,
    onChange,
    isLoadingSearch = false,
}) => (
    <Container>
        <SearchInput
            label="Busque aqui..."
            mode="outlined"
            left={
                <TextInput
                    icon={() => (
                        <Feather
                            name="search"
                            size={20}
                            color={theme.colors.black}
                            style={{ marginTop: 11 }}
                        />
                    )}
                />
            }
            right={
                isLoadingSearch && (
                    <TextInput
                        icon={() => (
                            <ActivityIndicator color={theme.colors.primary} />
                        )}
                    />
                )
            }
            outlineColor={theme.colors.quaternary}
            activeOutlineColor={theme.colors.text}
            textColor={theme.colors.text}
            autoCapitalize="none"
            value={searchText}
            onChangeText={onChange}
        />
    </Container>
);
