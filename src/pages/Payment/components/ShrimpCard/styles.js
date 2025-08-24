import { Text } from "react-native-paper";
import styled from "styled-components/native";
import { ImageComponent } from "../../../../components/ImageComponent";

export const Container = styled.View`
    width: 100%;

    justify-content: flex-start;
    align-items: flex-start;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    border-radius: 4px;
    padding: 15px;

    background-color: ${({ theme }) => theme.colors.quaternary};
`;

export const ContentCardInfo = styled.View`
    width: 100%;

    flex-direction: row;
`;

export const Divider = styled.View`
    width: 100%;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};

    height: 1px;

    background-color: #6f6f6f;
`;

export const ContentImageShrimp = styled.View``;

export const ImageComponentStyle = styled(ImageComponent)`
    width: ${({ theme }) => theme.size.componentSize(80)};
    height: ${({ theme }) => theme.size.componentSize(80)};

    border-radius: 4px;
`;

export const ContentShrimpInfo = styled.View`
    height: 100%;

    justify-content: flex-start;

    margin-left: ${({ theme }) => theme.size.dimentionsSize(1)};
    padding: 10px 0;
`;

export const TitleShrimpInfo = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ theme }) => theme.colors.black};
`;

export const EditButton = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 3;
`;

export const TitleButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
