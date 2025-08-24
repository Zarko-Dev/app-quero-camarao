import { Text } from "react-native-paper";
import styled from "styled-components/native";
import { Input } from "../../../components/Input";

export const Container = styled.SafeAreaView`
    flex: 1;

    padding: ${({ theme }) => theme.size.dimentionsSize(3)};
`;

export const Title = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    text-align: center;
    font-weight: bold;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(3)};
`;

export const InputStyle = styled(Input)`
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const ContentActions = styled.View`
    width: 100%;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(3)};
`;

export const TitleActions = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;
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
    font-size: ${({ theme }) => theme.size.fontSize(14)};
`;

export const Observation = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    color: ${({ theme }) => theme.colors.primary};
`;

export const ActionButton = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(5)};
    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 3;
`;

export const TextButton = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
