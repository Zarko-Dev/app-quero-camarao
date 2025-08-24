import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

export const ContentInformation = styled.View`
    width: 55%;
    height: ${({ theme }) => theme.size.componentSize(30)};

    justify-content: space-evenly;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: ${({ theme }) => theme.size.componentSize(30)};
    background-color: ${({ color }) => color};

    elevation: 3;
`;

export const TextInformation = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    color: ${({ textColor }) => textColor};
`;
