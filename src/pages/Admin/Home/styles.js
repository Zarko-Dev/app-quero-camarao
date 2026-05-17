import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: #efefef;

    justify-content: flex-start;
    align-items: center;

    padding: 12px 12px 0 12px;
`;

export const UserSubtitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
`;

export const ContainerDropdownSelects = styled.View`
    width: 100%;

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(0.5)};
`;

export const ContentInputSelect = styled.View`
    width: 48%;
`;

export const ContainerCardInfoValue = styled.View`
    width: 100%;
    border-radius: 14px;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    overflow: hidden;

    elevation: 3;
`;

export const ContentYearlyInfo = styled.View`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
`;

export const ContentTextYearlyInfo = styled.View``;

export const TitleYearlyInfo = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #ffe8d3;
`;

export const SubtitleYearlyInfo = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(36)};
    font-weight: bold;
    color: #ffffff;
`;

export const ImageYearlyInfo = styled.Image`
    width: ${({ theme }) => theme.size.componentSize(50)};
    height: ${({ theme }) => theme.size.componentSize(50)};
`;

export const ContentMonthInfo = styled.View`
    justify-content: flex-start;
    align-items: flex-start;
    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    padding-top: 14px;
    border-top-width: 1px;
    border-top-color: #f39a54;
`;

export const ContentTextMonthInfo = styled.View`
    justify-content: flex-start;
`;

export const TitleMonthInfo = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #ffe8d3;
`;

export const SubtitleMonthInfo = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(26)};
    font-weight: bold;
    color: #ffffff;
    text-align: left;
`;

export const ContainerValueMonth = styled.View`
    width: 100%;
    padding: 14px 18px;
    border-radius: 14px;
    background-color: #f8f8f8;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    column-gap: 12px;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(2)};
    border-width: 1px;
    border-color: #e0e0e0;
`;

export const ContentTextLeft = styled.View``;

export const TitleLastMoth = styled(TitleYearlyInfo)`
    text-align: ${({ align }) => (align ? "right" : "left")};
    color: #8b8b8b;
`;

export const TitleNextMoth = styled(SubtitleYearlyInfo)`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    color: #2f2f2f;
`;

export const Divider = styled.View`
    width: 1px;
    height: 100%;

    background-color: #dddddd;
`;

export const ContentTextRight = styled.View`
    align-items: flex-end;
    flex: 1;
`;

export const TitleTransaction = styled.Text`
    width: 100%;
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;
    color: #2a2a2a;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
`;

export const TransactionHeader = styled.View`
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

export const FilterButton = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    background-color: #f8f8f8;
    border-width: 1px;
    border-color: #dddddd;
    border-radius: 8px;
    padding: 7px 10px;
`;

export const FilterText = styled.Text`
    color: #666666;
    margin-left: 6px;
    font-size: ${({ theme }) => theme.size.fontSize(13)};
`;
