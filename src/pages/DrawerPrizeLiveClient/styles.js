import styled from "styled-components/native";

export const ContainerScreen = styled.SafeAreaView`
    width: 100%;

    flex: 1;
    justify-content: flex-start;
    align-items: center;

    padding: 10px;
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
    padding: 10px;
    margin: 10px 0;

    background-color: ${({ theme }) => theme.colors.secondary};
`;

export const HeaderCardDrawerPrize = styled.View`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
`;

export const TitleCardDrawerPrize = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const BadgeCardDrawerPrize = styled.View`
    width: 25%;
    height: ${({ theme }) => theme.size.componentSize(30)};

    background-color: ${({ theme, status }) =>
        status ? theme.colors.green : theme.colors.red};

    justify-content: center;
    align-items: center;

    padding: 5px;
    border-radius: 4px;
`;

export const TitleBadgeCardDrawerPrize = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const BodyCardDrawerPrize = styled.View`
    justify-content: center;
    align-items: center;
`;

export const ContentTitleParticipating = styled.View`
    width: 90%;
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
    border-radius: 10px;

    background-color: ${({ theme, notParticipant }) =>
        notParticipant ? theme.colors.red : theme.colors.green};
`;

export const TitleParticipating = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;
    text-align: center;

    color: ${({ theme }) => theme.colors.white};
`;

export const ButtonWinners = styled.TouchableOpacity`
    background-color: ${({ theme }) => theme.colors.primary};

    width: 90%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
    border-radius: 4px;

    elevation: 3;
`;

export const TitleButtonWinners = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const FooterCardDrawerPrize = styled.View`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    justify-content: center;
    align-items: flex-end;
`;

export const TitleDateDrawPrize = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const ContentActionButton = styled.View`
    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const ButtonDeleteDrawPrizeLive = styled.TouchableOpacity`
    background-color: ${({ theme }) => theme.colors.red};

    width: 90%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;

    elevation: 3;
`;

export const TitleButtonDeleteDrawPrizeLive = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const ButtonParticipate = styled.TouchableOpacity`
    width: 90%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 3;
`;

export const TitleButtonParticipate = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const ModalContent = styled.SafeAreaView`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(220)};

    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: ${({ theme }) => theme.size.dimentionsSize(3)};

    background-color: white;
`;

export const TitleModal = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const SubTitleModal = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    text-align: center;

    color: ${({ theme }) => theme.colors.black};
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(3)};
`;

export const ContentActionsModal = styled.View`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    gap: 10px;
`;

export const ButtonModalConfirm = styled.TouchableOpacity`
    background-color: ${({ theme }) => theme.colors.primary};

    width: 70%;
    height: ${({ theme }) => theme.size.componentSize(35)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
    border-radius: 4px;

    elevation: 3;
`;

export const TitleButtonModalConfirm = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const ButtonModalCancel = styled.TouchableOpacity`
    background-color: ${({ theme }) => theme.colors.red};

    width: 30%;
    height: ${({ theme }) => theme.size.componentSize(35)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
    border-radius: 4px;

    elevation: 3;
`;

export const TitleButtonModalCancel = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
