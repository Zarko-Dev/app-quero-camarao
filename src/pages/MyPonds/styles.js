import styled from "styled-components/native";
import { Text } from "react-native-paper";

export const Container = styled.ScrollView`
    flex: 1;
    padding: 12px;
    background-color: ${({ theme }) => theme.colors.background};
`;

export const Grid = styled.View`
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
`;

export const PondCard = styled.TouchableOpacity`
    width: 48%;
    min-height: 130px;
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: 12px;
    margin-bottom: 12px;
    padding: 12px;
    elevation: 3;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.1;
    shadow-radius: 4px;
`;

export const EmptyCard = styled.TouchableOpacity`
    width: 48%;
    min-height: 130px;
    border-radius: 12px;
    margin-bottom: 12px;
    justify-content: center;
    align-items: center;
    border-width: 2px;
    border-color: ${({ theme }) => theme.colors.primary};
    border-style: dashed;
    background-color: ${({ theme }) => theme.colors.secondary};
`;

export const PondCardHeader = styled.View`
    flex-direction: row;
    justify-content: flex-end;
    margin-bottom: 6px;
`;

export const DeleteButton = styled.TouchableOpacity`
    padding: 4px;
`;

export const PondName = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: 4px;
`;

export const PondWeekBadge = styled.View`
    margin-top: auto;
    align-self: flex-start;
    background-color: ${({ theme }) => theme.colors.secondary};
    border-radius: 20px;
    padding: 2px 10px;
`;

export const PondWeekBadgeText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: bold;
`;

export const EmptyText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: bold;
    margin-top: 8px;
`;

export const LoadingContainer = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
    background-color: ${({ theme }) => theme.colors.background};
`;
