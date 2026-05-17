import { Text } from "react-native";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    justify-content: flex-start;
    align-items: center;
    padding: 10px;
    background-color: #ffffff;
`;

export const Toolbar = styled.View`
    width: 100%;
    flex-direction: row;
    align-items: center;
    margin-bottom: 8px;
`;

export const SearchWrap = styled.View`
    flex: 1;
    margin-right: 8px;
`;

export const FilterButton = styled.TouchableOpacity`
    height: 44px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0 12px;
    border-radius: 8px;
    border-width: 1px;
    border-color: #ffd8c6;
    background-color: #ffffff;
`;

export const FilterText = styled(Text)`
    margin: 0 6px;
    font-size: ${({ theme }) => theme.size.fontSize(12)};
    font-weight: 600;
    color: ${({ theme }) => theme.colors.primary};
`;

export const ContentEmptyList = styled.View`
    width: 98%;
    height: ${({ theme }) => theme.size.componentSize(200)};

    justify-content: center;
    align-items: center;

    margin-top: ${({ theme }) => theme.size.dimentionsSize(1)};
    border-radius: 12px;
    border-width: 1px;
    border-color: #ececec;

    background-color: #ffffff;
`;

export const TitleEmptyList = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(14)};
    font-weight: bold;

    margin-bottom: ${({ theme }) => theme.size.dimentionsSize(1)};
    color: #4d4d4d;
`;
