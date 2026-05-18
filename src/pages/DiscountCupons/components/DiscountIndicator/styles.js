import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(32)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.6)};
    border-radius: 999px;
    border-width: 1px;
    border-color: #f2d6c4;

    background-color: #fff3ea;
`;

export const DiscountIndicatorText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;
    color: #4b4b4b;
`;
