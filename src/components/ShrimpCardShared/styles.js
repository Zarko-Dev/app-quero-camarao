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
    background-color: #fff;
    border-radius: 20px;
    overflow: hidden;
    elevation: 3;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.1;
    shadow-radius: 4px;
`;

export const ContentLogo = styled.View`
    height: ${({ theme }) => theme.size.componentSize(50)};
    justify-content: center;
    align-items: center;
    background-color: #e85d22;
`;

export const LogoImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(90)};
    height: ${({ theme }) => theme.size.componentSize(38)};
`;

export const ContentPondsShrimp = styled.View`
    width: 100%;
    padding: 12px 15px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

export const LocationContainer = styled.View`
    flex-direction: row;
    align-items: center;
    flex: 1;
`;

export const LocationText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;
    color: #e85d22;
    margin-left: 5px;
`;

export const PondText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: #333;
`;

export const ContainerInfo = styled.View`
    width: 100%;
    flex-direction: row;
    padding: 0 15px 15px 15px;
`;

export const ContentImageShrimp = styled.View`
    width: 45%;
    aspect-ratio: 1.1;
    border-radius: 15px;
    overflow: hidden;
`;

export const ShrimpImage = styled(ImageComponent)`
    width: 100%;
    height: 100%;
`;

export const ContentDataShrimp = styled.View`
    width: 55%;
    padding-left: 15px;
    justify-content: center;
`;

export const ContentTextInfo = styled.View`
    margin-bottom: 8px;
`;

export const TextInfo = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;
    color: #e85d22;
`;

export const ContainerDataShrimp = styled.View`
    background-color: #FEF5ED;
    border-radius: 12px;
    padding: 10px;
    justify-content: center;
`;

export const ContentTextShrimp = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 2px;
`;

export const ShrimpIcon = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(22)};
    height: ${({ theme }) => theme.size.componentSize(22)};
    margin-right: 6px;
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
    color: #333;
`;

export const TextUnitMeasurement = styled(Text)`
    font-size: ${({ shrimpDimentions, theme }) => {
        switch (shrimpDimentions) {
            case 1:
                return theme.size.fontSize(14);
            case 2:
                return theme.size.fontSize(14);
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
    color: #333;
`;
