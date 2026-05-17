import { Text } from "react-native";
import styled from "styled-components/native";

export const Container = styled.ScrollView`
    padding: 12px 12px 6px 12px;
    background-color: #ffffff;
`;

export const Header = styled.View`
    justify-content: center;
    align-items: center;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(2.5)};
`;

export const Title = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: 700;

    color: ${({ theme }) => theme.colors.primary};
`;

export const Subtitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    text-align: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: #7c7c7c;
`;

export const Body = styled.View`
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(10)};
`;

export const ContentForm = styled.View`
    justify-content: space-between;
    flex-direction: row;
    padding: 6px;
    border-radius: 12px;
    border-width: 1px;
    border-color: #e8e8e8;
    background-color: #ffffff;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.2)};
`;

export const ContainerCheckbox = styled.View`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.5)};
`;

export const CheckboxText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: 700;

    color: #393939;
`;

export const CheckboxSubtext = styled(Text)`
    margin-top: 2px;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #7f7f7f;
`;

export const ContentCheckbox = styled.View`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    padding: 8px;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 12px;
    border-width: 1px;
    border-color: #efefef;
    background-color: #ffffff;
`;

export const Footer = styled.View`
    background-color: #f7f7f7;
`;

export const Confirmbutton = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(48)};

    justify-content: center;
    align-items: center;
    flex-direction: row;

    border-radius: 10px;
    margin: 0 12px 12px 12px;

    background-color: ${({ theme }) => theme.colors.primary};

    elevation: 3;
`;

export const TitleButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const SectionHeader = styled.View`
    flex-direction: row;
    align-items: center;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.8)};
`;

export const SectionMarker = styled.View`
    width: 4px;
    height: 18px;
    border-radius: 99px;
    margin-right: 8px;
    background-color: ${({ theme }) => theme.colors.primary};
`;

export const SectionTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: 700;
    color: #303030;
`;

export const CheckboxTextWrap = styled.View`
    flex: 1;
    margin-right: 10px;
`;

export const CheckBoxHolder = styled.View`
    width: 28px;
    height: 28px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    border-width: 1px;
    border-color: ${({ theme }) => theme.colors.primary};
`;

export const TipBox = styled.View`
    flex-direction: row;
    align-items: flex-start;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.5)};
    padding: 12px;
    border-radius: 10px;
    border-width: 1px;
    border-color: #f0c5b2;
    background-color: #fff2eb;
`;

export const TipIconWrap = styled.View`
    width: 28px;
    height: 28px;
    justify-content: center;
    align-items: center;
    border-radius: 999px;
    margin-right: 10px;
    background-color: #ffe4d5;
`;

export const TipTitle = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: 700;
    color: ${({ theme }) => theme.colors.primary};
`;

export const TipDescription = styled(Text)`
    margin-top: 2px;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #6f6f6f;
`;
