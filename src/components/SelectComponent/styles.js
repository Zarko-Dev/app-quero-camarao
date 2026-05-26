import styled from "styled-components/native";

export const Container = styled.View`
    margin-bottom: 4px;
`;

export const SelectButton = styled.TouchableOpacity`
    width: 100%;
    min-height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 0 16px;
    border-radius: 12px;
    border-width: 1.5px;
    border-color: ${({ disabled, theme }) =>
        disabled ? "#ddd" : theme.colors.primary};

    background-color: ${({ disabled }) => (disabled ? "#f9f9f9" : "#fff7f2")};
    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

    elevation: 1;
    shadow-color: #000;
    shadow-offset: 0px 1px;
    shadow-opacity: 0.06;
    shadow-radius: 3px;
`;

export const TextButton = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: ${({ theme }) => theme.colors.black};
    flex: 1;
    margin-right: 8px;
`;

export const BadgeCount = styled.View`
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: 12px;
    padding: 2px 8px;
    margin-right: 8px;
`;

export const BadgeCountText = styled.Text`
    color: #fff;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;
`;

export const HeaderContent = styled.View`
    height: ${({ theme }) => theme.size.componentSize(56)};

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 0 16px;

    background-color: ${({ theme }) => theme.colors.primary};
`;

export const ButtonHeader = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(56)};
    padding: 0 4px;
    justify-content: center;
    align-items: center;
`;

export const HeaderTitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;
    color: #fff;
    flex: 1;
    text-align: center;
`;

export const CancelText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;
    color: #fff;
`;

export const Divider = styled.View`
    width: 100%;
    height: 1px;
    background-color: #e0e0e0;
`;

export const ContentSearchBar = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
    padding: 8px 12px;
    background-color: #fafafa;
    border-bottom-width: 1px;
    border-bottom-color: #ececec;
`;

export const ButtonSelectAll = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(36)};
    padding: 0 10px;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    background-color: ${({ remove, theme }) =>
        remove ? "#f0f0f0" : theme.colors.primary};
    margin-left: 8px;
    margin-right: 4px;
    flex-shrink: 0;
`;

export const TitleSelectAllButton = styled.Text`
    text-align: center;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;
    color: ${({ remove }) => (remove ? "#555" : "#fff")};
`;

export const ButtonOption = styled.TouchableOpacity`
    min-height: ${({ theme }) => theme.size.componentSize(58)};
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
    padding: 10px 16px;
    background-color: ${({ selected }) => selected ? "#fff3ee" : "#fff"};
`;

export const ButtonOptionText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    color: ${({ selected, theme }) =>
        selected ? theme.colors.primary : "#333"};
    font-weight: ${({ selected }) => (selected ? "600" : "400")};
    flex: 1;
    margin-right: 8px;
`;

export const DividerOptions = styled(Divider)`
    background-color: #f0f0f0;
`;
