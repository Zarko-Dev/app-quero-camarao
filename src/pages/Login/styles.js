import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.background};
    justify-content: center;
    align-items: center;
    padding: ${({ theme }) => theme.size.dimentionsSize(2)} 0
        ${({ theme }) => theme.size.dimentionsSize(3)};
`;

export const Header = styled.View`
    width: 88%;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1.4)};
`;

export const BrandCard = styled.View`
    width: 100%;
    align-items: center;
    padding: ${({ theme }) => theme.size.dimentionsSize(1)}
        ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const LogoImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(196)};
    height: ${({ theme }) => theme.size.componentSize(106)};
`;

export const WelcomeTitle = styled(Text)`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    color: ${({ theme }) => theme.colors.black};
    font-weight: bold;
`;

export const WelcomeSubtitle = styled(Text)`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.4)};
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    color: ${({ theme }) => theme.colors.text};
`;

export const ContentFormLogin = styled.View`
    width: 88%;
    justify-content: center;
    align-items: center;
    padding: ${({ theme }) => theme.size.dimentionsSize(0.5)} 0;
`;

export const Footer = styled.View`
    width: 88%;
    justify-content: center;
    align-items: center;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const ButtonLogin = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};

    elevation: 0;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const ContentTextRegister = styled.View`
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.componentSize(14)};
`;

export const TextRegister = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: ${({ theme }) => theme.colors.text};
`;

export const ButtonRegister = styled.TouchableOpacity``;

export const TextButtonRegister = styled(TextRegister)`
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
`;
