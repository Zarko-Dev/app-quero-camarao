import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;

    height: ${({ theme }) => theme.size.componentSize(130)};

    justify-content: center;
    align-items: flex-start;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    border-radius: 4px;
    padding: 15px;

    background-color: ${({ theme }) => theme.colors.quaternary};
`;

export const TitleResume = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const Divider = styled.View`
    width: 100%;
    height: 1px;

    background-color: #7f7f7f;
`;

export const ContainerInfo = styled.View`
    width: 100%;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.5)};
`;

export const ContentInfo = styled.View`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.5)};
`;

export const TitleInfo = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};

    color: ${({ theme }) => theme.colors.black};
`;

export const ButtonCupom = styled.TouchableOpacity`
    justify-content: flex-end;
    align-items: center;
    flex-direction: row;

    padding: 2px 0px 2px 3px;
    border-radius: 100px;

    background-color: ${({ theme }) => theme.colors.tertiary};
`;

export const TitleValue = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    text-align: center;

    color: ${({ theme }) => theme.colors.black};
`;

export const TitleInfoTotal = styled(TitleInfo)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const TitleValueTotal = styled(TitleValue)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;
