import styled from "styled-components/native";

export const Container = styled.View`
    justify-content: center;
    align-items: center;

    border-radius: 14px;
    margin: 0 14px 16px;
    padding-bottom: 14px;

    background-color: #fff;
    elevation: 3;
`;

export const TitleCardChart = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;
    color: #1e2d3d;
    margin-top: 16px;
    margin-bottom: 4px;
`;
