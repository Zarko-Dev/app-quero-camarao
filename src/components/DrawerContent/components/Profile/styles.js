import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(160)};

    padding: ${({ theme }) => theme.size.dimentionsSize(2)};

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const UserImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(70)};
    height: ${({ theme }) => theme.size.componentSize(70)};

    border-radius: ${({ theme }) => theme.size.componentSize(70)};
`;

export const UserName = styled(Text)`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};

    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(16)};

    color: ${({ theme }) => theme.colors.white};
`;

export const UserEmail = styled(Text)`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ theme }) => theme.colors.white};
`;

export const UserContentIsNotAuthenticated = styled.View`
    width: ${({ theme }) => theme.size.componentSize(70)};
    height: ${({ theme }) => theme.size.componentSize(70)};

    justify-content: center;
    align-items: center;

    border-radius: ${({ theme }) => theme.size.componentSize(70)};

    background-color: ${({ theme }) => theme.colors.white};
`;

export const ButtonLoginRegister = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(100)};
    height: ${({ theme }) => theme.size.componentSize(40)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    border-radius: 5px;

    background-color: ${({ theme }) => theme.colors.black};

    elevation: 5;
`;

export const ButtonText = styled(Text)`
    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(16)};

    color: ${({ theme }) => theme.colors.white};
`;
