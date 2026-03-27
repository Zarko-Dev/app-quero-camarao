import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    flex: 1;
    /* justify-content: space-between; */
`;

export const Content = styled.View`
    padding: 5px;
`;

export const Title = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    color: ${({ theme }) => theme.colors.primary};

    text-align: center;
`;

export const Subtitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    text-align: center;
`;

export const TitleSelect = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1.5)};

    color: ${({ theme }) => theme.colors.primary};
`;

export const TitleTags = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    color: ${({ theme }) => theme.colors.primary};

    text-align: center;
`;

export const Scroll = styled.ScrollView`
    height: ${({ theme }) => theme.size.componentSize(80)};
`;



export const ContentTags = styled.View`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
`;

export const ContentTag = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    padding: 5px;

    background-color: ${({ theme }) => theme.colors.primary};

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 999px;
`;

//Usado no front da nova regra de sorteio
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

    text-align: center;
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;
    color: #fff;
`;

//Usado no front da nova regra de sorteio
export const TagParticipant = styled.Text`
    flex: 1;
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;
    color: #fff;
`;

export const ButtonRemoveTag = styled.TouchableOpacity``;

export const ContentButtons = styled.View`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const ContentActions = styled.View`
    justify-content: space-around;
    flex-direction: row;
`;

export const ConfirmeButtom = styled.TouchableOpacity`
    width: 45%;
    height: ${({ theme }) => theme.size.componentSize(25)};

    justify-content: center;
    align-items: center;

    background-color: ${({ theme }) => theme.colors.primary};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};

    border-radius: 5px;
`;

export const SaveDrawPriseRule = styled(ConfirmeButtom)`
    width: 95%;
`;

export const ClearAll = styled(ConfirmeButtom)`
    background-color: ${({ theme }) => theme.colors.black};
`;

export const TextButton = styled(Text)`
    color: ${({ theme }) => theme.color ?? "#FFF"};
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;
`;

//Checkbox usado na nova regra de sorteio
export const ContentCheckboxMode = styled.View`
    flex-direction: row;
    justify-content: space-around;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const CheckboxModeItem = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
`;

export const CheckboxAllLabel = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
    margin-left: 4px;
`;

