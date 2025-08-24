/* eslint-disable indent */
import styled from "styled-components/native";
import { Text } from "react-native-paper";

export const ScrollTest = styled.ScrollView`
    width: 100%;
    height: 100%;

    position: absolute;

    background-color: #00000064;
`;

export const Container = styled.View`
    justify-content: flex-end;
    flex-direction: row;
`;

export const ContentButtonBack = styled.TouchableOpacity`
    width: 100%;
    height: 100%;
`;

export const ContentFilterStyle = styled.View`
    height: 100%;

    background-color: #f5f5f5;

    padding: 10px;
`;

export const ContentViewSeparator = styled.View`
    height: 100%;

    justify-content: space-between;
`;

export const TitleFilter = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1.5)};

    color: ${({ theme }) => theme.colors.primary};
`;

export const ContentButtonAction = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(3)};
`;

export const ButtonQuantity = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(35)};
    height: ${({ theme }) => theme.size.componentSize(23)};

    justify-content: center;
    align-items: center;

    margin-right: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};

    border-radius: 4px;
    border: 1px
        ${({ theme, selected }) =>
            selected ? theme.colors.primary : theme.colors.border}
        solid;

    background-color: ${({ theme, selected }) =>
        selected ? theme.colors.primary : "transparent"};
`;

export const TextButtonQuantity = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;

    color: ${({ theme, selected }) =>
        selected ? theme.colors.white : theme.colors.primary};
`;

export const ContentFilterActions = styled.View`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
`;

export const ButtonClear = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(100)};
    height: ${({ theme }) => theme.size.componentSize(40)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;
    border: 1px ${({ theme }) => theme.colors.border} solid;
`;

export const TextClear = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.primary};
`;

export const ButtonFilter = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(100)};
    height: ${({ theme }) => theme.size.componentSize(40)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.primary};
`;

export const TextFilter = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
