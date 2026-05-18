import styled from "styled-components/native";

export const Container = styled.TouchableOpacity`
    width: 100%;

    justify-content: space-between;
    align-items: center;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1.2)};
    padding: 12px;
    border-radius: 12px;
    border-width: 1px;
    border-color: #dddddd;
    background-color: #f8f8f8;

    elevation: 3;
`;

export const Content = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;
`;

export const ContentInfo = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
`;

export const ImageItem = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(50)};
    height: ${({ theme }) => theme.size.componentSize(50)};

    border-radius: ${({ theme }) => theme.size.componentSize(50)};
    background-color: #ffe9da;
`;

export const ContentTextInfo = styled.View`
    margin-left: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const InfoTitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;
    color: #333333;
`;

export const InfoSubtitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    color: #6d6d6d;
`;

export const TitlePayValue = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(19)};
    font-weight: bold;
    color: #f55b1f;
`;

export const ContentPonds = styled.View`
    width: 100%;

    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: row;
    flex-wrap: wrap;

    padding: 8px 8px;
    margin: 10px 0 0 0;
    border: 1px #d8d8d8 solid;
    border-radius: 8px;
`;

export const TagPonds = styled.View`
    margin: 3px 6px 3px 0;
    padding: 3px 10px;
    border-radius: 12px;
    background-color: #ffe4d5;
`;

export const TitleTagPond = styled.Text`
    font-weight: bold;
    color: #f56a27;
`;
