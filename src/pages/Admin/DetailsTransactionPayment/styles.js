import styled from "styled-components/native";
import { Input } from "../../../components/Input";

export const Container = styled.ScrollView`
    flex: 1;

    padding: 14px;
`;

export const InputStyle = styled(Input)`
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const ContainerTitleDivider = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    padding: 14px 0;
`;

export const Title = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    margin-right: 5px;
`;

export const Divider = styled.View`
    width: 100%;
    height: 1px;

    margin-top: 5px;

    background-color: #000;
`;

export const ContainerPonds = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    padding: 14px;
    border-radius: 10px;

    background-color: ${({ theme }) => theme.colors.quaternary};

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(3)};

    elevation: 3;
`;

export const ImageShrimp = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(55)};
    height: ${({ theme }) => theme.size.componentSize(55)};

    border-radius: ${({ theme }) => theme.size.componentSize(55)};
`;

export const ContentInfo = styled.View`
    margin-left: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const TitleShrimp = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(0.5)};
`;

export const SubtitleShrimp = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
`;
