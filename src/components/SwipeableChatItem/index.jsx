import { Swipeable } from "react-native-gesture-handler";
import { Feather } from "@expo/vector-icons";
import {
    ActionText,
    ActionsContainer,
    DeleteAction,
    MuteAction,
} from "./styles";

const SwipeableChatItem = ({
    children, onDelete, onMute, isMuted
}) => {
    const renderRightActions = () => (
        <ActionsContainer>
            <MuteAction onPress={onMute}>
                <Feather name={isMuted ? "volume-2" : "volume-x"} size={20} color="#fff" />
                <ActionText>{isMuted ? "Reativar" : "Silenciar"}</ActionText>
            </MuteAction>
            <DeleteAction onPress={onDelete}>
                <Feather name="trash-2" size={20} color="#fff" />
                <ActionText>Excluir</ActionText>
            </DeleteAction>
        </ActionsContainer>
    );

    return (
        <Swipeable
            renderRightActions={renderRightActions}
            rightThreshold={60}
            friction={2}
            overshootRight={false}
        >
            {children}
        </Swipeable>
    );
};

export default SwipeableChatItem;
