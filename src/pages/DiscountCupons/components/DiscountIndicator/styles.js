import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 60%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: ${({ theme }) => theme.size.componentSize(45)};

    background-color: ${({ theme }) => theme.colors.tertiary};
`;

export const DiscountIndicatorText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;
`;
