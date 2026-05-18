import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1.2)};
    border-radius: 14px;
    border-width: 1px;
    border-color: #ececec;
    overflow: hidden;

    background-color: #ffffff;
`;

export const Header = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(34)};

    justify-content: center;
    align-items: center;
    flex-direction: row;

    border-top-left-radius: 14px;
    border-top-right-radius: 14px;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const TextHeader = styled(Text)`
    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(14)};

    color: ${({ theme }) => theme.colors.white};
`;

export const ButtonDelete = styled.TouchableOpacity`
    width: 48%;
    height: ${({ theme }) => theme.size.componentSize(40)};

    justify-content: center;
    align-items: center;
    flex-direction: row;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 10px;
    border-width: 1px;
    border-color: #d8d8d8;

    background-color: #f7f7f7;
`;

export const ButtonSetDefault = styled(ButtonDelete)`
    border-width: 0;
    background-color: ${({ isDefault, theme }) =>
        isDefault ? "#f08a5d" : theme.colors.primary};
`;

export const TitleButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: 700;
    text-align: center;
    color: ${({ theme }) => theme.colors.text};
`;

export const ContentActionButtonCoupon = styled.View`
    width: 100%;
    justify-content: space-around;
    align-items: center;
    flex-direction: row;
    padding: 0 8px;
`;

export const HeaderIconWrap = styled.View`
    margin-right: 8px;
`;
