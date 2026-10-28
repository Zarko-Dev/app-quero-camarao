import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    flex: 1;
    width: 92%;
    align-self: center;
    margin-top: 20px;
`;

export const ContentNextLoading = styled.View`
    justify-content: center;
    align-items: center;

    padding: 10px;
`;

export const TitleNextEnd = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.primary};
`;
