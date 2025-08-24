import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const TimerIndicatorText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
