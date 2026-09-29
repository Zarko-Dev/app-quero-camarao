import { useState, useCallback, useRef } from "react";
import { ActivityIndicator } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import Toast from "react-native-toast-message";

import { updatePondWeeks } from "../../controllers/PondTracker/updatePondWeeks";
import { transcribeAudio } from "../../services/OpenAI";
import { DialogComponent } from "../../components/Dialog";

import {
    Container,
    LeftColumn,
    MicButton,
    RecordingBar,
    RecordingDot,
    RecordingText,
    RightColumn,
    SaveButton,
    SaveButtonText,
    SavedLabel,
    SaveRow,
    TimelineItem,
    VerticalLine,
    WeekBadge,
    WeekBadgeText,
    WeekInput,
    WeekLabel,
} from "./styles";

const MAX_WEEKS = 26;

const buildWeeks = (savedWeeks) => {
    const map = {};
    (savedWeeks ?? []).forEach((w) => {
        map[w.weekNumber] = w.description;
    });
    return Array.from({ length: MAX_WEEKS }, (_, i) => ({
        weekNumber: i + 1,
        description: map[i + 1] ?? "",
    }));
};

export const PondDetail = ({ route }) => {
    const { pond } = route.params;
    const [weeks, setWeeks] = useState(() => buildWeeks(pond.weeks));
    const [savingWeek, setSavingWeek] = useState(null);
    const [savedWeeks, setSavedWeeks] = useState(() => {
        const set = new Set();
        (pond.weeks ?? []).forEach((w) => {
            if (w.description?.trim()) set.add(w.weekNumber);
        });
        return set;
    });
    const [recordingWeek, setRecordingWeek] = useState(null);
    const [transcribingWeek, setTranscribingWeek] = useState(null);
    const [tipVisible, setTipVisible] = useState(() => (pond.weeks?.length ?? 0) === 0);
    const recordingRef = useRef(null);

    const handleChangeWeek = useCallback((weekNumber, text) => {
        setWeeks((prev) =>
            prev.map((w) =>
                w.weekNumber === weekNumber ? { ...w, description: text } : w,
            ),
        );
        setSavedWeeks((prev) => {
            const next = new Set(prev);
            next.delete(weekNumber);
            return next;
        });
    }, []);

    const handleSaveWeek = useCallback(
        async (weekNumber) => {
            setSavingWeek(weekNumber);
            const weeksToSave = weeks.filter(
                (w) => w.description.trim().length > 0,
            );
            const result = await updatePondWeeks(pond.id, weeksToSave);
            if (result.error) {
                Toast.show({
                    type: "error",
                    text1: "Erro ao salvar.",
                    text2: "Tente novamente.",
                });
            } else {
                setSavedWeeks((prev) => {
                    const next = new Set(prev);
                    next.add(weekNumber);
                    return next;
                });
            }
            setSavingWeek(null);
        },
        [weeks, pond.id],
    );

    const handleToggleMic = useCallback(
        async (weekNumber) => {
            if (recordingWeek === weekNumber) {
                try {
                    await recordingRef.current?.stopAndUnloadAsync();
                    const uri = recordingRef.current?.getURI();
                    recordingRef.current = null;
                    setRecordingWeek(null);

                    if (!uri) {
                        Toast.show({ type: "error", text1: "Não foi possível obter o áudio." });
                        return;
                    }

                    setTranscribingWeek(weekNumber);
                    const result = await transcribeAudio(uri);
                    setTranscribingWeek(null);

                    if (result.error) {
                        Toast.show({
                            type: "error",
                            text1: "Erro ao transcrever áudio.",
                            text2: result.message,
                        });
                        return;
                    }

                    setWeeks((prev) =>
                        prev.map((w) => {
                            if (w.weekNumber !== weekNumber) return w;
                            const separator = w.description.trim() ? "\n" : "";
                            return {
                                ...w,
                                description: w.description + separator + result.text,
                            };
                        }),
                    );
                    setSavedWeeks((prev) => {
                        const next = new Set(prev);
                        next.delete(weekNumber);
                        return next;
                    });
                } catch {
                    setRecordingWeek(null);
                    setTranscribingWeek(null);
                    Toast.show({ type: "error", text1: "Erro ao parar a gravação." });
                }
                return;
            }

            try {
                const { status } = await Audio.requestPermissionsAsync();
                if (status !== "granted") {
                    Toast.show({
                        type: "error",
                        text1: "Permissão de microfone negada.",
                        text2: "Habilite o microfone nas configurações do dispositivo.",
                    });
                    return;
                }

                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                });

                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY,
                );
                recordingRef.current = recording;
                setRecordingWeek(weekNumber);
            } catch {
                Toast.show({ type: "error", text1: "Não foi possível iniciar a gravação." });
            }
        },
        [recordingWeek],
    );

    const isBusy = savingWeek !== null || recordingWeek !== null || transcribingWeek !== null;

    return (
        <>
        <DialogComponent
            visible={tipVisible}
            hideDialog={() => setTipVisible(false)}
            dismissable={false}
            showCancelButton={false}
            title="Como preencher o seu viveiro"
            text={
                "Descreva com clareza o que aconteceu em cada semana do viveiro: arraçoamento, qualidade da água, mortalidade, problemas identificados, tratamentos aplicados, comportamento do camarão e qualquer outra observação relevante.\n\n" +
                "Você pode digitar ou usar o microfone para gravar sua voz.\n\n" +
                "Quanto mais detalhado for o registro, melhores serão as estimativas de produção, previsões de colheita e relatórios gerados pela Inteligência Artificial."
            }
            textActionButton="Entendi, vou registrar!"
            actionButton={() => setTipVisible(false)}
        />
        <Container>
            {weeks.map((week, index) => {
                const isLast = index === MAX_WEEKS - 1;
                const isSaving = savingWeek === week.weekNumber;
                const isSaved = savedWeeks.has(week.weekNumber);
                const isThisRecording = recordingWeek === week.weekNumber;
                const isThisTranscribing = transcribingWeek === week.weekNumber;

                return (
                    <TimelineItem key={week.weekNumber}>
                        <LeftColumn>
                            <WeekBadge>
                                <WeekBadgeText>{week.weekNumber}</WeekBadgeText>
                            </WeekBadge>
                            {!isLast && <VerticalLine />}
                        </LeftColumn>

                        <RightColumn>
                            <WeekLabel>Semana {week.weekNumber}</WeekLabel>

                            {isThisRecording && (
                                <RecordingBar>
                                    <RecordingDot />
                                    <RecordingText>
                                        Gravando... toque no microfone para parar
                                    </RecordingText>
                                </RecordingBar>
                            )}

                            <WeekInput
                                placeholder={`O que foi feito na semana ${week.weekNumber}...`}
                                value={week.description}
                                onChangeText={(text) =>
                                    handleChangeWeek(week.weekNumber, text)
                                }
                                multiline
                                placeholderTextColor="#aaa"
                                editable={!isThisRecording && !isThisTranscribing}
                            />

                            <SaveRow>
                                {isSaved && <SavedLabel>Salvo ✓</SavedLabel>}

                                <MicButton
                                    isRecording={isThisRecording}
                                    onPress={() => handleToggleMic(week.weekNumber)}
                                    disabled={
                                        isBusy &&
                                        !isThisRecording &&
                                        !isThisTranscribing
                                    }
                                >
                                    {isThisTranscribing ? (
                                        <ActivityIndicator
                                            animating
                                            size={14}
                                            color="#F05829"
                                        />
                                    ) : (
                                        <Feather
                                            name={isThisRecording ? "square" : "mic"}
                                            size={16}
                                            color={isThisRecording ? "#fff" : "#F05829"}
                                        />
                                    )}
                                </MicButton>

                                <SaveButton
                                    onPress={() => handleSaveWeek(week.weekNumber)}
                                    disabled={isBusy}
                                >
                                    {isSaving ? (
                                        <ActivityIndicator
                                            animating
                                            size={14}
                                            color="#fff"
                                        />
                                    ) : (
                                        <SaveButtonText>Salvar</SaveButtonText>
                                    )}
                                </SaveButton>
                            </SaveRow>
                        </RightColumn>
                    </TimelineItem>
                );
            })}
        </Container>
        </>
    );
};
