import { Text } from "react-native-paper";
import styled from "styled-components/native";
import { ImageComponent } from "../../../../components/ImageComponent";

export const Container = styled.View`
    width: 100%;
    justify-content: flex-start;
    align-items: flex-start;
    border-radius: 16px;
    padding: 15px;
    background-color: #fff7ee;
    border-width: 1px;
    border-color: #ffe2cc;
    margin-bottom: 12px;
`;

export const ContentCardInfo = styled.View`
    width: 100%;
    flex-direction: row;
    align-items: center;
`;

export const Divider = styled.View`
    width: 100%;
    margin-top: 15px;
    margin-bottom: 15px;
    height: 1px;
    background-color: #f0d9c8;
`;

export const ContentImageShrimp = styled.View`
    width: 80px;
    height: 80px;
    border-radius: 12px;
    background-color: #ffead6;
    justify-content: center;
    align-items: center;
    overflow: hidden;
`;

export const ImageComponentStyle = styled(ImageComponent)`
    width: 60px;
    height: 60px;
`;

export const ContentShrimpInfo = styled.View`
    flex: 1;
    justify-content: center;
    margin-left: 15px;
`;

export const TitleShrimpInfo = styled(Text)`
    font-size: 16px;
    font-weight: bold;
    color: #000;
    margin-bottom: 6px;
`;

export const SubTitleShrimpInfo = styled(Text)`
    font-size: 14px;
    color: #4a4a4a;
`;

export const EditButton = styled.TouchableOpacity`
    width: 100%;
    height: 48px;
    justify-content: center;
    align-items: center;
    flex-direction: row;
    border-radius: 8px;
    background-color: #e85d22;
    elevation: 3;
`;

export const TitleButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
