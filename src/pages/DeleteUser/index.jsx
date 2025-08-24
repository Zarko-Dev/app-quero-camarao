import { useRef, useState } from "react";
import LottieView from "lottie-react-native";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";

import {
    ClearUserStorage,
    GetUserStorage,
} from "../../services/Storage/UserStorage";
import {
    deleteUser,
    deleteUserImage,
    saveUserFeedback,
} from "../../controllers/User/deleteUser";
import { dataRoutes } from "../../routes/dataRoutes";
import { LoginActions } from "../Login/actions";

import { Input } from "../../components/Input";
import { DialogComponent } from "../../components/Dialog";

import lottieCrying from "../../assets/lotties/lottieCrying.json";

import {
    AlertText,
    ButtonDelete,
    Container,
    Content,
    TextButton,
    Title,
} from "./styles";

export const DeleteUser = ({ navigation }) => {
    const animation = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState("");
    const [dialogVisible, setDialogVisible] = useState(false);

    const deleteAsyncUser = async () => {
        const dispatch = useDispatch();

        const dataUser = await GetUserStorage();

        if (dataUser.userImage !== "") {
            const image = dataUser.userImage
                .split("user%2F")[1]
                .split("?alt=")[0];

            await deleteUserImage(image);
        }

        const resultDeleteUser = await deleteUser(dataUser.email);

        if (resultDeleteUser) {
            if (feedback !== "") {
                await saveUserFeedback(feedback, dataUser.name);
            }

            await ClearUserStorage();

            dispatch({ type: LoginActions.NOT_AUTEHNTICATED_ACTION });

            Toast.show({
                type: "success",
                text1: "Usuário desvinculado da QUero Camarão!",
                text2: "Sentiremos sua falta!",
            });

            navigation.navigate(dataRoutes.navigation);
        } else {
            Toast.show({
                type: "error",
                text1: "Não conseguimos excluir seu usuário!",
                text2: "Entre em contato com a gente através do canal de ajuda!",
            });

            navigation.navigate(dataRoutes.help);
        }
    };

    const handleDeleteUser = () => {
        setDialogVisible(false);
        setIsLoading(true);

        deleteAsyncUser()
            .then()
            .catch()
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <Container>
            <Content>
                <LottieView
                    autoPlay
                    ref={animation}
                    style={{
                        width: 300,
                        height: 300,
                        marginTop: -25,
                    }}
                    source={lottieCrying}
                />
                <Title>
                    {"     "}A Quero Camarão sente muito em ver você partir. Nós
                    valorizamos muito a sua presença e experiência conosco. Se
                    você tiver algum feedback ou preocupação, estamos aqui para
                    ouvir. Esperamos que você volte em breve. Até logo!
                </Title>

                <Input
                    label="Deixe seu comentário (Opcional)"
                    onChange={setFeedback}
                    value={feedback}
                    autoCapitalize="sentences"
                    multiline={5}
                />

                <ButtonDelete onPress={() => setDialogVisible(true)}>
                    {!isLoading ? (
                        <TextButton>Desvincular Usuário</TextButton>
                    ) : (
                        <ActivityIndicator animating color="white" />
                    )}
                </ButtonDelete>

                <AlertText>
                    Atenção: Lamentamos vê-lo partir. Após a exclusão da conta,
                    seus dados serão apagados permanentemente.
                </AlertText>
            </Content>
            <DialogComponent
                visible={dialogVisible}
                title="Atenção"
                text="Sua conta será desvinculada da Quero Camarão, deseja realmente desvincular seu usuário?"
                textActionButton="Desvincular Usuário"
                hideDialog={() => setDialogVisible(false)}
                actionButton={() => handleDeleteUser()}
                dismissable={false}
            />
        </Container>
    );
};
