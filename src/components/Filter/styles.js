import styled from "styled-components/native";

export const Container = styled.View``;

export const ButtonFilter = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(60)};
    height: ${({ theme }) => theme.size.componentSize(35)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.7)};

    border-radius: 4px;
    border: 1px ${({ theme }) => theme.colors.quaternary} solid;

    background-color: ${({ theme }) => theme.colors.background};

    elevation: 3;
`;

export const TextButton = styled.Text`
    color: ${({ theme }) => theme.colors.black};
    font-weight: bold;
`;
