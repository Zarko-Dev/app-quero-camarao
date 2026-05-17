import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;
    min-height: ${({ theme }) => theme.size.componentSize(210)};

    padding: ${({ theme }) => theme.size.dimentionsSize(2)};
    justify-content: flex-end;
`;

export const UserImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(68)};
    height: ${({ theme }) => theme.size.componentSize(68)};

    border-width: 2px;
    border-color: rgba(255, 255, 255, 0.35);
    border-radius: ${({ theme }) => theme.size.componentSize(68)};
`;

export const UserName = styled(Text)`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.5)};

    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(16)};

    color: ${({ theme }) => theme.colors.white};
`;

export const UserEmail = styled(Text)`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.5)};

    color: rgba(255, 255, 255, 0.9);
`;

export const UserContentIsNotAuthenticated = styled.View`
    width: ${({ theme }) => theme.size.componentSize(70)};
    height: ${({ theme }) => theme.size.componentSize(70)};

    justify-content: center;
    align-items: center;

    border-radius: ${({ theme }) => theme.size.componentSize(70)};

    background-color: ${({ theme }) => theme.colors.white};
`;

export const IdentityBadge = styled.View`
    align-self: flex-start;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.5)};
    padding: 6px 10px;
    border-radius: 999px;
    background-color: rgba(255, 255, 255, 0.2);
`;

export const IdentityBadgeText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    color: ${({ theme }) => theme.colors.white};
    font-weight: bold;
`;

export const HeaderMark = styled.View`
    position: absolute;
    top: ${({ theme }) => theme.size.dimentionsSize(2)};
    right: ${({ theme }) => theme.size.dimentionsSize(2)};
    opacity: 0.16;
`;

export const HeaderMarkImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(46)};
    height: ${({ theme }) => theme.size.componentSize(46)};
`;

export const ButtonLoginRegister = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(120)};
    height: ${({ theme }) => theme.size.componentSize(42)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    border-radius: 12px;

    background-color: rgba(255, 255, 255, 0.2);

    elevation: 5;
`;

export const ButtonText = styled(Text)`
    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(16)};

    color: ${({ theme }) => theme.colors.white};
`;
