import { Text } from "react-native-paper";
import styled from "styled-components/native";
import { ImageComponent } from "../ImageComponent";

export const Container = styled.View`
    width: 100%;
    background-color: #fff;
    border-radius: 20px;
    margin-bottom: 20px;
    overflow: hidden;
    elevation: ${({ $disableShadow }) => ($disableShadow ? 0 : 3)};
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: ${({ $disableShadow }) => ($disableShadow ? 0 : 0.1)};
    shadow-radius: ${({ $disableShadow }) => ($disableShadow ? 0 : 4)}px;
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
    flex-shrink: 1;
    margin-right: 8px;
`;

export const LocationText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;
    color: #e85d22;
    margin-left: 5px;
    flex-shrink: 1;
`;

export const RightHeaderContainer = styled.View`
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;
`;

export const PondText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: #333;
    margin-right: 15px;
`;

export const ButtonShare = styled.TouchableOpacity`
    padding: 5px;
`;

export const ContainerInfo = styled.View`
    flex-direction: row;
    padding: 0 15px 0 15px;
`;

export const ContentImageShrimp = styled.TouchableOpacity`
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
    justify-content: space-between;
`;

export const GrammageContainer = styled.View`
    background-color: #fdf5f0;
    border-radius: 12px;
    padding: 10px;
    flex: 1;
    margin-bottom: 0px;
    justify-content: center;
    border-width: 1px;
    border-color: #f3dfcf;
`;

export const ContentTextInfo = styled.View`
    margin-bottom: 8px;
`;

export const TextInfo = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;
    color: #e85d22;
`;

export const ContainerShrimp = styled.View`
    flex-direction: row;
    align-items: center;
`;

export const ShrimpIcon = styled.Image`
    width: 24px;
    height: 24px;
    margin-right: 8px;
`;

export const TextShrimp = styled(Text)`
    flex-shrink: 1;
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;
    color: #333;
    text-decoration: ${({ sale }) => (sale ? "line-through" : "none")};
    opacity: ${({ sale }) => (sale ? 0.5 : 1)};
`;

export const TextUnitMeasurement = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;
    color: #333;
`;

export const ButtonBuy = styled.TouchableOpacity`
    background-color: #213f56;
    align-self: stretch;
    height: 44px;
    border-radius: 12px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin: 10px 15px 15px;
`;

export const ButtonBuyText = styled(Text)`
    font-weight: bold;
    color: #fff;
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    margin-left: 8px;
`;
