import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.View`
    width: 100%;
    justify-content: center;
    align-items: flex-start;
    border-radius: 16px;
    padding: 15px;
    background-color: #fff7ee;
    border-width: 1px;
    border-color: #ffe2cc;
    margin-bottom: 15px;
`;

export const TitleContainer = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 12px;
`;

export const TitleIcon = styled.View`
    width: 32px;
    height: 32px;
    border-radius: 16px;
    background-color: #ffead6;
    justify-content: center;
    align-items: center;
    margin-right: 10px;
`;

export const TitleResume = styled(Text)`
    font-size: 16px;
    font-weight: bold;
    color: #000;
`;

export const Divider = styled.View`
    width: 100%;
    height: 1px;
    background-color: #f0d9c8;
    margin-bottom: 12px;
`;

export const ContainerInfo = styled.View`
    width: 100%;
`;

export const ContentInfo = styled.View`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    margin-bottom: 8px;
`;

export const TitleInfo = styled(Text)`
    font-size: 14px;
    color: #4a4a4a;
`;

export const ButtonCupom = styled.TouchableOpacity`
    justify-content: flex-end;
    align-items: center;
    flex-direction: row;
    padding: 4px 10px;
    border-radius: 12px;
    background-color: #ffead6;
`;

export const TitleCupom = styled(Text)`
    color: #e85d22;
    font-size: 12px;
    margin-right: 4px;
`;

export const TitleValue = styled(Text)`
    font-size: 14px;
    text-align: right;
    color: #000;
`;

export const TitleInfoTotal = styled(TitleInfo)`
    font-size: 16px;
    font-weight: bold;
    color: #000;
`;

export const TitleValueTotal = styled(TitleValue)`
    font-size: 18px;
    font-weight: bold;
    color: #000;
`;
