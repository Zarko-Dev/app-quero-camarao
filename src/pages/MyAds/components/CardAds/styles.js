import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const ContentCardAds = styled.View`
    /* width: 95%; */

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.quaternary};

    elevation: 3;
`;

export const ContentImage = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(174)};

    justify-content: center;
    align-items: center;
    border-radius: 4px;
`;

export const ContentStatus = styled.View`
    width: 100%;

    justify-content: space-evenly;
    align-items: center;
    flex-direction: row;
`;

export const ContentAlert = styled.View`
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const AlertText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.subtext};
`;

export const TagStatus = styled.View`
    width: 45%;
    height: ${({ theme }) => theme.size.componentSize(40)};

    justify-content: center;
    align-items: center;

    border-radius: ${({ theme }) => theme.size.componentSize(40)};
    padding: 0 15px;
    margin: 10px 0;

    background-color: ${({ color }) => color};
`;

export const TextTagStatus = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const ContentTagTimeExpiresText = styled.View`
    justify-content: center;
    align-items: center;
`;

export const TextDecreaseTime = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const ContentActionsButton = styled.View`
    width: 100%;

    justify-content: space-evenly;
    align-items: center;
    flex-direction: row;
`;

export const ActionButton = styled.TouchableOpacity`
    width: 45%;
    height: ${({ theme }) => theme.size.componentSize(40)};

    justify-content: center;
    align-items: center;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ black, theme }) =>
        black ? theme.colors.black : theme.colors.primary};
    opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

    elevation: 3;
`;

export const TextActionButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
