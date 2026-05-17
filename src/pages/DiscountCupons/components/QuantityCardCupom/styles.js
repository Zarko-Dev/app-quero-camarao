import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;

    justify-content: center;
    align-items: center;

    padding: 12px 10px;
`;

export const ContentQuantityInfo = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1.3)};
`;

export const ContentQuantity = styled.View`
    width: 48%;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 10px;
    border-radius: 10px;
    border-width: 1px;
    border-color: #ededed;
    background-color: #fff;
`;

export const TextQuantity = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;
    color: #626262;
`;

export const QuantityIndicator = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(36)};

    justify-content: center;
    align-items: flex-start;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.6)};
    padding-left: 2px;
    border-radius: 8px;

    background-color: #fff3ea;
`;

export const QuantityIndicatorText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(24)};
    font-weight: bold;
    color: #2c2c2c;
`;
