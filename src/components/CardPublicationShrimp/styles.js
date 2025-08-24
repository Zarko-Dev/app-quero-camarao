import { Text } from "react-native-paper";
import styled from "styled-components/native";
import { ImageComponent } from "../ImageComponent";

export const Container = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(155)};

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.5)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1.5)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.tertiary};

    elevation: 3;
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

    margin-left: ${({ theme }) => theme.size.dimentionsSize(-4)};
`;

export const ButtonShare = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(30)};

    justify-content: center;
    align-items: center;

    padding-left: ${({ theme }) => theme.size.componentSize(10)};
`;

export const ContainerInfo = styled.View`
    width: 100%;
    flex-direction: row;
`;

export const ContentImageShrimp = styled.TouchableOpacity`
    width: 30%;
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
                return theme.size.fontSize(13);

            case 4:
                return theme.size.fontSize(12.8);

            case 5:
                return theme.size.fontSize(12.8);

            default:
                return 0;
        }
    }};

    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};

    text-decoration: ${({ sale }) => (sale ? "line-through" : "none")};
    opacity: ${({ sale }) => (sale ? 0.5 : 1)};
`;

export const TextUnitMeasurement = styled(Text)`
    font-size: ${({ shrimpDimentions, theme }) => {
        switch (shrimpDimentions) {
            case 1:
                return theme.size.fontSize(16);

            case 2:
                return theme.size.fontSize(16);

            case 3:
                return theme.size.fontSize(10);

            case 4:
                return theme.size.fontSize(12);

            case 5:
                return theme.size.fontSize(12);

            default:
                return 0;
        }
    }};

    font-weight: bold;

    color: ${({ theme }) => theme.colors.black};
`;

export const ButtonBuy = styled.TouchableOpacity`
    width: 100%;
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
