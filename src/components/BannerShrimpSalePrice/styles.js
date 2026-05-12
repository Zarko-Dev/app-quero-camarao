import styled from "styled-components/native";

export const BannerContainer = styled.TouchableOpacity`
    width: 100%;
    min-height: 186px;
    background-color: #fff7ee;
    border-radius: 16px;
    padding: 12px;
    border-width: 1px;
    border-color: #ffe2cc;
    elevation: 3;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.1;
    shadow-radius: 4px;
`;

export const BannerTitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.primary};
    text-align: center;
    margin-bottom: 10px;
`;

export const BannerBody = styled.View`
    width: 100%;
    flex-direction: row;
    align-items: stretch;
`;

export const ContentShirimpImage = styled.View`
    width: 116px;
    justify-content: center;
    align-items: center;
    padding-right: 10px;
`;

export const ShrimpImageCircle = styled.View`
    width: 112px;
    height: 112px;
    border-radius: 56px;
    background-color: #fff;
    border-width: 1px;
    border-color: #ffe2cc;
    justify-content: center;
    align-items: center;
`;

export const ShrimpImage = styled.Image`
    width: 95px;
    height: 95px;
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

export const DataRow = styled.View`
    flex-direction: row;
    align-items: center;
    width: 100%;
    border-bottom-width: ${({ $withDivider }) => ($withDivider ? "1px" : "0px")};
    border-bottom-color: #f0d9c8;
    min-height: ${({ $isLocation }) => ($isLocation ? "44px" : "24px")};
    margin-top: ${({ $isLocation }) => ($isLocation ? "4px" : "0px")};
`;

export const IconContainer = styled.View`
    width: 24px;
    height: 24px;
    justify-content: center;
    align-items: center;
`;

export const ShrimpMiniIcon = styled.Image`
    width: 16px;
    height: 16px;
`;

export const LabelText = styled.Text`
    width: 78px;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #6f6f6f;
    margin-left: 5px;
`;

export const ValueText = styled.Text`
    flex: 1;
    min-width: 0px;
    font-size: ${({ theme, $fontSize }) =>
        theme.size.fontSize($fontSize ?? 15)};
    line-height: 22px;
    font-weight: bold;
    color: #333;
    text-align: right;
    flex-wrap: wrap;
`;
