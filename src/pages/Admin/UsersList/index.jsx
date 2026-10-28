/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-vars */
/* eslint-disable operator-linebreak */
/* eslint-disable function-paren-newline */
/* eslint-disable indent */

import { FlatList } from "react-native";
import { useState } from "react";
import { v4 } from "uuid";
import { Feather, FontAwesome } from "@expo/vector-icons";

import { dataRoutes } from "../../../routes/dataRoutes";
import { convertDate } from "../../../utils/convertDate";

import { SearchBar } from "../../../components/SearchBar";

import {
    ButtonGenerateXlsxFile,
    ButtonGeneratePdfFile,
    CardUser,
    Container,
    ContentData,
    ContentSearch,
    ContentUserInfo,
    ContentWhatsapp,
    InfoRow,
    UserDate,
    UserImage,
    UserName,
} from "./styles";
import { BoxShadowIos } from "../../../styles/IosShadow";
import { truncateName } from "../../../utils/truncateName";
import { redirectWhatsappLink } from "../../../utils/redirectFunctions";
import { formatphone } from "../../../utils/formatPhone";
import { generateXlsxFile } from "../../../utils/generateXlsxFile";
import { generatePdfFile } from "../../../utils/generatePdfFile";

export const UsersList = ({ navigation, route }) => {
    const [dataUsers] = useState(
        route.params.dataListUsers.map((item) => ({ ...item, listId: v4() })),
    );
    const noActions = route.params.noActions;
    const [searchValue, setSearchValue] = useState("");
    const [filterDataUsers, setFilterDataUsers] = useState([]);

    const handleSearchCupons = (value) => {
        setSearchValue(value);

        if (value !== "") {
            setFilterDataUsers(
                dataUsers.filter((data) =>
                    data.name.toLowerCase().includes(value.toLowerCase()),
                ),
            );
        } else {
            setFilterDataUsers([]);
        }
    };

    const handleRedirectUserDetailed = (dataUser) => {
        navigation.navigate(dataRoutes.admin.userDetailed, { dataUser });
    };

    const redirectWhatsapp = (contactNumber) => {
        const whatsappMessage =
            "Olá, venho através do aplicativo *Quero Camarão* 🦐";

        navigation.navigate(dataRoutes.redirect, {
            subtext:
                "Estamos lhe redirecionado ao whatsapp do produtor que selecionou",
            actionRediret: redirectWhatsappLink(
                `+55${contactNumber}`,
                whatsappMessage,
                navigation,
            ),
        });
    };

    const handleGetFile = () => {
        const users = [];

        dataUsers.forEach((item) => {
            users.push({
                Nome: item.name,
                Email: item.email,
                Telefone: item.phone,
                Estado: item?.address?.state ?? "Não informado",
                Cidade: item?.address?.city ?? "Não informado",
            });
        });

        generateXlsxFile(
            users,
            `Quero_Camarão_Listagem_Usuários_${new Date().toLocaleDateString().replace(/\//g, "-")}_${new Date().toLocaleTimeString().replace(/:/g, "-")}`,
        );
    };

    const handleGetPdf = () => {
        generatePdfFile(
            dataUsers,
            `Quero_Camarão_Listagem_Usuários_${new Date().toLocaleDateString().replace(/\//g, "-")}_${new Date().toLocaleTimeString().replace(/:/g, "-")}`
        );
    };

    const UserItem = ({ dataUser }) => (
        <CardUser
            style={BoxShadowIos}
            onPress={
                !noActions
                    ? () =>
                          dataUser.noDetail
                              ? redirectWhatsapp(formatphone(dataUser.contact))
                              : handleRedirectUserDetailed(dataUser)
                    : () => {}
            }
        >
            <ContentData>
                <UserImage
                    source={{
                        uri: dataUser?.userImage
                            ? dataUser.userImage
                            : `https://ui-avatars.com/api/?background=random&rounded=true&bold=true&size=200&name=${
                                  dataUser
                                      ? dataUser.name.split(" ")[0]
                                      : "camarao"
                              }`,
                    }}
                />
                    <ContentUserInfo>
                        <UserName>{truncateName(dataUser.name, 23)}</UserName>
                        {dataUser?.drawName ? (
                            <InfoRow>
                                <Feather name="award" size={12} color="#888" />
                                <UserDate>{dataUser.drawName}</UserDate>
                            </InfoRow>
                        ) : null}
                        <InfoRow>
                            <Feather name="map-pin" size={12} color="#888" />
                            <UserDate>
                                {dataUser?.address?.city ?? dataUser?.city ?? "—"}/
                                {dataUser?.address?.state ?? dataUser?.state ?? "—"}
                            </UserDate>
                        </InfoRow>
                        <InfoRow>
                            <Feather name="calendar" size={12} color="#888" />
                            <UserDate>
                                Desde: {convertDate(dataUser.createdAt, true)}
                            </UserDate>
                        </InfoRow>
                    </ContentUserInfo>
            </ContentData>
            {dataUser.noDetail && (
                <ContentWhatsapp>
                    <FontAwesome name="whatsapp" size={35} color="#128c7e" />
                </ContentWhatsapp>
            )}
        </CardUser>
    );

    return (
        <Container>
            <ContentSearch>
                {!noActions && (
                    <SearchBar
                        searchText={searchValue}
                        onChange={handleSearchCupons}
                        isLoadingSearch={false}
                    />
                )}
                {!noActions && (
                    <>
                        <ButtonGeneratePdfFile onPress={handleGetPdf}>
                            <Feather name="file-text" size={24} color="white" />
                        </ButtonGeneratePdfFile>
                        <ButtonGenerateXlsxFile onPress={handleGetFile}>
                            <Feather name="file" size={24} color="white" />
                        </ButtonGenerateXlsxFile>
                    </>
                )}
            </ContentSearch>
            <FlatList
                data={
                    filterDataUsers.length > 0 || searchValue !== ""
                        ? filterDataUsers
                        : dataUsers
                }
                renderItem={({ item }) => <UserItem dataUser={item} />}
                keyExtractor={(item) => item.listId}
            />
        </Container>
    );
};
