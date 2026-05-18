import { Feather } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native";
import { Container, SearchInputContainer, StyledInput } from "./styles";
import { theme } from "../../styles/Theme";

export const SearchBar = ({
    searchText,
    onChange,
    isLoadingSearch = false,
    placeholder = "Busque aqui...",
}) => (
    <Container>
        <SearchInputContainer>
            <Feather name="search" size={20} color="#888" />
            <StyledInput
                placeholder={placeholder}
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
