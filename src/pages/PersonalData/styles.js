import { Text } from "react-native-paper";
import styled from "styled-components/native";
import { Input } from "../../components/Input";

export const Container = styled.View`
    flex: 1;

    justify-content: space-between;
    align-items: center;

    padding: 10px;
`;

export const ContentForm = styled.View`
    width: 100%;
`;

export const InputStyle = styled(Input)`
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const ContentActionButton = styled.View`
    width: 100%;

    justify-content: center;
    align-items: center;
`;

export const ButtonSaveData = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};

    elevation: 3;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
