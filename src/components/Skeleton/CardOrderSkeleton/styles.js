import styled from "styled-components/native";
import { StyleSheet } from "react-native";
import { theme } from "../../../styles/Theme";

export const Container = styled.View`
    width: 100%;
`;

export const StylesSkeleton = StyleSheet.create({
    height: Number(theme.size.componentSize(155).replace("px", "")),
    marginTop: Number(theme.size.dimentionsSize(1.5).replace("px", "")),
    marginBottom: Number(theme.size.dimentionsSize(1.5).replace("px", "")),
    borderRadius: 4,
});

export const StylesTextSkeleton = StyleSheet.create({
    width: Number(theme.size.componentSize(105).replace("px", "")),
    height: Number(theme.size.componentSize(30).replace("px", "")),
    borderRadius: Number(theme.size.componentSize(30).replace("px", "")),
});
