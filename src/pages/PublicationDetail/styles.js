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

export const CenterState = styled.View`
    flex: 1;
    align-items: center;
    justify-content: center;
    padding: 32px;
`;

export const ErrorText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: #8fa3b2;
    text-align: center;
`;

export const SoldBanner = styled.View`
    margin: 16px;
    padding: 14px;
    border-radius: 12px;
    background-color: #fdecea;
    border-width: 1px;
    border-color: #f3b7b0;
`;

export const SoldBannerText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: #b3261e;
    font-weight: 700;
    text-align: center;
`;

export const OthersLabel = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: 700;
    color: #36536e;
    margin: 8px 16px;
`;
