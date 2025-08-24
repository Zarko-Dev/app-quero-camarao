import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;

    justify-content: center;
    align-items: center;

    padding: 15px 0;
`;

export const ContentTimerInfo = styled.View`
    width: 100%;

    justify-content: space-around;
    align-items: center;
    flex-direction: row;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const ContentTimer = styled.View`
    justify-content: center;
    align-items: center;
`;

export const TextTimer = styled(Text)`
    font-weight: bold;
`;

export const TimerIndicator = styled.View`
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    padding: 0 10px;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: ${({ theme }) => theme.size.componentSize(35)};

    background-color: ${({ theme }) => theme.colors.tertiary};
`;

export const TimerIndicatorText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;
`;

export const ContentQuantity = styled.View`
    justify-content: center;
    align-items: center;
`;

export const TextQuantity = styled(Text)`
    font-weight: bold;
`;

export const QuantityIndicator = styled.View`
    width: 65%;
    height: ${({ theme }) => theme.size.componentSize(35)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: ${({ theme }) => theme.size.componentSize(35)};

    background-color: ${({ theme }) => theme.colors.tertiary};
`;

export const QuantityIndicatorText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;
`;

export const DiscountIndicator = styled.View`
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
