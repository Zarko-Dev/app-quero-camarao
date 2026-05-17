import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.ScrollView`
    flex: 1;
    background-color: #ffffff;
`;

export const Content = styled.View`
    justify-content: center;
    align-items: center;

    padding: 10px;
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
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(48)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};

    border-radius: 8px;

    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 3;
`;

export const TextButtomAddShrimpCard = styled(Text)`
    font-weight: bold;
    color: ${({ theme }) => theme.colors.white};
`;

export const ContentResume = styled.View`
    padding: 8px 10px 10px 10px;
    background-color: #ffffff;
`;

export const ButtonSendPayment = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;

    border-radius: 8px;

    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 3;
`;

export const TextButtonSendPayment = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
