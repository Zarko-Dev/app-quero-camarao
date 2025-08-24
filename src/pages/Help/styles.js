import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;

    justify-content: flex-start;
    align-items: center;
`;

export const Title = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    text-align: center;

    color: ${({ theme }) => theme.colors.black};
`;

export const WhatsappButton = styled.TouchableOpacity`
    width: 75%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(4)};
    border-radius: 4px;

    background-color: #25d366;

    elevation: 3;
`;

export const TextWhatsapp = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    margin-left: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ theme }) => theme.colors.white};
`;
