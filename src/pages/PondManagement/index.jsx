import { useState, useEffect, useRef, useCallback } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Audio } from "expo-av";
import { Feather } from "@expo/vector-icons";
import { ActivityIndicator } from "react-native-paper";
import Toast from "react-native-toast-message";

import { GetUserStorage } from "../../services/Storage/UserStorage";
import { getUserPonds } from "../../controllers/PondTracker/getUserPonds";
import { transcribeAudio, chatWithAssistant } from "../../services/OpenAI";

import {
    BottomBar,
    Container,
    LoadingRow,
    LoadingText,
    MessageAuthor,
    MessageBubble,
    MessagesList,
    MessageText,
    MicButton,
    RecordingDot,
    RecordingIndicator,
    RecordingText,
    SendButton,
    TextInput,
} from "./styles";

const SYSTEM_PROMPT_BASE = `Você é um assistente especializado em gestão de viveiros de camarão.
Você ajuda produtores a analisar o histórico semanal dos viveiros, identificar padrões, gerar previsões de colheita e tomar decisões estratégicas.
Responda sempre em português brasileiro, de forma clara e objetiva.
Quando o usuário pedir relatórios ou análises, estruture a resposta de forma organizada com tópicos.`;

const buildSystemPrompt = (ponds) => {
    if (!ponds || ponds.length === 0) {
        return SYSTEM_PROMPT_BASE;
    }

    const pondsInfo = ponds
        .map((pond, i) => {
            const weeksInfo =
                pond.weeks?.length > 0
                    ? [...pond.weeks]
                          .sort((a, b) => a.weekNumber - b.weekNumber)
                          .map((w) => `    Semana ${w.weekNumber}: ${w.description}`)
                          .join("\n")
                    : "    Nenhuma semana registrada ainda.";
            return (
                `Viveiro ${i + 1}: ${pond.name}\n` +
                `  Semanas registradas: ${pond.weeks?.length ?? 0}/26\n` +
                `${weeksInfo}`
            );
        })
        .join("\n\n");

    return `${SYSTEM_PROMPT_BASE}\n\nDados dos viveiros do produtor:\n${pondsInfo}`;
};

const buildWelcomeWithPonds = (ponds) => {
    const lines = ponds.map((pond, i) => {
        const weeksSummary =
            pond.weeks?.length > 0
                ? [...pond.weeks]
                      .sort((a, b) => a.weekNumber - b.weekNumber)
                      .map((w) => {
                          const preview =
                              w.description.length > 60
                                  ? `${w.description.substring(0, 60)}...`
                                  : w.description;
                          return `   • Sem. ${w.weekNumber}: ${preview}`;
                      })
                      .join("\n")
                : "   Nenhuma semana registrada ainda.";
        return (
            `🌊 Viveiro ${i + 1}: ${pond.name}\n` +
            `   ${pond.weeks?.length ?? 0} semana(s) registrada(s)\n` +
            `${weeksSummary}`
        );
    });

    return (
        `Olá! Encontrei ${ponds.length} viveiro(s) cadastrado(s) na sua conta:\n\n` +
        `${lines.join("\n\n")}\n\n` +
        `Estou pronto para te ajudar! Você pode me perguntar, por exemplo:\n` +
        `• "Faça um relatório do meu viveiro"\n` +
        `• "Com base nas semanas, qual a previsão para a próxima colheita?"\n` +
        `• "Identificou algum problema no histórico?"\n\n` +
        `Como posso ajudar?`
    );
};

const WELCOME_NO_PONDS =
    `Olá! Sou seu assistente de gestão de viveiros. 🦐\n\n` +
    `Ainda não encontrei viveiros cadastrados na sua conta.\n\n` +
    `Para aproveitar melhor o assistente, cadastre seus viveiros em "Meus Viveiros" e registre o que acontece semana a semana.\n\n` +
    `Mesmo assim, posso te ajudar! Informe os dados diretamente, por exemplo:\n` +
    `• "Tenho um viveiro de 5 hectares, semana 8 com oxigênio baixo. O que devo fazer?"\n` +
    `• "Quais os principais problemas em viveiros de camarão?"\n` +
    `• "Como calcular o custo de produção por kg?"\n\n` +
    `Como posso ajudar?`;

