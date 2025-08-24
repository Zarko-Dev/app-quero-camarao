import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;

    padding-top: 20px;

    align-items: center;
`;

export const ContentAlert = styled.View`
    width: 70%;

    justify-content: center;
    align-items: center;
    flex-direction: row;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};
    padding: 5px 0;
    border-radius: 100px;

    background-color: ${({ color }) => color || "none"};

    elevation: 3;
`;

export const AlertText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;
    text-align: center;

    margin-left: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ color }) => color || "#3c3c3c"};
`;

export const ContentInfo = styled.View`
    width: 100%;

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.5)};
    padding: 0 10px;
`;

export const Title = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};

    text-align: center;
`;

export const ButtonRegister = styled.TouchableOpacity`
    width: 85%;
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};
    border-radius: 4px;

    background-color: ${({ theme, black }) =>
        black ? theme.colors.black : theme.colors.primary};

    elevation: 3;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const Alert = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    text-align: center;

    color: ${({ theme }) => theme.colors.red};
`;
