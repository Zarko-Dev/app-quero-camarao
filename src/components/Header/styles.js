import { Badge } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(55)};

    align-items: center;
    justify-content: space-between;
    flex-direction: row;

    padding: 0 ${({ theme }) => theme.size.dimentionsSize(2)};

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const MenuButton = styled.TouchableOpacity``;

export const RightSpacer = styled.View`
    width: 52px;
`;

export const LogoImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(80)};
    height: ${({ theme }) => theme.size.componentSize(40)};

    margin-right: ${({ theme }) => theme.size.dimentionsSize(-1)};
`;

export const NotificationsButton = styled.TouchableOpacity`
    width: 13%;
    height: 100%;

    justify-content: center;
    align-items: center;

    margin-right: ${({ theme }) => theme.size.dimentionsSize(-1)};
`;

export const NotificationBadge = styled(Badge)`
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(3.5)};

    background-color: ${({ theme }) => theme.colors.green};
`;

export const ChatButton = styled.TouchableOpacity`
    width: 52px;
    height: 52px;
    border-radius: 26px;
    background-color: ${({ theme }) => theme.colors.green};
    justify-content: center;
    align-items: center;
`;
