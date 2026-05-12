import styled from "styled-components/native";

export const Container = styled.View`
    flex: 1;
    background-color: #f5f5f5;
`;

export const ScreenHeader = styled.View`
    background-color: #e85d22;
    padding: 10px 15px 15px 15px;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
`;

export const HeaderTopRow = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    margin-top: 5px;
`;

export const HeaderTitleContainer = styled.View`
    flex: 1;
    margin-left: 10px;
`;

export const HeaderTitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    font-weight: bold;
    color: #fff;
`;

export const HeaderSubtitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #fff;
    opacity: 0.9;
`;

export const ProfileIconContainer = styled.View`
    width: 38px;
    height: 38px;
    border-radius: 19px;
    background-color: #fff;
    justify-content: center;
    align-items: center;
    overflow: hidden;
`;

export const ShrimpIconHeader = styled.Image`
    width: 24px;
    height: 24px;
`;

export const SearchContainer = styled.View`
    background-color: #fff;
    border-radius: 10px;
    flex-direction: row;
    align-items: center;
    padding: 0 12px;
    height: 44px;
    margin-bottom: 12px;
`;

export const SearchInput = styled.TextInput`
    flex: 1;
    margin-left: 8px;
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: #333;
`;

export const FilterContainer = styled.ScrollView.attrs({
    horizontal: true,
    showsHorizontalScrollIndicator: false,
})`
    flex-direction: row;
`;

export const FilterChip = styled.TouchableOpacity`
    background-color: ${({ active }) =>
        active ? "#fff" : "rgba(255, 255, 255, 0.3)"};
    padding: 8px 16px;
    border-radius: 20px;
    margin-right: 10px;
    flex-direction: row;
    align-items: center;
`;

export const FilterChipText = styled.Text`
    color: ${({ active }) =>
        active ? "#e85d22" : "#fff"};
    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(13)};
`;

export const CardItemSale = styled.View`
    width: 92%;
    align-self: center;
    margin-top: 12px;
    border-radius: 18px;
    background-color: #FEF5ED;
    overflow: hidden;
    elevation: 3;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.1;
    shadow-radius: 6px;
    margin-bottom: 5px;
`;

export const CardHeader = styled.View`
    background-color: #e85d22;
    padding: 8px 15px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

export const CardHeaderInfo = styled.View`
    flex-direction: row;
    align-items: center;
    flex: 1;
`;

export const LocationTextContainer = styled.View`
    margin-left: 10px;
`;

export const TitleHeader = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(17)};
    font-weight: bold;
    color: #fff;
`;

export const SubtitleHeader = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(11)};
    color: #fff;
    opacity: 0.9;
`;

export const ProntoBadge = styled.View`
    background-color: #fff;
    padding: 4px 10px;
    border-radius: 15px;
    flex-direction: row;
    align-items: center;
`;

export const ProntoBadgeText = styled.Text`
    color: #e85d22;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;
    margin-left: 4px;
`;

export const Body = styled.View`
    padding: 15px;
`;

export const PondRow = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
`;

export const GrammagePill = styled.View`
    background-color: #e85d22;
    padding: 6px 20px;
    border-radius: 10px;
`;

export const GrammageText = styled.Text`
    color: #fff;
    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(18)};
`;

export const DottedLine = styled.View`
    flex: 1;
    height: 1px;
    border-style: dotted;
    border-width: 1px;
    border-color: #B0B0B0;
    margin: 0 10px;
`;

export const RowWeightText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    font-weight: bold;
    color: #1A1A1A;
`;

export const RowText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(13)};
    color: #666;
`;

export const InfoSection = styled.View`
    align-items: center;
`;

export const DespescaContainer = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 10px;
`;

export const TitleDespesca = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;
    color: #1A1A1A;
    margin-left: 6px;
`;

export const HorizontalLine = styled.View`
    width: 100%;
    height: 1px;
    background-color: #E0E0E0;
    margin-bottom: 10px;
`;

export const TableSection = styled.View`
    width: 100%;
`;

export const TableTitleContainer = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
`;

export const TitleLine = styled.View`
    flex: 1;
    height: 1px;
    background-color: #D0D0D0;
`;

export const TableTitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;
    color: #1A1A1A;
    margin: 0 10px;
`;

export const TableContainer = styled.View`
    border-width: 1px;
    border-color: #F0D0B0;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 12px;
`;

export const TableHeader = styled.View`
    flex-direction: row;
    border-bottom-width: 1px;
    border-bottom-color: #F0D0B0;
`;

export const TableRow = styled.View`
    flex-direction: row;
`;

export const TableCol = styled.View`
    flex: 1;
    padding: 8px;
    align-items: center;
    justify-content: center;
    border-right-width: ${({ noBorder }) => (noBorder ? "0px" : "1px")};
    border-right-color: #F0D0B0;
`;

export const HeaderText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    color: #757575;
    text-transform: lowercase;
`;

export const TableText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(20)};
    font-weight: bold;
    color: #1A1A1A;
`;

export const Footer = styled.View`
    padding: 0 15px 15px 15px;
`;

export const ButtonChatProductor = styled.TouchableOpacity`
    background-color: #1a1a1a;
    height: 44px;
    border-radius: 12px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    elevation: 2;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.15;
    shadow-radius: 3px;
`;

export const ButtonText = styled.Text`
    color: #fff;
    font-weight: bold;
    font-size: ${({ theme }) => theme.size.fontSize(15)};
    margin-left: 10px;
`;
