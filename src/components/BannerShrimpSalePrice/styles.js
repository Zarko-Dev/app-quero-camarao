import styled from "styled-components/native";
import { LinearGradient } from "expo-linear-gradient";

export const BannerContainer = styled.TouchableOpacity`
    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const BannerTitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
    text-align: center;
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const BannerBody = styled.View`
    width: 100%;
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;

    height: ${({ theme }) => theme.size.componentSize(140)};

    border-top-width: 3px;
    border-bottom-width: 3px;
    border-color: ${({ theme }) => theme.colors.primary};

    padding: 5px 0;
`;

export const ContentShrimpInfo = styled.View`
    width: 50%;

    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
`;

export const ContentShirimpImage = styled(LinearGradient).attrs(
    ({ theme }) => ({
        colors: [theme.colors.primary, theme.colors.white],
        start: { x: 0, y: 1.5 },
        end: { x: 0, y: 0 },
    }),
)`
    position: absolute;
    justify-content: center;
    align-items: center;

    width: ${({ theme }) => theme.size.componentSize(110)};
    height: ${({ theme }) => theme.size.componentSize(115)};

    margin-left: ${({ theme }) => theme.size.dimentionsSize(-2.5)};

    border-radius: ${({ theme }) => theme.size.componentSize(80)};
`;

export const ShrimpImage = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(80)};
    height: ${({ theme }) => theme.size.componentSize(100)};
`;

export const ContentDataInfo = styled.View`
    width: 100%;
    gap: 4px;
`;

export const InfoTag = styled(LinearGradient).attrs(({ theme }) => ({
    colors: [theme.colors.primary, theme.colors.secondary],
    start: { x: 0, y: 0.6 },
    end: { x: 0, y: 0 },
}))`
    height: ${({ theme }) => theme.size.componentSize(30)};

    align-items: flex-end;
    padding: 5px 0;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const InfoTagText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.white};
`;

export const ContantData = styled.View`
    width: 100%;
    height: 100%;

    justify-content: center;
    align-items: flex-start;

    margin-left: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const DataText = styled.Text`
    font-size: ${({ theme, textSize }) => theme.size.fontSize(textSize)};
    font-weight: 900;
    color: ${({ theme }) => theme.colors.black};
    margin-bottom: 8px;
`;
