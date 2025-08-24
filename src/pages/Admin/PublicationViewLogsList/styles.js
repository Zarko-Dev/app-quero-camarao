import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    padding: 14px;
`;

export const Content = styled.View`
    width: 100%;

    justify-content: center;
    align-items: flex-start;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    padding: 12px;
    border-radius: 10px;

    background-color: ${({ theme }) => theme.colors.tertiary};

    elevation: 3;
`;

export const ContentInfo = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
`;

export const ImageItem = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(55)};
    height: ${({ theme }) => theme.size.componentSize(55)};

    border-radius: ${({ theme }) => theme.size.componentSize(55)};
`;

export const ContentTextInfo = styled.View`
    margin-left: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const InfoTitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.text};
`;

export const InfoSubtitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
`;

export const ContentPonds = styled.View`
    width: 100%;

    justify-content: center;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;

    padding: 5px 0;
    margin: 10px 0;
    border: 1px #3c3c3c solid;
    border-radius: 4px;
`;

export const TagPonds = styled.View`
    margin: 3px;
    padding: 2px 8px;

    border-radius: 10px;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const TitleTagPond = styled.Text`
    font-weight: bold;
    color: ${({ theme }) => theme.colors.white};
`;

export const ContentActionButtons = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;
`;

export const ActionButton = styled.TouchableOpacity`
    width: 48%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;

    background-color: ${({ color }) => color};

    elevation: 3;
`;

export const TitleActionButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
