import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    padding: 8px;
    background-color: #f6f6f6;
`;

export const ContentSearch = styled.View`
    justify-content: center;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1.2)};
`;

export const ButtonRegister = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 12px;

    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 3;
`;

export const TitleButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
