import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.background};
`;

export const ChartContainer = styled.View`
    padding: 16px;
    background-color: #fff;
    margin: 16px;
    border-radius: 8px;
`;

export const ChartTitle = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: #1e2d3d;
    margin-bottom: 16px;
`;

export const Card = styled.View`
    background-color: #fff;
    margin: 8px 16px;
    padding: 16px;
    border-radius: 8px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

export const UserInfo = styled.View`
    flex: 1;
`;

export const UserName = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: #1e2d3d;
    margin-bottom: 4px;
`;

export const UserEmail = styled.Text`
    font-size: 14px;
    color: #64748b;
    margin-bottom: 4px;
`;

export const PaymentValue = styled.Text`
    font-size: 16px;
    font-weight: bold;
    color: #0ea5e9;
`;

export const WhatsAppButton = styled.TouchableOpacity`
    background-color: #25D366;
    padding: 12px;
    border-radius: 50px;
    justify-content: center;
    align-items: center;
`;
