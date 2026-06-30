import { Text } from "react-native";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: #f4f8fb;
`;

export const ScreenHeader = styled.View`
    flex-direction: row;
    align-items: center;
    gap: 12px;
    padding: 16px;
    background-color: #fff;
    border-bottom-width: 1px;
    border-bottom-color: #e8eef4;
`;

export const HeaderTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: 800;
    color: #36536e;
`;

export const HeaderSub = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #8fa3b2;
    margin-top: 2px;
`;

export const ConvItem = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    padding: 12px 16px;
    background-color: ${({ unread }) => (unread ? "#fff8f5" : "#fff")};
    border-bottom-width: 1px;
    border-bottom-color: #f0f5fb;
`;

export const Avatar = styled.View`
    width: 46px;
    height: 46px;
    border-radius: 23px;
    background-color: #f55b1f;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
`;

export const AvatarText = styled(Text)`
    color: #fff;
    font-weight: 800;
    font-size: ${({ theme }) => theme.size.fontSize(17)};
`;

export const ConvInfo = styled.View`
    flex: 1;
`;

export const ConvName = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: 700;
    color: #36536e;
`;

export const ConvPub = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    color: #8fa3b2;
    margin-top: 1px;
`;

export const ConvLastMsg = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: ${({ unread }) => (unread ? "#36536e" : "#5f7b94")};
    font-weight: ${({ unread }) => (unread ? "600" : "400")};
    margin-top: 3px;
`;

export const ConvRight = styled.View`
    align-items: flex-end;
`;

export const ConvTime = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(10)};
    color: #8fa3b2;
`;

export const UnreadBadge = styled.View`
    background-color: #f55b1f;
    border-radius: 9px;
    width: 18px;
    height: 18px;
    align-items: center;
    justify-content: center;
    margin-top: 4px;
`;

export const UnreadBadgeText = styled(Text)`
    color: #fff;
    font-size: ${({ theme }) => theme.size.fontSize(10)};
    font-weight: 800;
`;

export const EmptyWrap = styled.View`
    flex: 1;
    align-items: center;
    justify-content: center;
    padding: 32px;
`;

export const EmptyText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: #8fa3b2;
    text-align: center;
    margin-top: 12px;
`;
