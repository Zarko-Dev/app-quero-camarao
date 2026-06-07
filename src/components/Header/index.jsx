import { Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useUnreadChatsCount } from "../../hooks/useUnreadChatsCount";
import { dataRoutes } from "../../routes/dataRoutes";
import logo from "../../assets/images/logo.png";
import {
    ChatBadge,
    ChatButton,
    Container,
    LogoImage,
    MenuButton,
    RightSpacer,
} from "./styles";

export const Header = (props) => {
    const { navigation } = props;
    const loginState = useSelector((state) => state.login);
    const unreadCount = useUnreadChatsCount();

    const handleOpenDrawer = () => navigation.openDrawer();
    const handleOpenChats = () => navigation.navigate(dataRoutes.myChats);

    const isAuthenticated = loginState?.isAuthenticated ?? false;

    return (
        <Container>
            <MenuButton onPress={handleOpenDrawer}>
                <Feather name="menu" size={24} color="white" />
            </MenuButton>
            <LogoImage source={logo} />
            {isAuthenticated ? (
                <ChatButton onPress={handleOpenChats}>
                    <Feather
                        name="message-circle"
                        size={24}
                        color="white"
                        style={{ position: "absolute" }}
                    />
                    <ChatBadge visible={unreadCount > 0} size={21}>
                        {unreadCount}
                    </ChatBadge>
                </ChatButton>
            ) : (
                <RightSpacer />
            )}
        </Container>
    );
};
