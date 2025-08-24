import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    justify-content: flex-start;
    align-items: center;
`;

export const ContentSearchFilter = styled.View`
    width: 100%;

    justify-content: center;
    align-items: flex-start;
    flex-direction: row;
    gap: 10px;
`;

export const ButtonShrimpSales = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(100)};
    height: ${({ theme }) => theme.size.componentSize(35)};

    justify-content: center;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.7)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 3;
`;

export const ButtonShrimpSalesText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const ContentInitialBanner = styled.View`
    width: 100%;
`;

export const InitialBannerStyle = styled.Image`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(76)};
`;

export const PublicShrimpButton = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;
    flex-direction: row;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const ShrimpIcon = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(35)};
    height: ${({ theme }) => theme.size.componentSize(35)};
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
