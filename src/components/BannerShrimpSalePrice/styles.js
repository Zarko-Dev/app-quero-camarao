import styled from "styled-components/native";
import { Animated } from "react-native";

export const BannerContainer = styled.TouchableOpacity`
    width: 100%;
    min-height: ${({ $compact }) => ($compact ? "162px" : "186px")};
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
    min-height: 122px;
    justify-content: center;
`;

export const AnimatedDataRowsGroup = styled(Animated.View)`
    min-height: ${({ $compact }) => ($compact ? "104px" : "122px")};
    justify-content: center;
`;

export const DataRow = styled.View`
    flex-direction: row;
    align-items: center;
    width: 100%;
    border-bottom-width: ${({ $withDivider }) => ($withDivider ? "1px" : "0px")};
    border-bottom-color: #f0d9c8;
    min-height: ${({ $compact, $isLocation }) =>
        $compact ? ($isLocation ? "36px" : "21px") : $isLocation ? "44px" : "24px"};
    margin-top: ${({ $compact, $isLocation }) =>
        $isLocation ? ($compact ? "2px" : "4px") : "0px"};
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
    width: ${({ $compact }) => ($compact ? "68px" : "78px")};
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
