import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    justify-content: start;
    align-items: center;
`;

export const ContentEmptyList = styled.View`
    width: 98%;
    height: ${({ theme }) => theme.size.componentSize(200)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.quaternary};
`;

export const TitleEmptyList = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;
