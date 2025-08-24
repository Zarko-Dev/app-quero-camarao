import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;

    justify-content: space-between;

    padding: 10px;
`;

export const Content = styled.ScrollView``;

export const ContentCard = styled.View`
    width: 100%;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    padding: 10px;
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.quaternary};
`;

export const TitleCard = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;
`;

export const ContentRadio = styled.View`
    align-items: center;
    flex-direction: row;
`;

export const TitleRadio = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
`;

export const ContainerDate = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;
`;

export const ContentSelectTime = styled.TouchableOpacity`
    width: 48%;
    height: ${({ theme }) => theme.size.componentSize(35)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.secondary};

    elevation: 3;
`;

export const TitleSelectTime = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;
`;

export const ButtonRegister = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};

    elevation: 3;
`;

export const TitleButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
