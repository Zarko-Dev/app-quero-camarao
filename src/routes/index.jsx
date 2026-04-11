import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { dataRoutes, linking } from "./dataRoutes";

import { theme } from "../styles/Theme";

const { Navigator, Screen } = createNativeStackNavigator();

export const Routes = () => (
    <NavigationContainer linking={linking}>
        <Navigator
            initialRouteName={dataRoutes.splash}
            screenOptions={{
                headerTintColor: "white",
            }}
        >
            <Screen
                name={dataRoutes.splash}
                getComponent={() =>
                    require("../pages/SplashScreen").SplashScreen
                }
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.navigation}
                getComponent={() => require("./navigationMenu").NavigationMenu}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.login}
                getComponent={() => require("../pages/Login").Login}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.register}
                getComponent={() => require("../pages/Register").Register}
                options={{
                    title: "Cadastro",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.useTerms}
                getComponent={() => require("../pages/UseTerms").UseTerms}
                options={{
                    title: "Termos de uso",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.publication}
                getComponent={() => require("../pages/Publication").Publication}
                options={{
                    title: "Publicar meu Camarão",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.redirect}
                getComponent={() => require("../pages/Redirect").Redirect}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.camera}
                getComponent={() => require("../pages/Camera").Camera}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.payment}
                getComponent={() => require("../pages/Payment").Payment}
                options={{
                    title: "Pagamento",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.address}
                getComponent={() => require("../pages/Address").Address}
                options={{
                    title: "Endereço",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.registerDiscountCupon}
                getComponent={() =>
                    require("../pages/RegisterDiscountCupom")
                        .RegisterDiscountCupom
                }
                options={{
                    title: "Cadastrar Cupom",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.resetPassword}
                getComponent={() =>
                    require("../pages/RestPassowrd").RestPassowrd
                }
                options={{
                    title: "Recuperar Senha",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.personalData}
                getComponent={() =>
                    require("../pages/PersonalData").PersonalData
                }
                options={{
                    title: "Meus Dados Pessoais",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.paymentWeb}
                getComponent={() => require("../pages/PaymentWeb").PaymentWeb}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.paymentEnd}
                getComponent={() => require("../pages/PaymentEnd").PaymentEnd}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.validateInvitation}
                getComponent={() =>
                    require("../pages/ValidateInvitation").ValidateInvitation
                }
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.registerMyAds}
                getComponent={() =>
                    require("../pages/RegisterMyAds").RegisterMyAds
                }
                options={{
                    title: "Nova Publicidade",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.deleteUser}
                getComponent={() => require("../pages/DeleteUser").DeleteUser}
                options={{
                    title: "Não nos deixe!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.detailsTransactionPayment}
                getComponent={() =>
                    require("../pages/Admin/DetailsTransactionPayment")
                        .DetailsTransactionPayment
                }
                options={{
                    title: "Detalhes da transação!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.publicationViewLogsList}
                getComponent={() =>
                    require("../pages/Admin/PublicationViewLogsList")
                        .PublicationViewLogsList
                }
                options={{
                    title: "Visualizar por Publicações!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.usersList}
                getComponent={() =>
                    require("../pages/Admin/UsersList").UsersList
                }
                options={{
                    title: "Usuários!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.userProductorClientList}
                getComponent={() =>
                    require("../pages/Admin/UserProductorClientList")
                        .UserProductorClientList
                }
                options={{
                    title: "Usuários!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.userDetailed}
                getComponent={() =>
                    require("../pages/Admin/UserDetailed").UserDetailed
                }
                options={{
                    title: "Detalhes do usuário!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.userPublications}
                getComponent={() =>
                    require("../pages/Admin/UserPublications").UserPublications
                }
                options={{
                    title: "Publicações do usuário!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.publicationViewLogs}
                getComponent={() =>
                    require("../pages/PublicationViewLogs").PublicationViewLogs
                }
                options={{
                    title: "Listagem de Visualizações!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.qrCodePix}
                getComponent={() => require("../pages/QRCodePix").QRCodePix}
                options={{
                    title: "Pagamento via PIX!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.drawPrizeNewWinnerResult}
                getComponent={() =>
                    require("../pages/Admin/DrawPrizeNewWinnerResult")
                        .DrawPrizeNewWinnerResult
                }
                options={{
                    title: "Vencedores do Sorteio!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                    headerShown: false,
                }}
            />
            <Screen
                name={dataRoutes.admin.drawPrizeWinnerResult}
                getComponent={() =>
                    require("../pages/Admin/DrawPrizeWinnersResult")
                        .DrawPrizeWinnersResult
                }
                options={{
                    title: "Vencedores do Sorteio!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                    headerShown: false,
                }}
            />
            <Screen
                name={dataRoutes.admin.drawPrizeHistory}
                getComponent={() =>
                    require("../pages/Admin/DrawPrizeHistory").DrawPrizeHistory
                }
                options={{
                    title: "Histórico de Sorteios!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.drawPrizeNew}
                getComponent={() =>
                    require("../pages/Admin/DrawPrize/DrawPrizeNew").DrawPrizeNew
                }
                options={{
                    title: "Sorteio!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.drawPrizeLive}
                getComponent={() =>
                    require("../pages/Admin/DrawPrizeLive").DrawPrizeLive
                }
                options={{
                    title: "Sorteio ao Vivo!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.receivedNotifications}
                getComponent={() =>
                    require("../pages/ReceivedNotifications")
                        .ReceivedNotifications
                }
                options={{
                    title: "Minhas Notificações!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.adsList}
                getComponent={() => require("../pages/AdsList").AdsList}
                options={{
                    title: "Publicidades!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.salesShrimps}
                getComponent={() => require("../pages/SaleShrimps").SaleShrimps}
                options={{
                    title: "Venda de Camarões!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.salesList}
                getComponent={() => require("../pages/SalesList").SalesList}
                options={{
                    title: "Camarões Vendidos!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
        </Navigator>
    </NavigationContainer>
);
