import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.TouchableOpacity`
    width: 100%;

    height: ${({ theme }) => theme.size.componentSize(120)};

    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: row;

    border-radius: 4px;
    padding: 15px;

    background-color: ${({ theme }) => theme.colors.quaternary};
`;

export const ContentAddressIcon = styled.View`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.4)};

    padding-right: 10px;
`;

export const ContentInfo = styled.View`
    width: 80%;
`;

export const TitleAddress = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const TextInfoAddress = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};

    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.2)};

    color: ${({ theme }) => theme.colors.black};
`;

export const ContentButtonAddress = styled.View`
    height: 100%;

    margin-left: 8%;

    justify-content: center;
`;

export const ContentEmptyAddress = styled(Container)`
    justify-content: center;
    align-items: center;

    padding: 0;
`;

export const ButtonAddAddress = styled.View`
    width: 70%;
    height: ${({ theme }) => theme.size.componentSize(35)};

    justify-content: center;
    align-items: center;
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};
`;

export const TextButtonAddAddress = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(17)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
