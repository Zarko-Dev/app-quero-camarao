import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    justify-content: space-evenly;
    align-items: center;
    background-color: ${({ theme }) => theme.colors.background};
`;

export const LogoImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(222)};
    height: ${({ theme }) => theme.size.componentSize(119)};
`;

export const Title = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.black};
    text-align: center;
`;

export const Subtitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    color: ${({ theme }) => theme.colors.text};
    text-align: center;
    margin-top: 4px;
`;

export const ContentForm = styled.View`
    width: 80%;
    justify-content: center;
    align-items: center;
    gap: 4px;
`;

export const ButtonSave = styled.TouchableOpacity`
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
