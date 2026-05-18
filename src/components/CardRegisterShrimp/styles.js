import { Text } from "react-native-paper";
import styled from "styled-components/native";
import { Input } from "../Input";

export const Container = styled.View`
    width: 100%;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.2)};
    padding: 10px;
    border-radius: 8px;
    border-width: 1px;
    border-color: #ffe2cc;
    background-color: #ffffff;
`;

export const Header = styled.View`
    min-height: ${({ theme }) => theme.size.componentSize(30)};
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    margin-bottom: 10px;
`;

export const ContentInternalHeader = styled.View`
    width: 28px;
`;

export const TitleHeader = styled(Text)`
    flex: 1;
    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    text-align: center;
    color: ${({ theme }) => theme.colors.primary};
`;

export const ButtonDeleteCardPond = styled.TouchableOpacity`
    width: 28px;
    height: 28px;
    justify-content: center;
    align-items: center;
    border-radius: 14px;
    background-color: ${({ theme }) => theme.colors.primary};
`;

export const ContentForm = styled.View`
    justify-content: center;
    align-items: center;
`;

export const ContentImage = styled.View`
    width: ${({ theme }) => theme.size.componentSize(110)};
    height: ${({ theme }) => theme.size.componentSize(110)};
    justify-content: center;
    align-items: center;
    margin-bottom: 12px;
    border: 1.5px ${({ theme }) => theme.colors.primary} solid;
    border-radius: ${({ theme }) => theme.size.componentSize(110)};
    background-color: #fff7f2;
`;

export const ImageShrimp = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(96)};
    height: ${({ theme }) => theme.size.componentSize(96)};
    border-radius: ${({ theme }) => theme.size.componentSize(96)};
`;

export const ContentInput = styled.View`
    width: 100%;
`;

export const TitleInput = styled(Text)`
    margin-bottom: 4px;
    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: ${({ theme }) => theme.colors.text};
`;

export const InputStyle = styled(Input)`
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;
