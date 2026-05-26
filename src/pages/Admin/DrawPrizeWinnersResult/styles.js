import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;

    justify-content: flex-start;
    align-items: center;
`;

export const Content = styled.View`
    flex: 1;
    height: 100%;

    justify-content: ${({ justifyContent }) => justifyContent};
    align-items: center;
`;

export const Header = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    padding: 0 12px;
`;

export const BackButton = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(34)};
    height: ${({ theme }) => theme.size.componentSize(34)};
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2.5)};
    background-color: ${({ theme }) => theme.colors.tertiary};
    align-items: center;
    justify-content: center;
    border-radius: ${({ theme }) => theme.size.componentSize(34)};
`;

export const Title = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(25)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(4)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};
    flex: 1;
    text-align: center;
    margin-left: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-right: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ theme }) => theme.colors.primary};
`;

export const ContainerCards = styled.ScrollView`
    width: 100%;
`;

export const ContentCards = styled.View`
    justify-content: flex-start;
    align-items: center;
`;

export const CardUser = styled.TouchableOpacity`
    width: 95%;

    justify-content: flex-start;
    align-items: center;

    padding: 16px 14px;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 12px;

    border: 2px solid ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.white};
    elevation: 3;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.1;
    shadow-radius: 4px;
`;

export const InfoRow = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.5)};
    align-self: stretch;
    padding-horizontal: 8px;
`;

export const ContentShareUser = styled.View`
    width: 100%;

    display: flex;
    align-items: flex-end;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(-3)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(3)};
`;

export const UserImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(100)};
    height: ${({ theme }) => theme.size.componentSize(100)};

    border-radius: ${({ theme }) => theme.size.componentSize(100)};
`;

export const UserNameTitle = styled(Text)`
    text-align: center;

    font-size: ${({ theme }) => theme.size.fontSize(25)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};

    color: ${({ theme }) => theme.colors.black};
`;

export const LocationTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: 500;
    flex: 1;
    color: ${({ theme }) => theme.colors.black};
`;

export const PhoneTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: 500;
    flex: 1;
    color: ${({ theme }) => theme.colors.black};
`;

export const SaveDrawPrize = styled.TouchableOpacity`
    width: 95%;
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ changeColor, theme }) =>
        changeColor ? theme.colors.primary : theme.colors.black};

    elevation: 3;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const DrawPizeShare = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(34)};
    height: ${({ theme }) => theme.size.componentSize(34)};

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2.5)};

    background-color: ${({ theme }) => theme.colors.primary};
    align-items: center;
    justify-content: center;

    padding-right: 3px;

    border-radius: ${({ theme }) => theme.size.componentSize(34)};
`;
