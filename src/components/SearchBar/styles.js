import { TextInput } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 75%;
`;

export const SearchInput = styled(TextInput)`
    height: ${({ theme }) => theme.size.componentSize(35)};

    justify-content: center;

    font-size: 15px;
    color: ${({ theme }) => theme.colors.black};
    background-color: ${({ theme }) => theme.colors.inputColor};

    border-radius: 4px;
`;