export const PondManagement = () => {
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingInit, setIsLoadingInit] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT_BASE);

    const recordingRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        const loadPonds = async () => {
            try {
                const dataUser = await GetUserStorage();
                if (!dataUser) {
                    setMessages([{ id: "welcome", role: "assistant", text: WELCOME_NO_PONDS }]);
                    return;
                }

                const result = await getUserPonds(dataUser.email);

                if (!result.error && result.data && result.data.length > 0) {
                    setSystemPrompt(buildSystemPrompt(result.data));
                    setMessages([
                        {
                            id: "welcome",
                            role: "assistant",
                            text: buildWelcomeWithPonds(result.data),
                        },
                    ]);
                } else {
                    setMessages([{ id: "welcome", role: "assistant", text: WELCOME_NO_PONDS }]);
                }
            } finally {
                setIsLoadingInit(false);
            }
        };

        loadPonds();
    }, []);

    const scrollToBottom = useCallback(() => {
        setTimeout(() => listRef.current?.scrollToEnd?.({ animated: true }), 100);
    }, []);

    const addMessage = useCallback(
        (role, text) => {
            const id = `${role}-${Date.now()}`;
            setMessages((prev) => [...prev, { id, role, text }]);
            scrollToBottom();
        },
        [scrollToBottom],
    );

    const buildChatMessages = useCallback(
        (userText) => {
            const history = messages.map((m) => ({ role: m.role, content: m.text }));
            return [
                { role: "system", content: systemPrompt },
                ...history,
                { role: "user", content: userText },
            ];
        },
        [messages, systemPrompt],
    );

    const sendToGPT = useCallback(
        async (userText) => {
            addMessage("user", userText);
            setIsLoading(true);

            try {
                const chatMessages = buildChatMessages(userText);
                const result = await chatWithAssistant(chatMessages);

                if (result.error) {
                    Toast.show({
                        type: "error",
                        text1: "Erro ao consultar assistente.",
                        text2: result.message,
                    });
                } else {
                    addMessage("assistant", result.text);
                }
            } finally {
                setIsLoading(false);
            }
        },
        [addMessage, buildChatMessages],
    );

    const handleSendText = useCallback(async () => {
        const text = inputText.trim();
        if (!text || isLoading) return;

        setInputText("");
        await sendToGPT(text);
    }, [inputText, isLoading, sendToGPT]);

    const handleToggleRecording = useCallback(async () => {
        if (isRecording) {
            try {
                await recordingRef.current?.stopAndUnloadAsync();
                const uri = recordingRef.current?.getURI();
                recordingRef.current = null;
                setIsRecording(false);

                if (!uri) {
                    Toast.show({ type: "error", text1: "Não foi possível obter o áudio." });
                    return;
                }

                setIsLoading(true);
                const transcription = await transcribeAudio(uri);

                if (transcription.error) {
                    Toast.show({
                        type: "error",
                        text1: "Erro ao transcrever áudio.",
                        text2: transcription.message,
                    });
                    setIsLoading(false);
                    return;
                }

                await sendToGPT(transcription.text);
            } catch {
                setIsRecording(false);
                setIsLoading(false);
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
            setIsRecording(true);
        } catch {
            Toast.show({ type: "error", text1: "Não foi possível iniciar a gravação." });
        }
    }, [isRecording, sendToGPT]);

    const renderMessage = useCallback(({ item }) => {
        const isUser = item.role === "user";
        return (
            <MessageBubble isUser={isUser}>
                <MessageAuthor isUser={isUser}>
                    {isUser ? "Você" : "Assistente"}
                </MessageAuthor>
                <MessageText isUser={isUser}>{item.text}</MessageText>
            </MessageBubble>
        );
    }, []);

    if (isLoadingInit) {
        return (
            <Container>
                <LoadingRow style={{ alignSelf: "center", marginTop: 32 }}>
                    <ActivityIndicator animating size={16} color="#F05829" />
                    <LoadingText>Carregando seus viveiros...</LoadingText>
                </LoadingRow>
            </Container>
        );
    }

    return (
        <Container>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={90}
            >
                <MessagesList
                    ref={listRef}
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={renderMessage}
                    onContentSizeChange={scrollToBottom}
                    ListFooterComponent={
                        isLoading ? (
                            <LoadingRow>
                                <ActivityIndicator animating size={16} color="#F05829" />
                                <LoadingText>Processando...</LoadingText>
                            </LoadingRow>
                        ) : null
                    }
                />

                {isRecording && (
                    <RecordingIndicator>
                        <RecordingDot />
                        <RecordingText>Gravando... toque novamente para parar</RecordingText>
                    </RecordingIndicator>
                )}

                <BottomBar>
                    <TextInput
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Digite sua mensagem..."
                        multiline
                        returnKeyType="send"
                        onSubmitEditing={handleSendText}
                        editable={!isLoading && !isRecording}
                    />
                    <MicButton
                        onPress={handleToggleRecording}
                        isRecording={isRecording}
                        disabled={isLoading}
                    >
                        <Feather
                            name={isRecording ? "square" : "mic"}
                            size={20}
                            color={isRecording ? "#fff" : "#F05829"}
                        />
                    </MicButton>
                    <SendButton
                        onPress={handleSendText}
                        disabled={isLoading || isRecording || !inputText.trim()}
                    >
                        <Feather name="send" size={18} color="#fff" />
                    </SendButton>
                </BottomBar>
            </KeyboardAvoidingView>
        </Container>
    );
};
