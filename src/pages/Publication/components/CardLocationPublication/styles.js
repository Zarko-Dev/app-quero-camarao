import { Text } from "react-native-paper";
import styled from "styled-components/native";

import SelectComponent from "../../../../components/SelectComponent";

export const Container = styled.View`
    width: 100%;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.tertiary};
`;

export const Header = styled.View`
    height: ${({ theme }) => theme.size.componentSize(28)};

    justify-content: center;
    align-items: center;

    border-top-left-radius: 4px;
    border-top-right-radius: 4px;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const TextHeader = styled(Text)`
    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(15)};

    color: ${({ theme }) => theme.colors.white};
`;

export const ContentLocation = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: flex-start;
    flex-direction: row;

    padding: 5px;
`;

export const ContentInputSelect = styled.View`
    width: 49%;
`;

export const SelectComponentStyle = styled(SelectComponent)`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.5)};
`;

export const TextInputSelect = styled(Text)`
    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(13)};

    margin-left: -1px;

    color: ${({ theme }) => theme.colors.black};
`;
