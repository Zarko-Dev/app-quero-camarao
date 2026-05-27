import { Text } from "react-native";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: ${({ theme }) => theme.colors.background};
`;

export const ContentDrawerPrizeLive = styled.View`
    width: 100%;
    justify-content: flex-start;
    align-items: center;

    background-color: ${({ theme }) => theme.colors.white};
    border-radius: 18px;
    padding: 20px 16px;
    margin-bottom: 16px;

    elevation: 2;
    shadow-color: #000;
    shadow-opacity: 0.06;
    shadow-radius: 8px;
    shadow-offset: 0px 2px;
`;

export const HeaderDrawerPrizeLive = styled.View`
    width: 100%;

    justify-content: ${({ center }) => (center ? "center" : "space-between")};
    align-items: center;
    flex-direction: row;
    margin-bottom: 8px;
`;

export const Title = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    font-weight: 700;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ theme }) => theme.colors.primary};
    letter-spacing: 0.2px;
`;

export const ReloadButton = styled.TouchableOpacity`
    width: 38px;
    height: 38px;

    justify-content: center;
    align-items: center;
    border-radius: 19px;

    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 2;
    shadow-color: #000;
    shadow-opacity: 0.12;
    shadow-radius: 4px;
    shadow-offset: 0px 2px;
`;

export const TitleCode = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: 600;

    margin-top: 6px;
    margin-bottom: 6px;

    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.secondary};
    padding: 8px 18px;
    border-radius: 999px;
    overflow: hidden;
`;

export const ButtonStartDrawerPrizeAction = styled.TouchableOpacity`
    width: 100%;
    height: 52px;

    justify-content: center;
    align-items: center;
    flex-direction: row;
    gap: 10px;

    margin-top: 14px;
    border-radius: 14px;

    background-color: ${({ theme }) => theme.colors.primary};
    opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

    elevation: 3;
    shadow-color: #000;
    shadow-opacity: 0.15;
    shadow-radius: 6px;
    shadow-offset: 0px 3px;
`;

export const TextButtonStartDrawerStartAction = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: 700;

    color: ${({ theme }) => theme.colors.white};
    letter-spacing: 0.3px;
`;

export const ContentParticipants = styled.View`
    width: 100%;
    justify-content: center;
    align-items: center;

    background-color: ${({ theme }) => theme.colors.white};
    border: 1px solid ${({ theme }) => theme.colors.secondary};

    padding: 18px;
    border-radius: 18px;
    margin-bottom: 14px;

    elevation: 1;
    shadow-color: #000;
    shadow-opacity: 0.05;
    shadow-radius: 6px;
    shadow-offset: 0px 1px;
`;

export const TitleQuantityParticipants = styled(Title)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    margin-top: 0;
    margin-bottom: 4px;
    color: ${({ theme }) => theme.colors.text};
`;

export const QuantityParticipants = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(32)};
    font-weight: 800;

    color: ${({ theme }) => theme.colors.primary};
    margin: 4px 0 8px 0;
`;

export const CardSelection = styled.View`
    width: 100%;
    justify-content: center;
    align-items: center;

    background-color: ${({ theme }) => theme.colors.white};
    border: 1px solid ${({ theme }) => theme.colors.secondary};
    padding: 18px;
    border-radius: 18px;
    margin-bottom: 14px;
`;

export const ContentActionCountButtons = styled.View`
    flex-direction: row;
    gap: 16px;

    margin-bottom: 6px;
    margin-top: 4px;
`;

export const ButtonViewParticipants = styled.TouchableOpacity`
    width: 100%;
    height: 48px;
    justify-content: center;
    align-items: center;
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: 12px;
    margin-top: 12px;
    opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

    elevation: 2;
    shadow-color: #000;
    shadow-opacity: 0.1;
    shadow-radius: 4px;
    shadow-offset: 0px 2px;
`;

export const ContentActionDrawerPrizeAction = styled.View`
    width: 100%;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 4px;
`;

export const ButtonEndDrawerPrizeAction = styled(ButtonStartDrawerPrizeAction)`
    height: 54px;
    background-color: ${({ theme }) => theme.colors.black};
    margin-top: 6px;
`;

export const ButtonInitDrawerPrizeAction = styled(ButtonStartDrawerPrizeAction)`
    height: 54px;
    background-color: ${({ theme }) => theme.colors.primary};
    margin-top: 6px;
`;
