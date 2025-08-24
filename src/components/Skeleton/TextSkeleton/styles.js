import styled from "styled-components/native";
import { StyleSheet } from "react-native";

import { theme } from "../../../styles/Theme";

export const Container = styled.View``;

export const StylesSkeleton = StyleSheet.create({
    width: Number(theme.size.componentSize(100).replace("px", "")),
    height: Number(theme.size.componentSize(50).replace("px", "")),
    borderRadius: Number(theme.size.componentSize(50).replace("px", "")),
});

export const StylesTextSkeleton = StyleSheet.create({
    width: Number(theme.size.componentSize(60).replace("px", "")),
    height: Number(theme.size.componentSize(30).replace("px", "")),
    borderRadius: Number(theme.size.componentSize(30).replace("px", "")),
});
