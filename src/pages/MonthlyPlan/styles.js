import styled from "styled-components/native";
import { Text } from "react-native-paper";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.background};
`;

export const BackButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    align-self: flex-start;
    padding: 12px 16px;
    gap: 6px;
`;

export const BackButtonText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: bold;
`;

export const ScrollContent = styled.ScrollView.attrs(() => ({
    contentContainerStyle: {
        flexGrow: 1,
        alignItems: "center",
        paddingBottom: 32,
    },
}))``;

export const PlanCard = styled.View`
    width: 90%;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(4)};
    padding: 24px;
    border-radius: 12px;
    background-color: ${({ theme }) => theme.colors.white};
    elevation: 4;
`;

export const PlanBadge = styled.View`
    align-self: center;
    background-color: ${({ theme }) => theme.colors.secondary};
    border-radius: 20px;
    padding: 4px 16px;
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const PlanBadgeText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    color: ${({ theme }) => theme.colors.primary};
    font-weight: bold;
`;

export const PlanTitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(26)};
    font-weight: bold;
    text-align: center;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(0.5)};
`;

export const PlanPrice = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(40)};
    font-weight: bold;
    text-align: center;
    color: ${({ theme }) => theme.colors.black};
`;

export const PlanPriceLabel = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    text-align: center;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const Divider = styled.View`
    width: 100%;
    height: 1px;
    background-color: ${({ theme }) => theme.colors.border};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const BenefitsTitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1.5)};
    text-transform: uppercase;
    letter-spacing: 1px;
`;

export const BenefitRow = styled.View`
    flex-direction: row;
    align-items: flex-start;
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1.5)};
`;

export const BenefitIconWrapper = styled.View`
    margin-right: 12px;
    margin-top: 2px;
`;

export const BenefitText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    color: ${({ theme }) => theme.colors.black};
    flex: 1;
    line-height: 24px;
`;

export const SubscribeButton = styled.TouchableOpacity`
    width: 90%;
    height: ${({ theme }) => theme.size.componentSize(55)};
    margin-top: ${({ theme }) => theme.size.dimentionsSize(4)};
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    background-color: ${({ theme }) => theme.colors.primary};
    elevation: 4;
`;

export const ButtonText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.white};
`;

export const DisclaimerText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: ${({ theme }) => theme.colors.text};
    text-align: center;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    width: 80%;
`;
