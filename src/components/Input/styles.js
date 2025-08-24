import { TextInput } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;
`;

export const InputStyle = styled(TextInput)`
    background-color: ${({ theme }) => theme.colors.inputColor};
`;
