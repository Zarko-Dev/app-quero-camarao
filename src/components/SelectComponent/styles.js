import styled from "styled-components/native";

export const Container = styled.View``;

export const SelectButton = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(45)};

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 0 ${({ theme }) => theme.size.dimentionsSize(2.5)};
    border-radius: 4px;
    border: 1px ${({ theme }) => theme.colors.quaternary} solid;

    background-color: ${({ theme }) => theme.colors.inputColor};
    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
`;

export const TextButton = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};

    color: ${({ theme }) => theme.colors.black};
`;

export const HeaderContent = styled.View`
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 0 ${({ theme }) => theme.size.dimentionsSize(2)};

    background-color: #f1f1f1;
`;

export const ButtonHeader = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;
`;

export const HeaderTitle = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    margin-left: ${({ multipleSelect, theme }) =>
        multipleSelect.length > 0 ? 0 : theme.size.dimentionsSize(4)};
`;

export const CancelText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;
`;

export const Divider = styled.View`
    width: 100%;
    height: 1px;

    background-color: #c3c3c3;
`;

export const ContentSearchBar = styled.View`
    justify-content: flex-start;
    align-items: center;
    flex-direction: row;
`;

export const ButtonSelectAll = styled.TouchableOpacity`
    width: ${({ theme }) => theme.size.componentSize(80)};
    height: ${({ theme }) => theme.size.componentSize(40)};

    justify-content: center;
    align-items: center;
    flex-wrap: wrap;

    border-radius: 4px;
    border: 1px #a7a7a7 solid;

    background-color: #f0f0f0;
`;

export const TitleSelectAllButton = styled.Text`
    text-align: center;
    margin-left: ${({ remove, theme }) =>
        remove ? theme.size.dimentionsSize(3) : theme.size.dimentionsSize(2)};
`;

export const ButtonOption = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(35)};

    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 0 ${({ theme }) => theme.size.dimentionsSize(2)};
`;

export const ButtonOptionText = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(15)};
`;

export const DividerOptions = styled(Divider)`
    background-color: #e1e1e1;
`;
