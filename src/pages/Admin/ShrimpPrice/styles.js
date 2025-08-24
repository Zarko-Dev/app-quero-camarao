import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.ScrollView`
    padding: 4px;
`;

export const Header = styled.View`
    justify-content: center;
    align-items: center;
`;

export const Title = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};

    color: ${({ theme }) => theme.colors.primary};
`;

export const Subtitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    text-align: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};

    color: ${({ theme }) => theme.colors.text};
`;

export const Body = styled.View`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(10)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(10)};
`;

export const ContentForm = styled.View`
    justify-content: space-between;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const ContainerCheckbox = styled.View`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(3)};
`;

export const CheckboxText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};

    color: ${({ theme }) => theme.colors.text};
`;

export const ContentCheckbox = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
`;

export const Footer = styled.View``;

export const Confirmbutton = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;
    margin: 0 4px 4px 4px;

    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 3;
`;

export const TitleButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;
