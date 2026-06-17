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
    align-self: center;
    margin-top: 12px;
    padding: 8px 20px;
    border-radius: 20px;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    background-color: #fff;
    border-width: 1.5px;
    border-color: ${({ theme }) => theme.colors.primary};
    elevation: 1;
`;

export const TitleButton = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
`;
