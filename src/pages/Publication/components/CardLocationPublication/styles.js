import { Text } from "react-native-paper";
import styled from "styled-components/native";

import SelectComponent from "../../../../components/SelectComponent";

export const Container = styled.View`
    width: 100%;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    padding: 10px;
    border-radius: 8px;
    border-width: 1px;
    border-color: #ffe2cc;
    background-color: #ffffff;
`;

export const Header = styled.View`
    margin-bottom: 10px;
`;

export const TextHeader = styled(Text)`
    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    color: ${({ theme }) => theme.colors.primary};
`;

export const ContentLocation = styled.View`
    width: 100%;
    justify-content: space-between;
    align-items: flex-start;
    flex-direction: row;
`;

export const ContentInputSelect = styled.View`
    width: 49%;
`;

export const SelectComponentStyle = styled(SelectComponent)`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.5)};
`;

export const TextInputSelect = styled(Text)`
    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: ${({ theme }) => theme.colors.text};
`;
