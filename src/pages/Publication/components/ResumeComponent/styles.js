import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View``;

export const Divider = styled.View`
    width: 100%;
    height: 1px;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const ContentIndicator = styled.View`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 2px 5px 3px 5px;
`;

export const TitleIndicator = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const SubtitleIndicator = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};

    color: #525252;
`;
