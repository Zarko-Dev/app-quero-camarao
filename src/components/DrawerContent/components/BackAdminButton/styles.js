import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;
    padding: 10px 12px 14px 12px;
    background-color: #ffffff;
`;

export const ExitButton = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(46)};

    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    padding: 0 12px;
    border-radius: 12px;

    background-color: #ff5e1f;
`;

export const TextButton = styled(Text)`
    margin-left: ${({ theme }) => theme.size.dimentionsSize(1.2)};

    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
