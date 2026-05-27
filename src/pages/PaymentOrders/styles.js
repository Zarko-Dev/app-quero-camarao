import styled from "styled-components/native";

export const Container = styled.View`
    flex: 1;
    background-color: #f5f5f5;
`;

export const ContentArea = styled.View`
    flex: 1;
    padding-top: 8px;
    padding-horizontal: 12px;
`;

export const EmptyContainer = styled.View`
    flex: 1;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
`;

export const EmptyText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: #888;
    margin-top: 10px;
    text-align: center;
`;

export const ScreenHeader = styled.View`
    background-color: #e85d22;
    padding: 10px 15px 15px 15px;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
`;

export const HeaderTopRow = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    margin-top: 5px;
`;

export const HeaderTitleContainer = styled.View`
    flex: 1;
    margin-left: 10px;
`;

export const HeaderTitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    font-weight: bold;
    color: #fff;
`;

export const HeaderSubtitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #fff;
    opacity: 0.9;
`;

export const ProfileIconContainer = styled.View`
    width: 38px;
    height: 38px;
    border-radius: 19px;
    background-color: #fff;
    justify-content: center;
    align-items: center;
    overflow: hidden;
`;

export const ShrimpIconHeader = styled.Image`
    width: 24px;
    height: 24px;
`;
