/* eslint-disable max-len */
/* eslint-disable react/no-array-index-key */
import React from "react";
import { ActivityIndicator } from "react-native-paper";
import { View, Text } from "react-native";
import { useTheme } from "styled-components";
import { Feather } from "@expo/vector-icons";

import { useUsers } from "./useUsers";

import {
    ButtonListUsers,
    CardCountUser,
    CardCountUserUserType,
    Container,
    Content,
    ContentCardTypeUserCount,
    ContentLoading,
    TextCount,
    Title,
    TitleButton,
    TitleCard,
} from "./styles";
import { BoxShadowIos } from "../../../styles/IosShadow";
import { UserDivideList } from "../../../components/UserDivideList";

export const Users = ({ navigation }) => {
    const theme = useTheme();
    const {
        isLoading,
        listUsers,
        dataUsers,
        handleRedirectListUsers,
        handleRedirectProductorClientList,
        getUsersByUserType,
    } = useUsers({ navigation });

    const prodCount = getUsersByUserType(listUsers, "productor").length;
    const clientCount = getUsersByUserType(listUsers, "client").length;

    return (
        <Container>
            {isLoading ? (
                <ContentLoading>
                    <ActivityIndicator animating color={theme.colors.primary} size={50} />
                </ContentLoading>
            ) : (
                <Content>
                    <View style={{ marginBottom: 24, marginTop: 12 }}>
                        <Text style={{ fontSize: 28, fontWeight: "bold", color: "#1A1A1A" }}>Dashboard de Usuários</Text>
                        <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>Gerencie toda a rede da plataforma</Text>
                    </View>

                    <CardCountUser style={[BoxShadowIos, { backgroundColor: theme.colors.primary, borderRadius: 16, padding: 20 }]}>
                        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                            <View>
                                <TitleCard style={{ color: "rgba(255,255,255,0.8)" }}>Total da Base</TitleCard>
                                <TextCount style={{ color: "#FFF", fontSize: 32 }}>{listUsers.length}</TextCount>
                            </View>
                            <Feather name="users" size={48} color="rgba(255,255,255,0.3)" />
                        </View>
                    </CardCountUser>

                    <ContentCardTypeUserCount style={{ marginTop: 16 }}>
                        <CardCountUserUserType
                            style={[BoxShadowIos, {
                                borderRadius: 16, flex: 1, marginRight: 8, padding: 16, backgroundColor: "#FFF"
                            }]}
                            onPress={() =>
                                handleRedirectProductorClientList(
                                    getUsersByUserType(listUsers, "productor")
                                )
                            }
                        >
                            <View style={{
                                flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8
                            }}
                            >
                                <Feather name="anchor" size={20} color={theme.colors.primary} />
                            </View>
                            <TitleCard style={{ fontSize: 14, color: "#666" }}>Produtores</TitleCard>
                            <TextCount style={{ fontSize: 24, color: "#1A1A1A" }}>{prodCount}</TextCount>
                        </CardCountUserUserType>

                        <CardCountUserUserType
                            style={[BoxShadowIos, {
                                borderRadius: 16, flex: 1, marginLeft: 8, padding: 16, backgroundColor: "#FFF"
                            }]}
                            onPress={() =>
                                handleRedirectProductorClientList(
                                    getUsersByUserType(listUsers, "client")
                                )
                            }
                        >
                            <View style={{
                                flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8
                            }}
                            >
                                <Feather name="shopping-bag" size={20} color={theme.colors.primary} />
                            </View>
                            <TitleCard style={{ fontSize: 14, color: "#666" }}>Clientes</TitleCard>
                            <TextCount style={{ fontSize: 24, color: "#1A1A1A" }}>{clientCount}</TextCount>
                        </CardCountUserUserType>
                    </ContentCardTypeUserCount>

                    <ButtonListUsers
                        style={{ marginTop: 24, borderRadius: 12, paddingVertical: 14 }}
                        onPress={() => handleRedirectListUsers(listUsers)}
                    >
                        <TitleButton style={{ fontWeight: "bold" }}>Visualizar Lista Completa</TitleButton>
                    </ButtonListUsers>

                    <View style={{
                        marginTop: 32, marginBottom: 16, flexDirection: "row", alignItems: "center"
                    }}
                    >
                        <Feather name="map-pin" size={20} color="#1A1A1A" style={{ marginRight: 8 }} />
                        <Title style={{ margin: 0, fontSize: 18, color: "#1A1A1A" }}>Distribuição por Região</Title>
                    </View>

                    {dataUsers.map((dataUser, index) => (
                        <View key={`${dataUser.state}-${index}`} style={{ marginBottom: 12 }}>
                            <UserDivideList
                                listUsers={dataUser}
                                redirectAction={handleRedirectListUsers}
                            />
                        </View>
                    ))}
                </Content>
            )}
        </Container>
    );
};
