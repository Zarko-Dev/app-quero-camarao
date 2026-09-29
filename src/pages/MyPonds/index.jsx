import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { GetUserStorage } from "../../services/Storage/UserStorage";
import { getUserPonds } from "../../controllers/PondTracker/getUserPonds";
import { createPond } from "../../controllers/PondTracker/createPond";
import { deletePond } from "../../controllers/PondTracker/deletePond";
import { dataRoutes } from "../../routes/dataRoutes";
import { DialogInputComponent } from "../../components/DialogInput";

import {
    Container,
    DeleteButton,
    EmptyCard,
    EmptyText,
    Grid,
    LoadingContainer,
    PondCard,
    PondCardHeader,
    PondName,
    PondWeekBadge,
    PondWeekBadgeText,
} from "./styles";

const MAX_PONDS = 10;

export const MyPonds = ({ navigation }) => {
    const [ponds, setPonds] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [newPondName, setNewPondName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                setIsLoading(true);
                const user = await GetUserStorage();
                if (!user) {
                    setIsLoading(false);
                    return;
                }
                setUserId(user.email);
                const result = await getUserPonds(user.email);
                if (!result.error) {
                    setPonds(result.data);
                }
                setIsLoading(false);
            };
            load();
        }, []),
    );

    const handleOpenDialog = () => {
        if (ponds.length >= MAX_PONDS) {
            Toast.show({
                type: "error",
                text1: "Limite atingido",
                text2: "Você já possui 10 viveiros cadastrados.",
            });
            return;
        }
        setDialogVisible(true);
    };

    const handleCreatePond = async () => {
        const name = newPondName.trim();
        if (!name) {
            Toast.show({ type: "error", text1: "Informe o nome do viveiro." });
            return;
        }
        setIsSaving(true);
        const result = await createPond(userId, name);
        if (!result.error) {
            setPonds((prev) => [
                ...prev,
                { id: result.id, userId, name, weeks: [] },
            ]);
            setDialogVisible(false);
            setNewPondName("");
        } else {
            Toast.show({
                type: "error",
                text1: "Erro ao criar viveiro.",
                text2: "Tente novamente.",
            });
        }
        setIsSaving(false);
    };

    const handleDeletePond = (pond) => {
        Alert.alert(
            "Excluir Viveiro",
            `Deseja excluir "${pond.name}"? Esta ação não pode ser desfeita.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        const result = await deletePond(pond.id);
                        if (!result.error) {
                            setPonds((prev) =>
                                prev.filter((p) => p.id !== pond.id),
                            );
                        } else {
                            Toast.show({
                                type: "error",
                                text1: "Erro ao excluir viveiro.",
                            });
                        }
                    },
                },
            ],
        );
    };

    const handleOpenPond = (pond) => {
        navigation.navigate(dataRoutes.pondDetail, { pond });
    };

    const emptyCount = Math.max(0, MAX_PONDS - ponds.length);
    const emptySlots = Array.from({ length: emptyCount }, (_, i) => i);

    if (isLoading) {
        return (
            <LoadingContainer>
                <ActivityIndicator animating size="large" color="#F05829" />
            </LoadingContainer>
        );
    }

    return (
        <Container>
            <Grid>
                {ponds.map((pond) => (
                    <PondCard key={pond.id} onPress={() => handleOpenPond(pond)}>
                        <PondCardHeader>
                            <DeleteButton
                                onPress={() => handleDeletePond(pond)}
                                hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                            >
                                <Feather
                                    name="trash-2"
                                    size={18}
                                    color="#f47575"
                                />
                            </DeleteButton>
                        </PondCardHeader>
                        <PondName numberOfLines={2}>{pond.name}</PondName>
                        <PondWeekBadge>
                            <PondWeekBadgeText>
                                {pond.weeks?.length ?? 0} sem. registradas
                            </PondWeekBadgeText>
                        </PondWeekBadge>
                    </PondCard>
                ))}
                {emptySlots.map((i) => (
                    <EmptyCard key={`empty-${i}`} onPress={handleOpenDialog}>
                        <Feather name="plus-circle" size={32} color="#F05829" />
                        <EmptyText>Criar Viveiro</EmptyText>
                    </EmptyCard>
                ))}
            </Grid>

            <DialogInputComponent
                visible={dialogVisible}
                hideDialog={() => {
                    setDialogVisible(false);
                    setNewPondName("");
                }}
                title="Novo Viveiro"
                text="Informe o nome do viveiro:"
                textActionButton={isSaving ? "Salvando..." : "Criar"}
                actionButton={handleCreatePond}
                inputValue={newPondName}
                actionInputValue={setNewPondName}
                dismissable={!isSaving}
            />
        </Container>
    );
};
