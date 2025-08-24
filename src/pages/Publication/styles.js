import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.ScrollView`
    flex: 1;
`;

export const Content = styled.View`
    justify-content: center;
    align-items: center;

    padding: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const ContentImage = styled.View`
    width: ${({ theme }) => theme.size.componentSize(105)};
    height: ${({ theme }) => theme.size.componentSize(105)};

    justify-content: center;
    align-items: center;

    border: 1.5px ${({ theme }) => theme.colors.primary} solid;

    border-radius: ${({ theme }) => theme.size.componentSize(105)};
`;

export const ImageShrimp = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(100)};
    height: ${({ theme }) => theme.size.componentSize(100)};

    border-radius: ${({ theme }) => theme.size.componentSize(100)};
`;

export const ButtomAddShrimpCard = styled.TouchableOpacity`
    width: 90%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 3;
`;

export const TextButtomAddShrimpCard = styled(Text)`
    font-weight: bold;
    color: ${({ theme }) => theme.colors.white};
`;

export const ContentResume = styled.View``;

export const ButtonSendPayment = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    margin: 5px;
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};

    elevation: 3;
`;

export const TextButtonSendPayment = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
