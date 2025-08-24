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

export const ContentImage = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(174)};

    justify-content: center;
    align-items: center;
    border-radius: 4px;
`;

export const ContentActionsButton = styled.View`
    width: 100%;

    justify-content: space-evenly;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const ActionButton = styled.TouchableOpacity`
    width: 45%;
    height: ${({ theme }) => theme.size.componentSize(40)};

    justify-content: center;
    align-items: center;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ color }) => color};

    elevation: 3;
`;

export const ActionButtonFull = styled(ActionButton)`
    width: 93%;

    background-color: ${({ theme }) => theme.colors.green};
`;

export const TextActionButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
