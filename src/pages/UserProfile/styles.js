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

export const Content = styled.View`
    align-items: center;
    padding: 32px 24px;
`;

export const BigAvatar = styled.View`
    width: 88px;
    height: 88px;
    border-radius: 44px;
    background-color: #f55b1f;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
`;

export const BigAvatarText = styled(Text)`
    color: #fff;
    font-weight: 800;
    font-size: ${({ theme }) => theme.size.fontSize(32)};
`;

export const ProfileName = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    font-weight: 800;
    color: #1e3a4f;
    text-align: center;
`;

export const RatingText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #b0a898;
    margin-top: 6px;
`;

export const InfoRow = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    color: #5f7b94;
    margin-top: 12px;
    text-align: center;
`;

export const ErrorText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: #8fa3b2;
    text-align: center;
    margin-top: 40px;
`;
