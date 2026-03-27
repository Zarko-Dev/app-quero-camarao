import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    justify-content: center;
    align-items: center;

    padding: 10px;
`;

export const Title = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(25)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ theme }) => theme.colors.primary};
`;

export const Subtitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(17)};
    text-align: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ theme }) => theme.colors.black};
`;

export const CardSelection = styled.View`
    width: 95%;
    height: ${({ theme }) => theme.size.componentSize(80)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.tertiary};

    elevation: 3;
`;

//Usado para a tela de novo sorteio
export const ScrollNewPrize = styled.ScrollView`
    height: ${({ theme }) => theme.size.componentSize(200)};
`;

export const ButtonDrawPrise = styled.TouchableOpacity`
    width: 95%;
    height: ${({ theme }) => theme.size.componentSize(35)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(10)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.primary};
    opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};

    elevation: 3;
`;

export const ButtonDrawPriseHistory = styled(ButtonDrawPrise)`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    background-color: ${({ theme }) => theme.colors.black};
`;

export const TextButtonDrawPrize = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const ContentCheckBox = styled.View`
    align-items: center;
    flex-direction: row;
`;

export const ContainerCheckbox = styled.View`
    justify-content: space-around;
    align-items: center;
    flex-direction: row;
`;

export const TitleCheckbox = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;
`;

export const CountTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(30)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const ContentActionCountButtons = styled.View`
    width: 60%;

    justify-content: space-around;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.5)};
`;

export const ActionCountButton = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(80)};
    height: ${({ theme }) => theme.size.componentSize(20)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;

    background-color: ${({ green, theme }) =>
        green ? theme.colors.green : theme.colors.red};
    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

export const Scroll = styled.ScrollView`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(50)};

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const ContentTags = styled.View`
    justify-content: flex-start;
    gap: ${({ theme }) => theme.size.dimentionsSize(1)};
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
`;

export const ContentTag = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    padding: 5px;

    background-color: ${({ theme, selected }) =>
        selected ? theme.colors.primary : theme.colors.white};

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 999px;
    border-width: 1px;
    border-color: ${({ theme, selected }) =>
        selected ? theme.colors.primary : theme.colors.black};
`;

export const ContentTagParticipant = styled.View`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    padding: 8px 12px;
    background-color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 8px;
    width: 100%;
`;

export const Tag = styled.Text`
    width: ${({ theme }) => theme.size.componentSize(80)};
    padding: 5px;
    border-radius: 999px;
    background-color: ${({ theme, selected }) =>
        selected ? theme.colors.primary : theme.colors.white};


    text-align: center;
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;
    color: ${({ theme, selected }) => (selected ? "#fff" : theme.colors.black)};
`;

export const TagParticipant = styled.Text`
    flex: 1;
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;
    color: #fff;
`;

//Botão de deletar regra no draw prize new
export const ButtonDeleteRule = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 90%;
    align-self: center;
    height: ${({ theme }) => theme.size.componentSize(25)};
    background-color: red;
    border-radius: 5px;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

