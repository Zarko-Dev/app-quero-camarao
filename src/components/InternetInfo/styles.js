import styled from "styled-components/native";

export const Container = styled.View`
    flex: 1;
    justify-content: flex-start;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(5)};
`;

export const Header = styled.View`
    align-items: center;
    justify-content: center;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const Title = styled.Text`
    font-size: 24px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
    text-align: center;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const Subtitle = styled.Text`
    font-size: 16px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.text};
    text-align: center;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
`;
