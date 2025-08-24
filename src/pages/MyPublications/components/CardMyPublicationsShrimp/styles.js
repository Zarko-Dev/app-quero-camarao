import { Text } from "react-native-paper";
import styled from "styled-components/native";

import { ImageComponent } from "../../../../components/ImageComponent";

export const Container = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(155)};

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.5)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.tertiary};

    elevation: 3;
`;

export const ContentExpired = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(155)};

    position: absolute;
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};
    opacity: 0.3;
`;

export const ContentPondsShrimp = styled.View`
    height: ${({ theme }) => theme.size.componentSize(30)};

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 5px;
`;

export const LocationText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.black};
`;

export const PondText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;

    margin-left: ${({ theme }) => theme.size.dimentionsSize(-5)};
`;

export const ContentMenu = styled.View`
    height: ${({ theme }) => theme.size.componentSize(30)};

    justify-content: center;
    align-items: center;

    margin-right: 2%;
`;

export const ButtonMenu = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(10)};

    justify-content: center;
    align-items: center;
`;

export const ContainerInfo = styled.View`
    width: 100%;
    flex-direction: row;
`;

export const ContentImageShrimp = styled.TouchableOpacity`
    width: 30.5%;
    height: ${({ theme }) => theme.size.componentSize(125)};
`;

export const ShrimpImage = styled(ImageComponent)`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(125)};

    border-bottom-left-radius: 5px;
`;

export const ContentDataShrimp = styled.View`
    width: 70%;
`;

export const ContentTextInfo = styled.View`
    width: 100%;
    justify-content: center;
    align-items: center;

    background-color: ${({ theme }) => theme.colors.quaternary};
`;

export const TextInfo = styled(Text)`
    height: ${({ theme }) => theme.size.componentSize(20)};
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const ContainerShrimp = styled.View`
    height: ${({ theme }) => theme.size.componentSize(77)};

    justify-content: center;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;

    padding: 5px 0;
    padding-top: ${({ shrimpDimentions, theme }) => {
        switch (shrimpDimentions) {
            case 1:
                return theme.size.dimentionsSize(4);

            case 2:
                return theme.size.dimentionsSize(2);

            case 3:
                return theme.size.dimentionsSize(2.4);

            case 4:
                return theme.size.dimentionsSize(2.4);

            case 5:
                return theme.size.dimentionsSize(0.5);

            default:
                return 0;
        }
    }};
`;

export const ContentTextShrimp = styled.View`
    justify-content: center;
    align-items: center;
    flex-direction: row;

    padding: 0 1px;
`;

export const ShrimpIcon = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(24)};
    height: ${({ theme }) => theme.size.componentSize(24)};
`;

export const TextShrimp = styled(Text)`
    font-size: ${({ shrimpDimentions, theme }) => {
        switch (shrimpDimentions) {
            case 1:
                return theme.size.fontSize(18);

            case 2:
                return theme.size.fontSize(18);

            case 3:
                return theme.size.fontSize(14);

            case 4:
                return theme.size.fontSize(13);

            case 5:
                return theme.size.fontSize(13);

            default:
                return 0;
        }
    }};

    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};

    text-decoration: ${({ sale }) => (sale ? "line-through" : "none")};
    opacity: ${({ sale }) => (sale ? 0.5 : 1)};
`;

export const ButtonBuy = styled.View`
    width: 99.1%;
    height: ${({ theme }) => theme.size.componentSize(29)};

    justify-content: center;
    align-items: center;
    flex-direction: row;

    border-bottom-right-radius: 4px;

    background-color: ${({ theme }) => theme.colors.black};
`;

export const ButtonBuyText = styled(Text)`
    font-weight: bold;

    margin-left: ${({ theme }) => theme.size.dimentionsSize(1)};

    color: ${({ theme }) => theme.colors.white};
`;

export const ContentVisualizations = styled.View`
    height: ${({ theme }) => theme.size.componentSize(35)};

    justify-content: flex-start;
    align-items: center;
`;

export const TextVisualizations = styled(Text)`
    height: ${({ theme }) => theme.size.componentSize(35)};

    font-size: ${({ theme }) => theme.size.fontSize(13)};
    font-weight: bold;

    padding: 9px 15px;
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.tertiary};

    elevation: 3;
`;

export const ContentActionButtons = styled.View`
    width: 100%;

    justify-content: center;
    align-items: center;
    flex-direction: row;
    gap: 10px;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.5)};
`;

export const ButtonSaleponds = styled.TouchableOpacity`
    width: ${({ only }) => (only ? "100%" : "48%")};
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.green};

    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

    elevation: 3;
`;

export const ButtonEditSaleponds = styled(ButtonSaleponds)`
    width: ${({ only }) => (only ? "100%" : "48%")};
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: center;
    align-items: center;

    border-radius: 4px;
    background-color: ${({ theme }) => theme.colors.primary};

    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

    elevation: 3;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.white};
`;

export const ContentCheckbox = styled.View`
    align-items: center;
    flex-direction: row;
`;

export const TitleCheckbox = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
`;
