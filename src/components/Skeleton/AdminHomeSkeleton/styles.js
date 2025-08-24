import styled from "styled-components/native";
import { StyleSheet } from "react-native";
import { theme as styleTheme } from "../../../styles/Theme";

export const Container = styled.View`
    width: ${({ theme, dataWidth }) =>
        dataWidth ? theme.size.componentSize(dataWidth) : "100%"};
`;

export const ContainerRight = styled.View`
    width: ${({ theme, dataWidth }) =>
        dataWidth ? theme.size.componentSize(dataWidth) : "100%"};

    padding-left: 50px;
`;

export const StylesAdminHomeSelectDropdownSkeleton = StyleSheet.create({
    width: Number(styleTheme.size.componentSize(120).replace("px", "")),
    height: Number(styleTheme.size.componentSize(50).replace("px", "")),
    borderRadius: Number(styleTheme.size.componentSize(10).replace("px", "")),
});

export const StylesAdminHomecardValueSkeleton = StyleSheet.create({
    width: "100%",
    height: Number(styleTheme.size.componentSize(160).replace("px", "")),
    marginTop: Number(styleTheme.size.dimentionsSize(3).replace("px", "")),
    borderRadius: Number(styleTheme.size.componentSize(10).replace("px", "")),
});

export const StylesAdminHomeTitleValueMonthSkeleton = StyleSheet.create({
    width: Number(styleTheme.size.componentSize(80).replace("px", "")),
    height: Number(styleTheme.size.componentSize(18).replace("px", "")),
    borderRadius: Number(styleTheme.size.componentSize(18).replace("px", "")),
    marginBottom: Number(styleTheme.size.dimentionsSize(1).replace("px", "")),
});

export const StylesAdminHomeTitleValueMonthRightSkeleton = StyleSheet.create({
    width: Number(styleTheme.size.componentSize(80).replace("px", "")),
    height: Number(styleTheme.size.componentSize(18).replace("px", "")),
    borderRadius: Number(styleTheme.size.componentSize(18).replace("px", "")),
    marginBottom: Number(styleTheme.size.dimentionsSize(1).replace("px", "")),
});

export const StylesAdminHomeValueMonthSkeleton = StyleSheet.create({
    width: Number(styleTheme.size.componentSize(130).replace("px", "")),
    height: Number(styleTheme.size.componentSize(15).replace("px", "")),
    borderRadius: Number(styleTheme.size.componentSize(15).replace("px", "")),
    marginBottom: Number(styleTheme.size.dimentionsSize(1).replace("px", "")),
});

export const StylesAdminHomeTitleTransactionSkeleton = StyleSheet.create({
    width: Number(styleTheme.size.componentSize(180).replace("px", "")),
    height: Number(styleTheme.size.componentSize(25).replace("px", "")),
    borderRadius: Number(styleTheme.size.componentSize(25).replace("px", "")),
    marginTop: Number(styleTheme.size.dimentionsSize(2).replace("px", "")),
    marginBottom: Number(styleTheme.size.dimentionsSize(1.5).replace("px", "")),
});

export const StylesAdminHomeTransactionsSkeleton = StyleSheet.create({
    width: "100%",
    height: Number(styleTheme.size.componentSize(50).replace("px", "")),
    borderRadius: Number(styleTheme.size.componentSize(25).replace("px", "")),
    marginTop: Number(styleTheme.size.dimentionsSize(1).replace("px", "")),
});
