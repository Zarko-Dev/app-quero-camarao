import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;

    justify-content: space-evenly;
    align-items: center;
`;

export const LogoImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(222)};
    height: ${({ theme }) => theme.size.componentSize(119)};
`;

export const ContentFormLogin = styled.View`
    width: 80%;

    justify-content: center;
    align-items: center;
`;

export const Footer = styled.View`
    width: 100%;

    justify-content: center;
    align-items: center;
`;

export const ButtonLogin = styled.TouchableOpacity`
    width: 80%;
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};

    elevation: 3;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const ContentTextRegister = styled.View`
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.componentSize(15)};
`;

export const TextRegister = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
`;

export const ButtonRegister = styled.TouchableOpacity``;

export const TextButtonRegister = styled(TextRegister)`
    color: ${({ theme }) => theme.colors.primary};
`;

export const MethodTabs = styled.View`
    flex-direction: row;
    width: 80%;
    margin-bottom: ${({ theme }) => theme.size.componentSize(16)};
    border-radius: 8px;
    overflow: hidden;
    border-width: 1.5px;
    border-color: ${({ theme }) => theme.colors.primary};
`;

export const MethodTab = styled.TouchableOpacity`
    flex: 1;
    padding: ${({ theme }) => theme.size.componentSize(10)} 0;
    align-items: center;
    background-color: ${({ active, theme }) =>
        active ? theme.colors.primary : "transparent"};
`;

export const MethodTabText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: 600;
    color: ${({ active, theme }) =>
        active ? theme.colors.white : theme.colors.primary};
`;
