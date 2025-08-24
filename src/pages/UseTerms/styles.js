import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.ScrollView`
    flex: 1;

    padding: 0 10px;
`;

export const Content = styled.View`
    justify-content: flex-start;
    align-items: center;

    padding-bottom: 10px;
`;

export const LogoImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(118)};
    height: ${({ theme }) => theme.size.componentSize(60)};

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const Paragraph = styled(Text)`
    width: 100%;

    text-align: justify;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ theme }) => theme.colors.black};
`;

export const Title = styled(Text)`
    width: 100%;

    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(4)};

    color: ${({ theme }) => theme.colors.primary};
`;

export const Divider = styled.View`
    width: 100%;
    height: 1px;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    background-color: ${({ theme }) => theme.colors.black};
`;

export const ContentItem = styled.View`
    width: 100%;

    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const DotItem = styled.View`
    width: ${({ theme }) => theme.size.componentSize(8)};
    height: ${({ theme }) => theme.size.componentSize(8)};

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.5)};
    margin-right: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: ${({ theme }) => theme.size.componentSize(8)};

    background-color: ${({ theme }) => theme.colors.black};
`;

export const TextItem = styled(Text)`
    width: 94%;

    text-align: justify;
`;

export const TextObservation = styled(Text)`
    font-weight: bold;

    color: ${({ theme }) => theme.colors.primary};
`;
