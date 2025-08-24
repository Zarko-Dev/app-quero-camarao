import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;
`;

export const ExitButton = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(40)};

    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    padding: 0 5px;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const TextButton = styled(Text)`
    margin-left: ${({ theme }) => theme.size.dimentionsSize(2)};

    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
