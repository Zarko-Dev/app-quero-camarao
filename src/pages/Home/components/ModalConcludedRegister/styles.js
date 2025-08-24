import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View``;

export const HeaderContent = styled.View`
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 0 ${({ theme }) => theme.size.dimentionsSize(2)};

    background-color: #f1f1f1;
`;

export const ButtonHeader = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;
`;

export const HeaderTitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
`;

export const CancelText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;
`;

export const Divider = styled.View`
    width: 100%;
    height: 1px;

    background-color: #c3c3c3;
`;

export const ContentForm = styled.View`
    height: 93%;

    justify-content: center;
    align-items: center;

    padding: 15px;
`;

export const TextAlertMessage = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(17)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ theme }) => theme.colors.red};
`;

export const ButtonConcludedRegister = styled.TouchableOpacity`
    width: 85%;
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};

    elevation: 3;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
