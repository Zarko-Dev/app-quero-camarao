import { QUERO_CAMARAO_AI_KEY } from "@env";
import * as Sentry from "@sentry/react-native";

const BASE_URL = "https://api.groq.com/openai/v1";

export const transcribeAudio = async (audioUri) => {
    try {
        const formData = new FormData();
        formData.append("file", {
            uri: audioUri,
            type: "audio/m4a",
            name: "recording.m4a",
        });
        formData.append("model", "whisper-large-v3-turbo");
        formData.append("language", "pt");

        const response = await fetch(`${BASE_URL}/audio/transcriptions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${QUERO_CAMARAO_AI_KEY}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                error: true,
                message: data.error?.message ?? "Erro ao transcrever áudio.",
            };
        }

        return { error: false, text: data.text };
    } catch (error) {
        Sentry.captureException(error);
        return { error: true, message: "Erro ao conectar com o serviço de transcrição." };
    }
};

export const chatWithAssistant = async (messages) => {
    try {
        const response = await fetch(`${BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${QUERO_CAMARAO_AI_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages,
                max_tokens: 1000,
                temperature: 0.7,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                error: true,
                message: data.error?.message ?? "Erro ao consultar o assistente.",
            };
        }

        return { error: false, text: data.choices[0].message.content };
    } catch (error) {
        Sentry.captureException(error);
        return { error: true, message: "Erro ao conectar com o assistente." };
    }
};
