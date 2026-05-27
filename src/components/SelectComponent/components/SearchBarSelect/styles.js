import { TextInput } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    flex: ${({ decrease }) => (decrease ? "1" : "0 0 100%")};

    justify-content: center;
    align-items: center;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const InputSerach = styled(TextInput)`
    width: 90%;
    height: 40px;

    opacity: 0.7;
`;
