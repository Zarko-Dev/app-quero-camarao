import styled from "styled-components/native";

export const TitleItem = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    color: ${({ theme }) => theme.colors.black};
`;

export const Divider = styled.View`
    width: 100%;
    height: 1px;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    background-color: ${({ theme }) => theme.colors.border};
`;

export const ContentCardCount = styled.View`
    justify-content: center;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
`;

export const CardCount = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(130)};
    height: ${({ theme }) => theme.size.componentSize(80)};

    justify-content: center;
    align-items: center;

    padding: 5px;
    margin: 10px;
    border-radius: 10px;

    background-color: ${({ theme }) => theme.colors.quaternary};

    elevation: 3;
`;

export const ContentTitle = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

export const TitleCard = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;
    text-align: center;

    color: ${({ theme }) => theme.colors.black};
`;

export const ButtonGenerateXlsxFile = styled.TouchableOpacity`
    background-color: ${({ theme }) => theme.colors.primary};
    width: ${({ theme }) => theme.size.componentSize(30)};
    height: ${({ theme }) => theme.size.componentSize(30)};

    justify-content: center;
    align-items: center;

    border-radius: 10px;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const TextCount = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;
