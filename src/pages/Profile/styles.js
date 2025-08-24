import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;

    justify-content: space-between;
    align-items: center;
`;

export const ContentProfile = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(130)};

    justify-content: flex-start;
    align-items: center;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const ContentUserType = styled.View`
    width: 100%;

    justify-content: center;
    align-items: flex-end;

    padding: 0 5px;
`;

export const UserTypeTag = styled(Text)`
    font-weight: bold;

    padding: 5px;
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.quaternary};
`;

export const ButtonCamera = styled.TouchableOpacity`
    padding: 1px;
    border: 3px ${({ theme }) => theme.colors.primary} solid;
    border-radius: ${({ theme }) => theme.size.componentSize(128)};
`;

export const UserImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(128)};
    height: ${({ theme }) => theme.size.componentSize(128)};

    margin-top: ${({ theme }) => theme.size.dimentionsSize(6)};
    border-radius: ${({ theme }) => theme.size.componentSize(128)};

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const UserName = styled(Text)`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};

    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(16)};

    color: ${({ theme }) => theme.colors.text};
`;

export const UserEmail = styled(Text)`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ theme }) => theme.colors.text};
`;

export const ContentActionButtons = styled.View`
    width: 100%;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(15)};
`;

export const ActionButton = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    padding: 0 20px;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    color: ${({ red, theme }) => (red ? theme.colors.red : theme.colors.text)};
`;

export const Divider = styled.View`
    width: 100%;
    height: 1px;

    background-color: #c3c3c3;
`;

export const ShrimpIcon = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(30)};
    height: ${({ theme }) => theme.size.componentSize(30)};

    margin-left: -3px;
`;

export const ButtonExit = styled.TouchableOpacity`
    width: 98%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};
`;

export const TextExitButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
