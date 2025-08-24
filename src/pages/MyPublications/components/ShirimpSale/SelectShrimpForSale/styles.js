import styled from "styled-components/native";

export const Container = styled.View`
    flex: 1;
`;

export const Header = styled.View`
    justify-content: space-between;
    align-items: center;
    flex-direction: row;

    padding: 10px;
`;

export const TitleHeader = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;
    color: ${({ theme }) => theme.colors.black};
`;

export const ButtonClose = styled.TouchableOpacity`
    padding: 5px;
`;

export const TitleButtonClose = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: bold;

    color: ${({ theme }) => theme.colors.primary};
`;

export const Divider = styled.View`
    height: 1px;
    background-color: gray;
`;

export const CardShrimp = styled.View`
    padding: 20px 10px;

    justify-content: center;
    align-items: center;
`;

export const ButtonCardShrimp = styled.TouchableOpacity`
    width: 100%;
    height: ${({ theme }) => theme.size.componentSize(80)};

    justify-content: center;
    align-items: center;
    border-radius: 30px;

    background-color: ${({ theme, selected }) =>
        selected ? theme.colors.primary : theme.colors.white};
    border: 3px solid ${({ theme }) => theme.colors.primary};

    elevation: 3;
`;

export const TitleCardShrimp = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    color: ${({ theme, selected }) =>
        selected ? theme.colors.white : theme.colors.black};
`;

export const ButtonNextStep = styled.TouchableOpacity`
    height: ${({ theme }) => theme.size.componentSize(50)};

    justify-content: center;
    align-items: center;
    flex-direction: row;
    gap: 30px;
    margin: 10px;

    border-radius: 10px;

    background-color: ${({ theme }) => theme.colors.primary};
    opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

    elevation: 3;
`;

export const TitleButtonNextStep = styled.Text`
    font-size: ${({ theme }) => theme.size.fontSize(16)};
    font-weight: bold;

    margin-left: ${({ theme }) => theme.size.dimentionsSize(4)};

    color: ${({ theme }) => theme.colors.white};
`;
