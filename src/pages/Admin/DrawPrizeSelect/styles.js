import { Text } from "react-native";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    justify-content: center;
    align-items: center;

    padding: 10px;
`;

export const ContentTitle = styled.SafeAreaView`
    justify-content: center;
    align-items: center;
`;

export const Title = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(25)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ theme }) => theme.colors.primary};
`;

export const ContainerSelect = styled.SafeAreaView`
    width: 100%;
    justify-content: center;
    align-items: center;

    padding: 10px;
`;

export const ButtonAction = styled.TouchableOpacity`
    width: 95%;
    height: ${({ theme }) => theme.size.componentSize(35)};

    justify-content: center;
    align-items: center;
    flex-direction: row;
    gap: 10px;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(10)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.primary};
    opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};

    elevation: 3;
`;

export const TextButtonAction = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
