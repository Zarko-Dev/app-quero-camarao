import { Text } from "react-native";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    justify-content: space-between;
    align-items: center;

    padding: 10px;
`;

export const ContentDrawerPrizeLive = styled.View`
    width: 95%;
    justify-content: flex-start;
    align-items: center;
`;

export const HeaderDrawerPrizeLive = styled.View`
    width: 100%;

    justify-content: ${({ center }) => (center ? "center" : "space-between")};
    align-items: center;
    flex-direction: row;
`;

export const Title = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ theme }) => theme.colors.primary};
`;

export const ReloadButton = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(30)};
    height: ${({ theme }) => theme.size.componentSize(30)};

    justify-content: center;
    align-items: center;
    border-radius: 15px;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const TitleCode = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ theme }) => theme.colors.primary};
    padding: 10px 30px;
    border: 1px solid ${({ theme }) => theme.colors.primary};
    border-radius: 15px;
`;

export const ButtonStartDrawerPrizeAction = styled.TouchableOpacity`
    width: 95%;
    height: ${({ theme }) => theme.size.componentSize(30)};

    justify-content: center;
    align-items: center;
    flex-direction: row;
    gap: 10px;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.primary};
    opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};

    elevation: 3;
`;

export const TextButtonStartDrawerStartAction = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const ContentParticipants = styled.View`
    width: 95%;
    justify-content: center;
    align-items: center;

    background-color: ${({ theme }) => theme.colors.secondary};

    padding: 20px;
    border-radius: 10px;
`;

export const TitleQuantityParticipants = styled(Title)``;

export const QuantityParticipants = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(30)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.primary};
`;

export const CardSelection = styled.View`
    width: 95%;
    justify-content: center;
    align-items: center;

    background-color: ${({ theme }) => theme.colors.secondary};
`;

export const ContentActionCountButtons = styled.View`
    flex-direction: row;
    gap: 10px;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(3)};
`;

export const ButtonViewParticipants = styled.TouchableOpacity`
    width: 95%;
    height: ${({ theme }) => theme.size.componentSize(35)};
    justify-content: center;
    align-items: center;
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: 4px;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};
`;

export const ContentActionDrawerPrizeAction = styled.View`
    width: 100%;
    justify-content: center;
    align-items: center;
`;

export const ButtonEndDrawerPrizeAction = styled(ButtonStartDrawerPrizeAction)`
    height: ${({ theme }) => theme.size.componentSize(40)};
    background-color: ${({ theme }) => theme.colors.black};
`;

export const ButtonInitDrawerPrizeAction = styled(ButtonStartDrawerPrizeAction)`
    height: ${({ theme }) => theme.size.componentSize(40)};
    background-color: ${({ theme }) => theme.colors.primary};
`;
