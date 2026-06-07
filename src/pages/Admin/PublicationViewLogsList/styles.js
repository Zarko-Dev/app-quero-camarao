import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.background};
    padding: 14px;
`;

export const Content = styled.View`
    width: 100%;
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 12px;
    elevation: 2;
`;

export const ContentInfo = styled.View`
    flex-direction: row;
    align-items: center;
`;

export const ImageItem = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(52)};
    height: ${({ theme }) => theme.size.componentSize(52)};
    border-radius: ${({ theme }) => theme.size.componentSize(52)};
    background-color: ${({ theme }) => theme.colors.secondary};
`;

export const ContentTextInfo = styled.View`
    flex: 1;
    margin-left: 12px;
`;

export const InfoTitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text};
`;

export const InfoSubtitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #8fa3b2;
    margin-top: 1px;
`;

export const ViewsBadge = styled.View`
    background-color: ${({ theme }) => theme.colors.secondary};
    border-radius: 20px;
    padding: 4px 10px;
    align-items: center;
    justify-content: center;
`;

export const ViewsBadgeText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
`;

export const ViewsBadgeLabel = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(9)};
    color: ${({ theme }) => theme.colors.primary};
    text-align: center;
`;

export const Divider = styled.View`
    height: 1px;
    background-color: #f0f0f0;
    margin: 10px 0;
`;

export const ContentPonds = styled.View`
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
`;

export const TagPonds = styled.View`
    padding: 3px 10px;
    border-radius: 20px;
    background-color: ${({ theme }) => theme.colors.secondary};
`;

export const TitleTagPond = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
`;

export const ContentActionButtons = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin-top: 10px;
    gap: 8px;
`;

export const ActionButton = styled.TouchableOpacity`
    flex: 1;
    height: ${({ theme }) => theme.size.componentSize(42)};
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background-color: ${({ color }) => color};
`;

export const TitleActionButton = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;
    color: #fff;
`;
