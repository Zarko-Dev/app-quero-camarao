/* eslint-disable operator-linebreak */
import styled from "styled-components/native";
import { Dimensions } from "react-native";

export const Container = styled.ScrollView`
    flex: 1;
`;

export const Content = styled.View`
    width: 100%;

    padding: 14px 14px 0 14px;
`;

export const ContentLoading = styled.View`
    width: 100%;
    height: ${({ theme }) =>
        Dimensions.get("screen").height -
        Number(theme.size.dimentionsSize(20).replace("px", ""))}px;

    justify-content: center;
    align-items: center;
`;

export const CardCountUser = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(100)};

    justify-content: space-around;
    align-items: center;

    padding: 20px;
    border-radius: ${({ theme }) => theme.size.componentSize(10)};

    background-color: ${({ theme }) => theme.colors.quaternary};

    elevation: 3;
`;

export const TitleCard = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;
    text-align: center;

    color: ${({ theme }) => theme.colors.black};
`;

export const TextCount = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const ContentCardTypeUserCount = styled.View`
    justify-content: space-around;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const CardCountUserUserType = styled.TouchableOpacity`
    width: 45%;
    height: ${({ theme }) => theme.size.componentSize(100)};

    justify-content: space-around;
    align-items: center;

    padding: 20px;
    border-radius: ${({ theme }) => theme.size.componentSize(10)};

    background-color: ${({ theme }) => theme.colors.quaternary};

    elevation: 3;
`;

export const ButtonListUsers = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    border-radius: ${({ theme }) => theme.size.componentSize(4)};

    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 3;
`;

export const TitleButton = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const Title = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    text-align: center;
    color: ${({ theme }) => theme.colors.black};
`;
