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
    font-size: ${({ theme }) => theme.size.fontSize(14)};
`;

export const ButtonRegister = styled.TouchableOpacity``;

export const TextButtonRegister = styled(TextRegister)`
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
`;
