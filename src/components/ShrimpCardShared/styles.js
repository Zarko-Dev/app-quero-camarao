import { Text } from "react-native-paper";
import styled from "styled-components/native";
import ViewShot from "react-native-view-shot";

import { ImageComponent } from "../ImageComponent";

export const Container = styled(ViewShot)`
    position: absolute;
    left: -9999px;
`;

export const ContainerShrimp = styled.View`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(210)};

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.5)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1.5)};
    border-radius: 4px;

    background-color: ${({ theme }) => theme.colors.tertiary};

    elevation: 3;
`;

export const ContentLogo = styled.View`
    height: ${({ theme }) => theme.size.componentSize(55)};

    justify-content: center;
    align-items: center;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const LogoImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(90)};
    height: ${({ theme }) => theme.size.componentSize(45)};

    margin-right: ${({ theme }) => theme.size.dimentionsSize(5)};
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

    margin-left: ${({ theme }) => theme.size.dimentionsSize(-7)};
`;

export const ButtonShare = styled.View`
    height: ${({ theme }) => theme.size.componentSize(30)};

    justify-content: center;
    align-items: center;

    padding-left: ${({ theme }) => theme.size.componentSize(10)};
`;

export const ContainerInfo = styled.View`
    width: 100%;
    flex-direction: row;
`;

export const ContentImageShrimp = styled.View`
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

export const ContainerDataShrimp = styled.View`
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
