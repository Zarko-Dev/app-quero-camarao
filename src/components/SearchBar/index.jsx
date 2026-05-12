import { Feather } from "@expo/vector-icons";
import { ActivityIndicator, View } from "react-native";
import { Container, SearchInputContainer, StyledInput } from "./styles";
import { theme } from "../../styles/Theme";

export const SearchBar = ({
    searchText,
    onChange,
    isLoadingSearch = false,
}) => (
    <Container>
        <SearchInputContainer>
            <Feather name="search" size={20} color="#888" />
            <StyledInput
                placeholder="Busque aqui..."
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={onChange}
                autoCapitalize="none"
            />
            {isLoadingSearch && (
                <ActivityIndicator color={theme.colors.primary} size="small" />
            )}
        </SearchInputContainer>
    </Container>
);
