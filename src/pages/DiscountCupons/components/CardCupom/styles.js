import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.quaternary};
`;

export const Header = styled.View`
    width: 100%;
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

export const ButtonDelete = styled.TouchableOpacity`
    width: 45%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};

    elevation: 3;
`;

export const ButtonSetDefault = styled(ButtonDelete)`
    background-color: ${({ isDefault, theme }) =>
        isDefault ? theme.colors.red : theme.colors.primary};
`;

export const TitleButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;
    text-align: center;

    color: ${({ theme }) => theme.colors.white};
`;

export const ContentActionButtonCoupon = styled.View`
    width: 100%;
    justify-content: space-around;
    align-items: center;
    flex-direction: row;
`;
