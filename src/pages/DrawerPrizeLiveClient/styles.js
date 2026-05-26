import styled from "styled-components/native";

export const ContainerScreen = styled.SafeAreaView`
    width: 100%;
    flex: 1;
    justify-content: flex-start;
    align-items: center;
    background-color: #f5f5f5;
    padding: 12px;
`;

export const DrawerprizeList = styled.FlatList`
    flex: 1;
    width: 100%;
`;

export const Container = styled.View`
    width: 100%;
    flex: 1;
    justify-content: flex-start;
    align-items: center;
`;

export const CardDrawerPrize = styled.View`
    padding: 16px;
    margin: 6px 0;
    background-color: #ffffff;
    border-radius: 16px;
    border-left-width: 4px;
    border-left-color: ${({ theme }) => theme.colors.primary};
    elevation: 2;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.08;
    shadow-radius: 4px;
    width: 100%;
`;

export const HeaderCardDrawerPrize = styled.View`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    margin-bottom: 10px;
`;

export const TitleCardDrawerPrize = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(17)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.black};
    margin-bottom: 2px;
`;

export const BadgeCardDrawerPrize = styled.View`
    background-color: ${({ theme, status }) =>
        status ? theme.colors.green : theme.colors.red};
    justify-content: center;
    align-items: center;
    padding: 4px 12px;
    border-radius: 20px;
`;

export const TitleBadgeCardDrawerPrize = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.white};
    letter-spacing: 0.5px;
`;

export const BodyCardDrawerPrize = styled.View`
    justify-content: center;
    align-items: center;
    margin-top: 4px;
`;

export const ContentTitleParticipating = styled.View`
    width: 100%;
    padding: 12px 16px;
    justify-content: center;
    align-items: center;
    margin-top: 8px;
    border-radius: 10px;
    background-color: ${({ theme, notParticipant }) =>
        notParticipant ? "#fff3f3" : "#f0faf0"};
    border-width: 1px;
    border-color: ${({ theme, notParticipant }) =>
        notParticipant ? "#ffb3b3" : "#b3e6b3"};
`;

export const TitleParticipating = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: 600;
    text-align: center;
    color: ${({ theme, notParticipant }) =>
        notParticipant ? "#c0392b" : "#27ae60"};
`;

export const ButtonWinners = styled.TouchableOpacity`
    background-color: ${({ theme }) => theme.colors.primary};
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(44)};
    justify-content: center;
    align-items: center;
    margin-top: 8px;
    border-radius: 10px;
    elevation: 2;
`;

export const TitleButtonWinners = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.white};
`;

export const FooterCardDrawerPrize = styled.View`
    margin-top: 10px;
    justify-content: center;
    align-items: flex-end;
`;

export const TitleDateDrawPrize = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #999;
`;

export const ContentActionButton = styled.View`
    justify-content: center;
    align-items: center;
    margin-top: 8px;
`;

export const ButtonDeleteDrawPrizeLive = styled.TouchableOpacity`
    background-color: #fff0f0;
    border-width: 1px;
    border-color: #ffb3b3;
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(40)};
    justify-content: center;
    align-items: center;
    border-radius: 10px;
`;

export const TitleButtonDeleteDrawPrizeLive = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;
    color: #c0392b;
`;

export const ButtonParticipate = styled.TouchableOpacity`
    width: 95%;
    height: ${({ theme }) => theme.size.componentSize(50)};
    justify-content: center;
    align-items: center;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 14px;
    background-color: ${({ theme }) => theme.colors.primary};
    elevation: 3;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.15;
    shadow-radius: 4px;
`;

export const TitleButtonParticipate = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.white};
`;

export const ModalContent = styled.SafeAreaView`
    width: 100%;
    background-color: white;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    padding: 24px 20px;
    elevation: 10;
`;

export const TitleModal = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.black};
    text-align: center;
    margin-bottom: 4px;
`;

export const SubTitleModal = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    text-align: center;
    color: #888;
    margin-top: 4px;
    margin-bottom: 16px;
`;

export const ContentActionsModal = styled.View`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    gap: 10px;
    margin-top: 12px;
`;

export const ButtonModalConfirm = styled.TouchableOpacity`
    background-color: ${({ theme }) => theme.colors.primary};
    flex: 1;
    height: ${({ theme }) => theme.size.componentSize(44)};
    justify-content: center;
    align-items: center;
    border-radius: 10px;
    elevation: 2;
`;

export const TitleButtonModalConfirm = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.white};
`;

export const ButtonModalCancel = styled.TouchableOpacity`
    background-color: #f5f5f5;
    border-width: 1px;
    border-color: #ddd;
    width: 28%;
    height: ${({ theme }) => theme.size.componentSize(44)};
    justify-content: center;
    align-items: center;
    border-radius: 10px;
`;

export const TitleButtonModalCancel = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;
    color: #555;
`;
