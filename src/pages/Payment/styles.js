import styled from "styled-components/native";
import { LinearGradient } from "expo-linear-gradient";

export const MainContainer = styled.View`
    flex: 1;
    background-color: #f7f7f7;
`;

export const ScreenHeader = styled(LinearGradient).attrs({
    colors: ["#e85d22", "#ff8f5a"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
})`
    padding: 60px 20px 20px 20px;
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 5px;
    z-index: 10;
`;

export const BackButtonPill = styled.TouchableOpacity`
    background-color: #fff;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    border-radius: 18px;
`;

export const BackButtonText = styled.Text`
    color: #e85d22;
    font-weight: bold;
    font-size: 14px;
    margin-left: 6px;
`;

export const HeaderTitleText = styled.Text`
    color: #fff;
    font-weight: bold;
    font-size: 18px;
    flex: 1;
    text-align: right;
`;

export const Container = styled.View`
    flex: 1;
    justify-content: space-between;
    padding: 10px;
`;

export const Content = styled.ScrollView``;

export const ContentResume = styled.View``;

