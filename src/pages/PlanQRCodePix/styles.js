import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    justify-content: flex-start;
    align-items: center;
    padding: 10px;
`;

export const Title = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;
    text-align: center;
    color: ${({ theme }) => theme.colors.black};
`;

export const TitleValue = styled(Title)`
    font-size: ${({ theme }) => theme.size.fontSize(25)};
    color: ${({ theme }) => theme.colors.primary};
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const QrCodeImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(200)};
    height: ${({ theme }) => theme.size.componentSize(200)};
    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(3)};
`;

export const ButtonCopyPaste = styled.TouchableOpacity`
    width: 95%;
    height: ${({ theme }) => theme.size.componentSize(50)};
    justify-content: center;
    align-items: center;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;
    background-color: ${({ copyed, theme }) =>
        copyed ? theme.colors.green : theme.colors.black};
    elevation: 3;
`;

export const ButtonVerify = styled.TouchableOpacity`
    width: 95%;
    height: ${({ theme }) => theme.size.componentSize(50)};
    justify-content: center;
    align-items: center;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.green};
    elevation: 3;
`;

export const ButtonBackHome = styled.TouchableOpacity`
    width: 95%;
    height: ${({ theme }) => theme.size.componentSize(50)};
    justify-content: center;
    align-items: center;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.primary};
    elevation: 3;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.white};
`;
