import { Text } from "react-native-paper";
import styled from "styled-components/native";
import { Input } from "../Input";

export const Container = styled.View`
    width: 100%;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.tertiary};
`;

export const Header = styled.View`
    height: ${({ theme }) => theme.size.componentSize(28)};

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    border-top-left-radius: 4px;
    border-top-right-radius: 4px;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const ContentInternalHeader = styled.View`
    width: 28px;
`;

export const TitleHeader = styled(Text)`
    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(15)};

    color: ${({ theme }) => theme.colors.white};
`;

export const ButtonDeleteCardPond = styled.TouchableOpacity``;

export const ContentForm = styled.View`
    justify-content: center;
    align-items: center;

    padding: 15px 5px 5px 5px;
`;

export const ContentImage = styled.View`
    width: ${({ theme }) => theme.size.componentSize(105)};
    height: ${({ theme }) => theme.size.componentSize(105)};

    justify-content: center;
    align-items: center;

    border: 1.5px ${({ theme }) => theme.colors.primary} solid;

    border-radius: ${({ theme }) => theme.size.componentSize(105)};
`;

export const ImageShrimp = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(100)};
    height: ${({ theme }) => theme.size.componentSize(100)};

    border-radius: ${({ theme }) => theme.size.componentSize(100)};
`;

export const ContentInput = styled.View`
    width: 100%;
`;

export const TitleInput = styled(Text)`
    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(13)};

    color: ${({ theme }) => theme.colors.black};
`;

export const InputStyle = styled(Input)`
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;
