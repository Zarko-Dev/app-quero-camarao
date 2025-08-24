import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.ScrollView`
    flex: 1;
`;

export const Content = styled.View`
    justify-content: flex-start;
    align-items: center;

    padding: 0 5px;
`;

export const Title = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;

    text-align: justify;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(-10)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(3)};
`;

export const ButtonDelete = styled.TouchableOpacity`
    width: 85%;
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(5)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 3;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const AlertText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.red};

    text-align: justify;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
`;
