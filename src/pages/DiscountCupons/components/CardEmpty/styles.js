import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    height: ${({ theme }) => theme.size.componentSize(150)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.quaternary};
`;

export const TitleEmpty = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(17)};
    font-weight: bold;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;
