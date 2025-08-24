import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;

    justify-content: flex-start;
    align-items: center;
`;

export const HeaderCard = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(150)};

    border-bottom-left-radius: ${({ theme }) => theme.size.componentSize(30)};
    border-bottom-right-radius: ${({ theme }) => theme.size.componentSize(30)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};

    background-color: ${({ theme }) => theme.colors.quaternary};

    elevation: 3;
`;

export const HeaderContentTitle = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    padding-left: 10px;
    padding-top: 5px;
`;

export const HeaderTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    margin-left: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const ContentMoney = styled.View`
    width: 100%;

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const MoneyTextContent = styled.View`
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: row;
`;

export const MoneyCurrent = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    padding-top: 5px;
    padding-left: 5px;
`;

export const MoneyText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(45)};
    font-weight: bold;
`;

export const MoneyInfo = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    text-align: center;
`;

export const ContentIndicators = styled.View`
    justify-content: center;
    align-items: center;
    flex-direction: row;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const Indicator = styled.View`
    width: ${({ active, theme }) =>
        active ? theme.size.componentSize(11) : theme.size.componentSize(8)};
    height: ${({ active, theme }) =>
        active ? theme.size.componentSize(11) : theme.size.componentSize(8)};

    margin-right: ${({ theme }) => theme.size.dimentionsSize(0.5)};
    border-radius: ${({ theme }) => theme.size.componentSize(8)};

    background-color: ${({ active, theme }) =>
        active ? theme.colors.primary : theme.colors.text};
`;

export const ContentCard = styled.View`
    width: 96%;
    height: ${({ theme }) => theme.size.componentSize(150)};

    border-radius: 4px;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};
    background-color: ${({ theme }) => theme.colors.quaternary};

    elevation: 3;
`;

export const ContentCardInvitation = styled(ContentCard)`
    justify-content: center;
    align-items: center;
`;
export const ContentHeaderInvitation = styled.View`
    width: 100%;

    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    padding-left: 10px;
`;

export const HeaderInvitation = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    margin-left: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const ContentinvitationInfo = styled.View`
    width: 100%;

    justify-content: space-evenly;
    align-items: center;
    flex-direction: row;
`;

export const InvitationsContent = styled.View`
    width: 20%;
    height: 100%;

    justify-content: center;
    align-items: center;
`;

export const InvitationsValue = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(30)};
    font-weight: bold;
`;

export const InvitationInfo = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;
    text-align: center;
`;

export const ButtonSendInvitation = styled.TouchableOpacity`
    width: 85%;
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};

    elevation: 3;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
