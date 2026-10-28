import styled from "styled-components/native";
import { Animated } from "react-native";

const getRowMinHeight = ({ $compact, $isLocation }) => {
    if ($isLocation) {
        return $compact ? "36px" : "44px";
    }

    return $compact ? "21px" : "24px";
};

const getRowMarginTop = ({ $compact, $isLocation }) => {
    if (!$isLocation) {
        return "0px";
    }

    return $compact ? "2px" : "4px";
};

export const BannerContainer = styled.TouchableOpacity`
    width: 100%;
    min-height: ${({ $compact }) => ($compact ? "183px" : "210px")};
    background-color: #fff7ee;
    border-radius: 16px;
    padding: ${({ $compact }) => ($compact ? "9px" : "12px")};
    border-width: 1px;
    border-color: #ffe2cc;
    elevation: 3;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.1;
    shadow-radius: 4px;
`;

export const BannerTitle = styled.Text`
    font-size: ${({ theme, $compact }) =>
        theme.size.fontSize($compact ? 16 : 18)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
    text-align: center;
    padding-horizontal: 24px;
    margin-bottom: ${({ $compact }) => ($compact ? "6px" : "10px")};
`;

export const BannerBody = styled.View`
    width: 100%;
    flex-direction: row;
    align-items: stretch;
`;

export const ContentShirimpImage = styled.View`
    width: ${({ $compact }) => ($compact ? "92px" : "116px")};
    justify-content: center;
    align-items: center;
    padding-right: ${({ $compact }) => ($compact ? "6px" : "10px")};
`;

export const ShrimpImageCircle = styled.View`
    width: ${({ $compact }) => ($compact ? "84px" : "112px")};
    height: ${({ $compact }) => ($compact ? "84px" : "112px")};
    border-radius: ${({ $compact }) => ($compact ? "42px" : "56px")};
    background-color: #fff;
    border-width: 1px;
    border-color: #ffe2cc;
    justify-content: center;
    align-items: center;
`;

export const ShrimpImage = styled.Image`
    width: ${({ $compact }) => ($compact ? "74px" : "95px")};
    height: ${({ $compact }) => ($compact ? "74px" : "95px")};
`;

export const ContentDataInfo = styled.View`
    flex: 1;
    min-width: 0px;
    justify-content: center;
`;

export const DataRowsGroup = styled.View`
    min-height: 146px;
    justify-content: center;
`;

export const AnimatedDataRowsGroup = styled(Animated.View)`
    min-height: ${({ $compact }) => ($compact ? "125px" : "146px")};
    justify-content: center;
`;

export const DataRow = styled.View`
    flex-direction: row;
    align-items: center;
    width: 100%;
    border-bottom-width: ${({ $withDivider }) => ($withDivider ? "1px" : "0px")};
    border-bottom-color: #f0d9c8;
    min-height: ${({ $compact, $isLocation }) =>
        getRowMinHeight({ $compact, $isLocation })};
    margin-top: ${({ $compact, $isLocation }) =>
        getRowMarginTop({ $compact, $isLocation })};
`;

export const IconContainer = styled.View`
    width: ${({ $compact }) => ($compact ? "20px" : "24px")};
    height: ${({ $compact }) => ($compact ? "20px" : "24px")};
    justify-content: center;
    align-items: center;
`;

export const ShrimpMiniIcon = styled.Image`
    width: ${({ $compact }) => ($compact ? "14px" : "16px")};
    height: ${({ $compact }) => ($compact ? "14px" : "16px")};
`;

export const LabelText = styled.Text`
    min-width: ${({ $compact }) => ($compact ? "68px" : "78px")};
    max-width: 45%;
    flex-shrink: 0;
    font-size: ${({ theme, $compact }) => theme.size.fontSize($compact ? 11 : 12)};
    color: #6f6f6f;
    margin-left: 5px;
`;

export const ValueText = styled.Text`
    flex: 1;
    min-width: 0px;
    font-size: ${({ theme, $fontSize }) =>
        theme.size.fontSize($fontSize ?? 15)};
    line-height: ${({ $compact }) => ($compact ? "18px" : "22px")};
    font-weight: bold;
    color: #333;
    text-align: right;
    flex-wrap: wrap;
`;

export const ActionButton = styled.TouchableOpacity`
    width: 100%;
    height: ${({ $compact }) => ($compact ? "40px" : "44px")};
    background-color: transparent;
    border-width: 1.5px;
    border-color: #25d366;
    border-radius: 12px;
    justify-content: center;
    align-items: center;
    margin-top: ${({ $compact }) => ($compact ? "8px" : "10px")};
`;

export const ActionButtonContent = styled.View`
    flex-direction: row;
    align-items: center;
`;

export const ActionButtonText = styled.Text`
    color: #25d366;
    font-weight: bold;
    font-size: ${({ theme, $compact }) => theme.size.fontSize($compact ? 13 : 14)};
    margin-left: 6px;
`;
