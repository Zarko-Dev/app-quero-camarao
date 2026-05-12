import { Text } from "react-native-paper";
import styled from "styled-components/native";

export const Container = styled.SafeAreaView`
    flex: 1;
    background-color: #fef5ed;
`;

export const ScreenHeader = styled.View`
    width: 100%;
    background-color: ${({ theme }) => theme.colors.primary};
    padding: 16px 20px 20px 20px;
    border-bottom-left-radius: 30px;
    border-bottom-right-radius: 30px;
`;

export const ContentSearchFilter = styled.View`
    width: 94%;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    align-self: center;
`;

export const SearchBarContainer = styled.View`
    width: 66%;
`;

export const FilterButton = styled.TouchableOpacity`
    background-color: #fff;
    width: 30%;
    height: 50px;
    border-radius: 12px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-width: 1px;
    border-color: #ffe2cc;
`;

export const FilterButtonText = styled.Text`
    color: ${({ theme }) => theme.colors.primary};
    font-weight: bold;
    margin-left: 8px;
    font-size: ${({ theme }) => theme.size.fontSize(16)};
`;

export const ContentInitialBanner = styled.View`
    width: 100%;
    padding: 0 15px;
    margin-top: -10px;
`;

export const PublicShrimpButton = styled.TouchableOpacity`
    width: 90%;
    height: 55px;
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: 15px;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    align-self: center;
    margin-bottom: 20px;
    elevation: 4;
    shadow-color: #000;
    shadow-offset: 0px 2px;
    shadow-opacity: 0.25;
    shadow-radius: 3.84px;
`;

export const ShrimpIcon = styled.Image`
    width: 30px;
    height: 30px;
    margin-right: 10px;
`;

export const TextButton = styled(Text)`
    font-size: ${({ theme }) => theme.size.fontSize(18)};
    font-weight: bold;
    color: #fff;
`;

export const ContentCardsList = styled.View`
    flex: 1;
    width: 100%;
`;
