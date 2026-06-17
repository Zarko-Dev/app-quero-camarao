import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: #f0f4f8;
    padding: 16px;
    gap: 14px;
`;

export const HeaderCard = styled.View`
    width: 100%;
    border-radius: 16px;
    background-color: #fff;
    elevation: 3;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.08;
    shadow-radius: 6px;
    overflow: hidden;
`;

export const HeaderContentTitle = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    padding: 14px 16px 10px;
    gap: 8px;
    border-bottom-width: 1px;
    border-bottom-color: #f0f4f8;
`;

export const HeaderTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;
    color: #36536e;
`;

export const ContentMoney = styled.View`
    width: 100%;
    justify-content: center;
    align-items: center;
    padding: 18px 0 8px;
`;

export const MoneyTextContent = styled.View`
    justify-content: flex-start;
    align-items: flex-end;
    flex-direction: row;
`;

export const MoneyCurrent = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;
    color: #36536e;
    padding-bottom: 6px;
    margin-right: 4px;
`;

export const MoneyText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(42)};
    font-weight: bold;
    color: #1c2b3a;
`;

export const MoneyInfo = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #8fa3b2;
    text-align: center;
    margin-bottom: 4px;
`;

export const ContentIndicators = styled.View`
    justify-content: center;
    align-items: center;
    flex-direction: row;
    padding-bottom: 14px;
    gap: 5px;
`;

export const Indicator = styled.View`
    width: ${({ active }) => (active ? "20px" : "8px")};
    height: 8px;
    border-radius: 4px;
    background-color: ${({ active }) => (active ? "#36536e" : "#c8d8e8")};
`;

export const ContentCard = styled.View`
    width: 100%;
    border-radius: 16px;
    background-color: #fff;
    elevation: 3;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.08;
    shadow-radius: 6px;
    overflow: hidden;
`;

export const ContentCardInvitation = styled(ContentCard)``;

export const ContentHeaderInvitation = styled.View`
    width: 100%;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    padding: 14px 16px 10px;
    gap: 8px;
    border-bottom-width: 1px;
    border-bottom-color: #f0f4f8;
`;

export const HeaderInvitation = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;
    color: #36536e;
`;

export const ContentinvitationInfo = styled.View`
    width: 100%;
    justify-content: space-evenly;
    align-items: center;
    flex-direction: row;
    padding: 20px 0;
`;

export const InvitationsContent = styled.View`
    flex: 1;
    justify-content: center;
    align-items: center;
`;

export const InvitationsDivider = styled.View`
    width: 1px;
    height: 50px;
    background-color: #e8eef4;
`;

export const InvitationsValue = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(32)};
    font-weight: bold;
    color: #1c2b3a;
`;

export const InvitationInfo = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    color: #8fa3b2;
    text-align: center;
    margin-top: 2px;
`;

export const ButtonSendInvitation = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(52)};
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    background-color: #36536e;
    elevation: 2;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.12;
    shadow-radius: 4px;
    flex-direction: row;
    gap: 8px;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;
    color: #fff;
`;
