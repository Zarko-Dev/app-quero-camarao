import styled from "styled-components/native";

export const ContainerItem = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(165)};
    justify-content: center;
    align-items: center;

    border-radius: 4px;
    margin: 5px;
`;

export const ImageAdvertising = styled.Image`
    width: 100%;
    height: 100%;
`;

export const Container = styled.View`
    background-color: #fff;
`;
