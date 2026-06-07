import { Text } from "react-native";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: #e7f4ff;
`;

export const Content = styled.ScrollView`
    flex: 1;
    padding: 12px;
`;

export const HeaderTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: 800;
    color: #36536e;
    margin-bottom: 4px;
`;

export const HeaderSubtitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #5f7b94;
    margin-bottom: 16px;
`;

export const DrawCard = styled.View`
    background-color: #fff;
    border-radius: 12px;
    margin-bottom: 12px;
    overflow: hidden;
    elevation: 2;
    shadow-color: #000;
    shadow-opacity: 0.06;
    shadow-radius: 4px;
`;

export const DrawHeader = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background-color: #fff;
`;

export const DrawTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: 700;
    color: #36536e;
    flex: 1;
`;

export const DrawBadge = styled.View`
    background-color: #fff1e8;
    border-radius: 8px;
    padding: 2px 8px;
    margin-left: 8px;
`;

export const DrawBadgeText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    color: #f55b1f;
    font-weight: 600;
`;

export const ParticipantItem = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    padding: 11px 16px;
    border-top-width: 1px;
    border-top-color: #f0f0f0;
    background-color: ${({ selected }) => (selected ? "#fff8f5" : "#fff")};
    opacity: ${({ isWinner }) => (isWinner ? 0.45 : 1)};
`;

export const ParticipantName = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: #36536e;
    flex: 1;
`;

export const ParticipantEmail = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #8fa3b2;
`;

export const CheckBox = styled.View`
    width: 22px;
    height: 22px;
    border-radius: 6px;
    border-width: 2px;
    border-color: ${({ selected }) => (selected ? "#f55b1f" : "#c5d5e0")};
    background-color: ${({ selected }) => (selected ? "#f55b1f" : "#fff")};
    align-items: center;
    justify-content: center;
    margin-right: 12px;
`;

export const SaveButton = styled.TouchableOpacity`
    margin: 8px 16px 14px;
    background-color: #f55b1f;
    border-radius: 10px;
    padding: 12px;
    align-items: center;
    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

export const SaveButtonText = styled(Text)`
    color: #fff;
    font-weight: 700;
    font-size: ${({ theme }) => theme.size.fontSize(14)};
`;

export const EmptyText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    color: #8fa3b2;
    text-align: center;
    padding: 16px;
`;

export const LoadingWrap = styled.View`
    flex: 1;
    align-items: center;
    justify-content: center;
    padding: 40px;
`;

export const SearchWrap = styled.View`
    padding: 8px 16px 4px;
    border-bottom-width: 1px;
    border-bottom-color: #f0f0f0;
`;

export const WinnerBadge = styled.View`
    background-color: #ffe0cc;
    border-radius: 6px;
    padding: 1px 7px;
    margin-left: 8px;
`;

export const WinnerBadgeText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(10)};
    font-weight: 700;
    color: #e06020;
`;
