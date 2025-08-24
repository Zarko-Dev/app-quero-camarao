import styled from "styled-components/native";
import { Input } from "../../components/Input";

export const Container = styled.View`
    flex: 1;
`;

export const ContentCards = styled.View`
    justify-content: center;
    align-items: center;

    margin: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const CardShrimp = styled.View`
    width: 100%;

    justify-content: center;
    align-items: center;

    padding: 20px;
    border: 2px solid ${({ theme }) => theme.colors.primary};
    border-radius: 10px;
`;

export const ContentTitleCardShrimp = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(30)};

    justify-content: center;
    align-items: center;

    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: 8px;
`;

export const TitleCardShrimp = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const TitleInfoForm = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};

    color: ${({ theme }) => theme.colors.primary};
`;

export const ContentForm = styled.View`
    width: 90%;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const ContentInput = styled.View`
    width: 100%;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const TitleInput = styled.Text`
    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ theme }) => theme.colors.black};
`;

export const InputStyle = styled(Input)`
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const ButtonSale = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(40)};

    justify-content: center;
    align-items: center;
    flex-direction: row;
    gap: 20px;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const TitleButtonSale = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
