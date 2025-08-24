import styled from "styled-components/native";
import { StyleSheet } from "react-native";
import { theme } from "../../../styles/Theme";

export const Container = styled.View`
    width: 100%;
`;

export const StylesSkeleton = StyleSheet.create({
    height: Number(theme.size.componentSize(400).replace("px", "")),
    margin: Number(theme.size.dimentionsSize(1.5).replace("px", "")),
    borderRadius: 4,
});
