import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: #f0f4f8;
    padding-top: 14px;
`;

export const ContainerDropdownSelects = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 0 8px;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
`;

export const ContentInputSelect = styled.View`
    width: ${({ width }) => width};
`;

export const CharButton = styled.TouchableOpacity`
    margin: 8px;
    padding: 10px 30px;

    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 3;
`;

export const TitleButton = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
