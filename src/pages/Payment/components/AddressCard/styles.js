import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.TouchableOpacity`
    width: 100%;
    min-height: 120px;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: row;
    border-radius: 16px;
    padding: 15px;
    background-color: #fff7ee;
    border-width: 1px;
    border-color: #ffe2cc;
    margin-bottom: 12px;
`;

export const ContentAddressIcon = styled.View`
    width: 36px;
    height: 36px;
    border-radius: 18px;
    background-color: #ffead6;
    justify-content: center;
    align-items: center;
    margin-right: 12px;
`;

export const ContentInfo = styled.View`
    flex: 1;
`;

export const TitleAddress = styled(Text)`
    font-size: 16px;
    font-weight: bold;
    color: #000;
    margin-bottom: 6px;
`;

export const TextInfoAddress = styled(Text)`
    font-size: 14px;
    color: #4a4a4a;
    margin-bottom: 4px;
`;

export const ContentButtonAddress = styled.View`
    height: 100%;

    margin-left: 8%;

    justify-content: center;
`;

export const ContentEmptyAddress = styled(Container)`
    justify-content: center;
    align-items: center;

    padding: 0;
`;

export const ButtonAddAddress = styled.View`
    width: 70%;
    height: ${({ theme }) => theme.size.componentSize(35)};

    justify-content: center;
    align-items: center;
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};
`;

export const TextButtonAddAddress = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(17)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
