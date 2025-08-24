import styled from "styled-components/native";

export const Container = styled.View`
    justify-content: center;
    align-items: center;

    border-radius: 10px;
    margin: 0 10px;

    background-color: ${({ theme }) => theme.colors.tertiary};
`;

export const TitleCardChart = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    margin-top: 14px;
`;
