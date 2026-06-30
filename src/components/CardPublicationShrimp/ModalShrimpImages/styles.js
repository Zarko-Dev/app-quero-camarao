import { Text } from "react-native-paper";
import styled from "styled-components/native";

import { ImageComponent } from "../../ImageComponent";

export const Container = styled.View``;

export const ContentModal = styled.SafeAreaView`
    flex: 1;

    justify-content: space-between;
    align-items: center;

    background-color: #000000d4;
`;

export const HeaderGrammageShrimp = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(56)};

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 0 10px;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const ContentEmpty = styled.View``;

export const HeaderTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    margin-left: ${({ theme }) => theme.size.dimentionsSize(-4)};

    color: ${({ theme }) => theme.colors.white};
`;

export const ContentImages = styled.View`
    width: ${({ itemWidth }) => itemWidth}px;
    aspect-ratio: 0.75;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(8)};
    border-radius: 12px;
    overflow: hidden;
`;

export const ShrimpImage = styled(ImageComponent)`
    width: 100%;
    height: 100%;
    border-radius: 12px;
`;

export const ButtonBuyShrimp = styled.TouchableOpacity`
    width: 100%;
    align-self: stretch;
    height: 44px;

    justify-content: center;
    align-items: center;
    flex-direction: row;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(5)};
    padding-horizontal: 16px;
    border-radius: 12px;

    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 3;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
