import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { NavigationMenu } from "./navigationMenu";
import { dataRoutes, linking } from "./dataRoutes";

import { theme } from "../styles/Theme";

import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { UseTerms } from "../pages/UseTerms";
import { Publication } from "../pages/Publication";
import { Redirect } from "../pages/Redirect";
import { Camera } from "../pages/Camera";
import { Payment } from "../pages/Payment";
import { Address } from "../pages/Address";
import { RegisterDiscountCupom } from "../pages/RegisterDiscountCupom";
import { RestPassowrd } from "../pages/RestPassowrd";
import { PersonalData } from "../pages/PersonalData";
import { PaymentEnd } from "../pages/PaymentEnd";
import { PaymentWeb } from "../pages/PaymentWeb";
import { ValidateInvitation } from "../pages/ValidateInvitation";
import { RegisterMyAds } from "../pages/RegisterMyAds";
import { DeleteUser } from "../pages/DeleteUser";
import { DetailsTransactionPayment } from "../pages/Admin/DetailsTransactionPayment";
import { PublicationViewLogsList } from "../pages/Admin/PublicationViewLogsList";
import { UserDetailed } from "../pages/Admin/UserDetailed";
import { UserPublications } from "../pages/Admin/UserPublications";
import { UsersList } from "../pages/Admin/UsersList";
import { PublicationViewLogs } from "../pages/PublicationViewLogs";
import { QRCodePix } from "../pages/QRCodePix";
import { DrawPrizeHistory } from "../pages/Admin/DrawPrizeHistory";
import { ReceivedNotifications } from "../pages/ReceivedNotifications";
import { AdsList } from "../pages/AdsList";
import { UserProductorClientList } from "../pages/Admin/UserProductorClientList";
import { DrawPrizeLive } from "../pages/Admin/DrawPrizeLive";
import { DrawPrize } from "../pages/Admin/DrawPrize";
import { DrawPrizeNew } from "../pages/Admin/DrawPrize/DrawPrizeNew";
import { SaleShrimps } from "../pages/SaleShrimps";
import { SalesList } from "../pages/SalesList";
import { SplashScreen } from "../pages/SplashScreen";
import { DrawPrizeNewWinnerResult } from "../pages/Admin/DrawPrizeNewWinnerResult";
import { DrawPrizeWinnersResult } from "../pages/Admin/DrawPrizeWinnersResult";
import { PublicationChat } from "../pages/PublicationChat";
import { MyChats } from "../pages/MyChats";
import { UserProfile } from "../pages/UserProfile";
import { PublicationDetail } from "../pages/PublicationDetail";
import { CreateNewPassword } from "../pages/CreateNewPassword";

const { Navigator, Screen } = createNativeStackNavigator();

export const navigationRef = createNavigationContainerRef();

export const Routes = () => (
    <NavigationContainer ref={navigationRef} linking={linking}>
        <Navigator
            initialRouteName={dataRoutes.splash}
            screenOptions={{
                headerTintColor: "white",
                headerBackTitle: "",
            }}
        >
            <Screen
                name={dataRoutes.splash}
                component={SplashScreen}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.navigation}
                component={NavigationMenu}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.login}
                component={Login}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.register}
                component={Register}
                options={{
                    title: "Cadastro",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.useTerms}
                component={UseTerms}
                options={{
                    title: "Termos de uso",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.publication}
                component={Publication}
                options={{
                    title: "Publicar meu Camarão",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.redirect}
                component={Redirect}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.camera}
                component={Camera}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.payment}
                component={Payment}
                options={{
                    title: "Pagamento",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.address}
                component={Address}
                options={{
                    title: "Endereço",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.registerDiscountCupon}
                component={RegisterDiscountCupom}
                options={{
                    title: "Cadastrar Cupom",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.resetPassword}
                component={RestPassowrd}
                options={{
                    title: "Recuperar Senha",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.createNewPassword}
                component={CreateNewPassword}
                options={{
                    title: "Criar Nova Senha",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.personalData}
                component={PersonalData}
                options={{
                    title: "Meus Dados Pessoais",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.paymentWeb}
                component={PaymentWeb}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.paymentEnd}
                component={PaymentEnd}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.validateInvitation}
                component={ValidateInvitation}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.registerMyAds}
                component={RegisterMyAds}
                options={{
                    title: "Nova Publicidade",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.deleteUser}
                component={DeleteUser}
                options={{
                    title: "Não nos deixe!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.detailsTransactionPayment}
                component={DetailsTransactionPayment}
                options={{
                    title: "Detalhes da transação!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.publicationViewLogsList}
                component={PublicationViewLogsList}
                options={{
                    title: "Visualizar por Publicações!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.usersList}
                component={UsersList}
                options={{
                    title: "Usuários!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.userProductorClientList}
                component={UserProductorClientList}
                options={{
                    title: "Usuários!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.userDetailed}
                component={UserDetailed}
                options={{
                    title: "Detalhes do usuário!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.userPublications}
                component={UserPublications}
                options={{
                    title: "Publicações do usuário!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.publicationViewLogs}
                component={PublicationViewLogs}
                options={{
                    title: "Listagem de Visualizações!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.qrCodePix}
                component={QRCodePix}
                options={{
                    title: "Pagamento via PIX!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.drawPrizeNewWinnerResult}
                component={DrawPrizeNewWinnerResult}
                options={{
                    title: "Vencedores do Sorteio!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                    headerShown: false,
                }}
            />
            <Screen
                name={dataRoutes.admin.drawPrizeWinnerResult}
                component={DrawPrizeWinnersResult}
                options={{
                    title: "Vencedores do Sorteio!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                    headerShown: false,
                }}
            />
            <Screen
                name={dataRoutes.admin.drawPrizeHistory}
                component={DrawPrizeHistory}
                options={{
                    title: "Histórico de Sorteios!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.drawPrizeNew}
                component={DrawPrizeNew}
                options={{
                    title: "Sorteio!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.admin.drawPrizeLive}
                component={DrawPrizeLive}
                options={{
                    title: "Sorteio ao Vivo!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.receivedNotifications}
                component={ReceivedNotifications}
                options={{
                    title: "Minhas Notificações!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.adsList}
                component={AdsList}
                options={{
                    title: "Publicidades!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.salesShrimps}
                component={SaleShrimps}
                options={{
                    title: "Venda de Camarões!",
                    headerStyle: { backgroundColor: theme.colors.primary },
                    headerTitleStyle: { color: theme.colors.white },
                }}
            />
            <Screen
                name={dataRoutes.salesList}
                component={SalesList}
                options={{
                    headerShown: false,
                }}
            />
            <Screen
                name={dataRoutes.publicationChat}
                component={PublicationChat}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.myChats}
                component={MyChats}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.userProfile}
                component={UserProfile}
                options={{ headerShown: false }}
            />
            <Screen
                name={dataRoutes.publicationDetail}
                component={PublicationDetail}
                options={{ headerShown: false }}
            />
        </Navigator>
    </NavigationContainer>
);
