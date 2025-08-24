import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    flex: 1;
`;

export const ContainerModal = styled.View`
    flex: 1;
    justify-content: flex-end;
    align-items: center;
    background-color: #00000080;
`;

export const ContentModal = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(250)};

    justify-content: space-between;
    align-items: center;

    padding: ${({ theme }) => theme.size.componentSize(15)} 5px;
    border-top-left-radius: ${({ theme }) => theme.size.componentSize(30)};
    border-top-right-radius: ${({ theme }) => theme.size.componentSize(30)};
    margin-bottom: ${({ opneKeyboard, theme }) =>
        opneKeyboard ? theme.size.dimentionsSize(40) : "0px"};

    background-color: ${({ theme }) => theme.colors.tertiary};
`;

export const ContentTitle = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 0 10px;
`;

export const ButtonBack = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(30)};
    height: ${({ theme }) => theme.size.componentSize(30)};
`;

export const Title = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;
`;

export const Subtitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    text-align: justify;
`;

export const ButtonUseCupom = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(45)};

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
