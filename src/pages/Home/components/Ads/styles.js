import styled from "styled-components/native";

export const ContainerADS = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme, height }) => theme.size.componentSize(height)};

    elevation: 3;
`;
