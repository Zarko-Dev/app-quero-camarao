import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View``;

export const Banner = styled.ImageBackground`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(100)};

    justify-content: center;
    align-items: center;
    flex-direction: row;
`;

export const DefaultIndicator = styled.ImageBackground`
    width: 50%;
    height: 100px;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-left: ${({ theme }) => theme.size.dimentionsSize(13)};
`;

export const TitleGrammage = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(17)};
    font-weight: 700;

    margin-left: 19%;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};

    color: ${({ theme }) => theme.colors.primary};
`;

export const TitleValue = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: 700;

    margin-left: 6.5%;
    margin-top: 7%;

    color: ${({ theme }) => theme.colors.primary};
`;

export const SubIndicator = styled.ImageBackground`
    width: 45%;
    height: 90px;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    margin-left: ${({ left, theme }) =>
        left ? theme.size.dimentionsSize(15) : theme.size.dimentionsSize(-11)};
    margin-right: ${({ right, theme }) =>
        right ? "0px" : theme.size.dimentionsSize(-24)};
`;

export const TitleGrammageIndicator = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(17)};
    font-weight: 700;

    margin-left: 15%;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.5)};

    color: ${({ theme }) => theme.colors.text};
`;

export const TitleValueIndicator = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: 700;

    margin-left: 4%;
    margin-top: 5%;

    color: ${({ theme }) => theme.colors.text};
`;

export const SugestiveTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(10)};
    font-weight: 700;

    position: absolute;

    bottom: 2px;
    right: 0;

    color: ${({ theme }) => theme.colors.primary};

    opacity: 0.8;
`;
