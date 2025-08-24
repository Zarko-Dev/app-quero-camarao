import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(165)};
    justify-content: center;
    align-items: center;

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.tertiary};

    elevation: 3;
`;

export const ImageAdvertising = styled.Image`
    width: 100%;
    height: 100%;
`;

export const AdvertisingTag = styled.View`
    width: 32%;
    position: absolute;

    top: 0;
    left: 0;

    padding-left: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-bottom-right-radius: 10px;

    background-color: ${({ theme }) => theme.colors.black};
    opacity: 0.5;
`;

export const TextAdvertisingTag = styled(Text)`
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
