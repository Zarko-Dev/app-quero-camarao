import { Text } from "react-native";
import styled from "styled-components/native";

import { ImageComponent } from "../../../../../components/ImageComponent";

export const Container = styled.View`
    width: 100%;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1.2)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(0.8)};
    padding: 12px;
    border-radius: 8px;
    border-width: 1px;
    border-color: #e8e8e8;
    background-color: #ffffff;
    elevation: 2;
`;

export const ContentExpired = styled.View`
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.colors.black};
    opacity: 0.12;
`;

export const ContentPondsShrimp = styled.View`
    min-height: ${({ theme }) => theme.size.componentSize(28)};
    flex-direction: row;
    align-items: center;
    margin-bottom: 8px;
`;

export const TitleWrap = styled.View`
    flex: 1;
    flex-direction: row;
    align-items: center;
`;

export const LocationText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(17)};
    font-weight: 800;
    color: #1f1f1f;
`;

export const MainBadge = styled.View`
    flex-direction: row;
    align-items: center;
    margin-left: 10px;
    padding: 5px 9px;
    border-radius: 999px;
    background-color: #ffe7dc;
`;

export const MainBadgeText = styled(Text)`
    margin-left: 4px;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: 800;
    color: ${({ theme }) => theme.colors.primary};
`;

export const PondText = styled(Text)`
    margin-right: 12px;
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: 500;
    color: #555555;
`;

export const ButtonShare = styled.View`
    width: ${({ theme }) => theme.size.componentSize(22)};
    height: ${({ theme }) => theme.size.componentSize(22)};
    justify-content: center;
    align-items: center;
`;

export const ContainerInfo = styled.View`
    width: 100%;
    flex-direction: row;
    align-items: flex-start;
`;

export const ContentImageShrimp = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(86)};
    border-radius: 8px;
    overflow: hidden;
    background-color: #fff4ef;
`;

export const ImageColumn = styled.View`
    width: 24%;
    margin-right: 10px;
`;

export const ImageViews = styled.View`
    height: ${({ theme }) => theme.size.componentSize(26)};
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: 6px;
    border-radius: 999px;
    background-color: #f7f7f7;
`;

export const EmptyImageWrap = styled.View`
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    background-color: #fff4ef;
`;

export const EmptyShrimpImage = styled.Image`
    width: 74%;
    height: 74%;
`;

export const ShrimpImage = styled(ImageComponent)`
    width: 100%;
    height: 100%;
`;

export const ContentDataShrimp = styled.View`
    flex: 1;
    min-height: ${({ theme }) => theme.size.componentSize(86)};
    border-radius: 8px;
    background-color: #fbfbfb;
`;

export const ShrimpInfoColumn = styled.View`
    flex: 1;
    padding: 10px;
`;

export const ContentTextInfo = styled.View`
    margin-bottom: 8px;
`;

export const TextInfo = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: 800;
    color: ${({ theme }) => theme.colors.primary};
`;

export const ContainerShrimp = styled.View`
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    margin: -3px;
`;

export const ContentTextShrimp = styled.View`
    flex-direction: row;
    align-items: center;
    margin: 3px;
    padding: 5px 7px;
    border-radius: 7px;
    border-width: 1px;
    border-color: #f1ded5;
    background-color: #ffffff;
`;

export const ShrimpIcon = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(22)};
    height: ${({ theme }) => theme.size.componentSize(22)};
    margin-right: 5px;
`;

export const TextShrimp = styled(Text)`
    font-size: ${({ shrimpDimentions, theme }) =>
        shrimpDimentions > 4 ? theme.size.fontSize(11) : theme.size.fontSize(12)};
    font-weight: 800;
    color: #202020;
`;

export const MetaRow = styled.View`
    width: 100%;
    flex-direction: row;
    align-items: center;
    margin-top: 10px;
    padding: 8px;
    border-radius: 8px;
    background-color: #fbfbfb;
`;

export const MetaItem = styled.View`
    flex: ${({ wide }) => (wide ? 1.8 : 1)};
    flex-direction: row;
    align-items: center;
`;

export const MetaDivider = styled.View`
    width: 1px;
    height: 24px;
    margin: 0 8px;
    background-color: #e5e5e5;
`;

export const ExpirationLabel = styled(Text)`
    margin-left: 6px;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: 700;
    color: #333333;
`;

export const StatusPill = styled.View`
    margin-left: 6px;
    padding: 5px 8px;
    border-radius: 999px;
    background-color: ${({ expired }) => (expired ? "#eeeeee" : "#e7f6ea")};
`;

export const StatusPillText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    font-weight: 800;
    color: ${({ expired }) => (expired ? "#555555" : "#145c2f")};
`;

export const UsageRing = styled.View`
    width: ${({ theme }) => theme.size.componentSize(36)};
    height: ${({ theme }) => theme.size.componentSize(36)};
    justify-content: center;
    align-items: center;
    margin-left: 6px;
    border-radius: ${({ theme }) => theme.size.componentSize(36)};
    border-width: 3px;
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: #ffffff;
`;

export const UsagePercentText = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    font-weight: 900;
    color: ${({ theme }) => theme.colors.primary};
`;

export const UsageLabel = styled(Text)`
    margin-left: 5px;
    font-size: ${({ theme }) => theme.size.fontSize(10)};
    color: #666666;
`;

export const ExpirationDateRow = styled.View`
    flex-direction: row;
    align-items: center;
    margin-left: 6px;
`;

export const ExpirationDateText = styled(Text)`
    margin-left: 6px;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: 800;
    color: ${({ theme }) => theme.colors.primary};
`;

export const ContentVisualizations = styled.View`
    align-items: flex-start;
`;

export const TextVisualizations = styled(Text)`
    margin-left: 5px;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: 700;
    color: #333333;
`;

export const CompactText = styled(Text)`
    margin-left: 5px;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: 700;
    color: #333333;
`;

export const FooterButton = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(50)};
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-top: 12px;
    border-radius: 6px;
    background-color: ${({ theme }) => theme.colors.primary};
`;

export const ContentActionButtons = styled.View`
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
`;

export const ButtonDisablePublication = styled.TouchableOpacity`
    width: 48.5%;
    height: ${({ theme }) => theme.size.componentSize(44)};
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-radius: 7px;
    background-color: ${({ theme }) => theme.colors.primary};
    elevation: 2;
`;

export const ButtonExtendsPublication = styled(ButtonDisablePublication)`
    background-color: #171717;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: 800;
    color: #ffffff;
`;
