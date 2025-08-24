/* eslint-disable indent */

import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    padding: 10px;
`;

export const ContainerCard = styled.View`
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: row;

    margin-top: 5px;
    margin-bottom: 5px;

    padding: 10px;
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.tertiary};

    elevation: 3;
`;

export const ContentIcon = styled.View`
    width: ${({ theme }) => theme.size.componentSize(50)};
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;

    margin-right: ${({ theme }) => theme.size.dimentionsSize(1)};
    border: 2px
        ${({ read, theme }) =>
            read ? theme.colors.green : theme.colors.primary}
        solid;
    border-radius: ${({ theme }) => theme.size.componentSize(50)};
`;

export const ContentInfo = styled.View`
    width: ${({ read }) => (read ? "80%" : "65%")};
`;

export const TitleInfo = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(0.5)};

    color: ${({ theme }) => theme.colors.black};
`;

export const MessageInfo = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1.5)};

    color: ${({ theme }) => theme.colors.black};
`;

export const DateReceived = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const ContentActionButtons = styled.View`
    width: ${({ theme }) => theme.size.componentSize(50)};
    height: 100%;

    justify-content: flex-end;
    align-items: center;
    flex-direction: row;
`;

export const ActionButton = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(45)};
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    border-radius: ${({ theme }) => theme.size.componentSize(45)};

    background-color: ${({ read, theme }) =>
        read ? theme.colors.green : theme.colors.red};

    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
    elevation: 3;
`;
