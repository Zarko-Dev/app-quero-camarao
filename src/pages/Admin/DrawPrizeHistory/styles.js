import { Text } from "react-native";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    padding: 12px;
    background-color: #e7f4ff;
`;

export const HeaderBack = styled.View`
    width: 100%;
    flex-direction: row;
    align-items: center;
    margin-bottom: 16px;
`;

export const BackButton = styled.TouchableOpacity`
    width: 36px;
    height: 36px;
    border-radius: 18px;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    background-color: rgba(31, 31, 31, 0.08);
`;

export const HeaderTitleWrap = styled.View`
    flex: 1;
`;

export const HeaderTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: 800;
    color: #36536e;
`;

export const HeaderSubtitle = styled(Text)`
    margin-top: 2px;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #5f7b94;
`;

export const ActionBar = styled.View`
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
`;

export const ActionButton = styled.TouchableOpacity`
    flex: 1;
    height: ${({ theme }) => theme.size.componentSize(42)};
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    background-color: ${({ danger, theme }) =>
        danger ? "#bf756c" : theme.colors.primary};
    opacity: ${({ disabled }) => (disabled ? 0.45 : 1)};
`;

export const ActionButtonText = styled(Text)`
    margin-left: 6px;
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: 800;
    color: #ffffff;
`;

export const ContainerCardDrawPrize = styled.TouchableOpacity`
    width: 100%;
    min-height: ${({ theme }) => theme.size.componentSize(82)};
    flex-direction: row;
    align-items: center;
    padding: 12px;
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1.2)};
    border-radius: 12px;
    border-width: 1px;
    border-color: ${({ selected }) => (selected ? "#36536e" : "#cfe3f4")};
    background-color: ${({ selected }) => (selected ? "#cfeeff" : "#dff0ff")};
    elevation: 1;
`;

export const CardSelectionBox = styled.View`
    width: ${({ theme }) => theme.size.componentSize(34)};
    height: ${({ theme }) => theme.size.componentSize(34)};
    justify-content: center;
    align-items: center;
    margin-right: 8px;
`;

export const CardIconBox = styled.View`
    width: ${({ theme }) => theme.size.componentSize(48)};
    height: ${({ theme }) => theme.size.componentSize(48)};
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    margin-right: 12px;
    background-color: #edf7ff;
`;

export const CardContent = styled.View`
    flex: 1;
`;

export const HeaderCard = styled.View`
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

export const CardTitle = styled(Text)`
    flex: 1;
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: 800;
    color: #36536e;
`;

export const BadgerDawerPrizeType = styled.View`
    align-items: center;
    justify-content: center;
    padding: 5px 9px;
    border-radius: 7px;
    background-color: ${({ live }) => (live ? "#65b89a" : "#bf756c")};
`;

export const TitleBadge = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    font-weight: 800;
    color: #ffffff;
`;

export const CardSubtitle = styled(Text)`
    margin-top: 3px;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #49677f;
`;

export const DateRow = styled.View`
    flex-direction: row;
    align-items: center;
    margin-top: 3px;
`;

export const DateText = styled(Text)`
    margin-left: 5px;
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    color: #49677f;
`;

export const ChevronBox = styled.View`
    width: ${({ theme }) => theme.size.componentSize(24)};
    align-items: flex-end;
    justify-content: center;
    margin-left: 8px;
`;

export const Footer = styled.View`
    padding-top: 6px;
`;

export const NewDrawButton = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(48)};
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-radius: 9px;
    background-color: #d0786e;
    elevation: 2;
`;

export const NewDrawButtonText = styled(Text)`
    margin-left: 8px;
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: 800;
    color: #ffffff;
`;
