import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { ActivityIndicator, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import {
    getAllActiveDrawPrizesLive,
    saveIndicatedParticipants,
} from "../../../controllers/DrawPrizes/live";
import { getDataUserByIds } from "../../../controllers/User/authentication";

import {
    CheckBox,
    Container,
    Content,
    DrawBadge,
    DrawBadgeText,
    DrawCard,
    DrawHeader,
    DrawTitle,
    EmptyText,
    HeaderSubtitle,
    HeaderTitle,
    LoadingWrap,
    ParticipantEmail,
    ParticipantItem,
    ParticipantName,
    SaveButton,
    SaveButtonText,
} from "./styles";

const DrawSection = ({ draw, onSaved }) => {
    const [expanded, setExpanded] = useState(true);
    const [participants, setParticipants] = useState([]);
    const [selected, setSelected] = useState(new Set(draw.indicatedParticipants ?? []));
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [saving, setSaving] = useState(false);

    useFocusEffect(
        useCallback(() => {
            const load = async () => {
                if (!draw.participants?.length) return;
                setLoadingParticipants(true);
                const users = await getDataUserByIds(draw.participants);
                setParticipants(
                    users.map((u) => ({
                        ...u,
                        createdAt: u.createdAt?.toDate?.() ?? u.createdAt,
                        updatedAt: u.updatedAt?.toDate?.() ?? u.updatedAt,
                    })),
                );
                setLoadingParticipants(false);
            };
            load();
        }, [draw.id]),
    );

    const toggleParticipant = (uid) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(uid)) next.delete(uid);
            else next.add(uid);
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        const ids = Array.from(selected);
        const ok = await saveIndicatedParticipants(draw.id, ids);
        setSaving(false);
        if (ok) {
            Toast.show({ type: "success", text1: "Indicados salvos com sucesso!" });
            onSaved?.();
        } else {
            Toast.show({ type: "error", text1: "Erro ao salvar indicados" });
        }
    };

    return (
        <DrawCard>
            <DrawHeader onPress={() => setExpanded((v) => !v)} activeOpacity={0.7}>
                <DrawTitle numberOfLines={1}>{draw.name || draw.code}</DrawTitle>
                <DrawBadge>
                    <DrawBadgeText>{draw.participants?.length ?? 0} part.</DrawBadgeText>
                </DrawBadge>
                <Feather
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color="#8fa3b2"
                    style={{ marginLeft: 8 }}
                />
            </DrawHeader>

            {expanded && (
                <>
                    {loadingParticipants ? (
                        <View style={{ padding: 16, alignItems: "center" }}>
                            <ActivityIndicator color="#f55b1f" />
                        </View>
                    ) : participants.length === 0 ? (
                        <EmptyText>Nenhum participante neste sorteio</EmptyText>
                    ) : (
                        participants.map((p) => {
                            const uid = p.uid || p.email || p.cpf;
                            const isSelected = selected.has(uid);
                            return (
                                <ParticipantItem
                                    key={uid}
                                    selected={isSelected}
                                    onPress={() => toggleParticipant(uid)}
                                    activeOpacity={0.7}
                                >
                                    <CheckBox selected={isSelected}>
                                        {isSelected && (
                                            <Feather name="check" size={13} color="#fff" />
                                        )}
                                    </CheckBox>
                                    <View style={{ flex: 1 }}>
                                        <ParticipantName numberOfLines={1}>
                                            {p.name || p.displayName || "—"}
                                        </ParticipantName>
                                        <ParticipantEmail numberOfLines={1}>
                                            {p.email}
                                        </ParticipantEmail>
                                    </View>
                                </ParticipantItem>
                            );
                        })
                    )}

                    <SaveButton onPress={handleSave} disabled={saving} activeOpacity={0.8}>
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <SaveButtonText>
                                Salvar indicados ({selected.size})
                            </SaveButtonText>
                        )}
                    </SaveButton>
                </>
            )}
        </DrawCard>
    );
};

export const Parabens = () => {
    const [draws, setDraws] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDraws = useCallback(async () => {
        setLoading(true);
        const response = await getAllActiveDrawPrizesLive();
        setDraws(response.error ? [] : response.data);
        setLoading(false);
    }, []);

    useFocusEffect(loadDraws);

    return (
        <Container>
            <Content>
                <HeaderTitle>Parabéns</HeaderTitle>
                <HeaderSubtitle>
                    Selecione participantes indicados por sorteio
                </HeaderSubtitle>

                {loading ? (
                    <LoadingWrap>
                        <ActivityIndicator color="#f55b1f" size="large" />
                    </LoadingWrap>
                ) : draws.length === 0 ? (
                    <EmptyText>Nenhum sorteio ativo no momento</EmptyText>
                ) : (
                    draws.map((draw) => (
                        <DrawSection key={draw.id} draw={draw} onSaved={loadDraws} />
                    ))
                )}
            </Content>
        </Container>
    );
};
