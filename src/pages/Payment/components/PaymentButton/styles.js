import { Text } from "react-native-paper";
import styled from "styled-components/native";
import { LinearGradient } from "expo-linear-gradient";

export const Container = styled.TouchableOpacity`
    width: 100%;
    margin-top: 15px;
    border-radius: 12px;
    overflow: hidden;
    elevation: 3;
    margin-bottom: 30px;
`;

export const GradientBackground = styled(LinearGradient).attrs({
    colors: ["#ff7f3f", "#e85d22"],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
})`
    width: 100%;
    height: 56px;
    justify-content: center;
    align-items: center;
`;

export const TitleButton = styled(Text)`
    font-size: 18px;
    font-weight: bold;
    color: #ffffff;
`;
