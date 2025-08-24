import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};

    elevation: 3;
`;

export const TitleButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
