import { Text } from "react-native-paper";
import styled from "styled-components/native";
import { Input } from "../../components/Input";
import SelectComponent from "../../components/SelectComponent";

export const Container = styled.View`
    padding: 10px;
`;

export const CardFormAddress = styled.View`
    width: 100%;

    padding: 10px 8px;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1.5)};

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.quaternary};
`;

export const TitleCardAddress = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const ContentPhone = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
`;

export const InputPhoneStyleDDD = styled(Input)`
    width: 40%;
`;

export const InputPhoneStylePhone = styled(Input)`
    width: 60%;
`;

export const SelectComponentStyle = styled(SelectComponent)`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const ButtonSaveAddress = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};
`;

export const TextButtonSaveAddress = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};

    elevation: 3;
`;
