import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    padding: 10px;
`;

export const ContainerCardDrawPrize = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(80)};

    justify-content: center;
    align-items: flex-start;

    border-radius: ${({ theme }) => theme.size.componentSize(20)};
    padding: 10px;
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};

    background-color: ${({ theme }) => theme.colors.tertiary};

    elevation: 3;
`;

export const HeaderCard = styled.View`
    width: 100%;

    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

export const CardTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const BadgerDawerPrizeType = styled.View`
    justify-content: space-between;
    align-items: center;

    padding: 5px;
    border-radius: 8px;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const TitleBadge = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const CardSubtitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};

    color: ${({ theme }) => theme.colors.text};
`;
