import styled from "styled-components/native";

export const Container = styled.View`
    flex: 1;

    padding: 10px;
`;

export const CardItemSale = styled.View`
    width: 100%;
    min-height: ${({ theme }) => theme.size.componentSize(150)};

    display: flex;
    justify-content: ${({ idAdmin }) =>
        idAdmin ? "space-between" : "flex-start"};

    border-radius: 5px;
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};

    background-color: ${({ theme }) => theme.colors.tertiary};
`;

export const Header = styled.View`
    height: ${({ theme }) => theme.size.componentSize(25)};

    display: flex;
    justify-content: center;
    align-items: center;

    border-radius: 5px 5px 0 0;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const TitleHeader = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const Body = styled.View`
    padding: 10px;

    display: flex;
    justify-content: center;
    align-items: center;
`;

export const ContentGrammage = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    margin: 5px 0;
`;

export const TitleGrammage = styled.Text`
    width: 20%;

    text-align: center;

    background-color: ${({ theme }) => theme.colors.primary};
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;

    padding: 3px;
    border-radius: 10px;

    color: ${({ theme }) => theme.colors.white};
`;

export const DividerLine = styled.View`
    width: 13%;

    border: 0.5px dashed ${({ theme }) => theme.colors.black};
`;

export const TitleDateSale = styled.Text``;

export const TitleGrammageValue = styled.Text`
    width: 20%;
    text-align: center;

    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const Footer = styled.View`
    justify-content: center;
    align-items: center;
`;

export const ButtonChatProductor = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(30)};

    justify-content: center;
    align-items: center;
    flex-direction: row;
    gap: 10px;

    border-radius: 0 0 5px 5px;

    background-color: ${({ theme }) => theme.colors.black};
`;

export const ButtonEditSale = styled(ButtonChatProductor)`
    height: ${({ theme }) => theme.size.componentSize(40)};

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    background-color: ${({ theme }) => theme.colors.red};
`;

export const ButtonText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
