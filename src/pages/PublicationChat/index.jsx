import { useEffect, useRef, useState } from "react";
import { ActionSheetIOS, ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Linking, Modal, PanResponder, Platform, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { doc, getDoc } from "firebase/firestore";
import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";

import { GetUserStorage } from "../../services/Storage/UserStorage";
import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { sendChatMessage, subscribeToChat, markChatAsSeen, markAutoMessageSent, chatDocId, getMyChats } from "../../controllers/Chat";
import { sendAttention, setAttentionEnabled } from "../../controllers/Chat/attention";
import { submitRating, getMyRating } from "../../controllers/Chat/ratings";
import { markPublicationSold, closeChatsForPublication } from "../../controllers/Chat/sold";
import {
    deleteMessageForMe,
    deleteMessageForEveryone,
    reportMessage,
    markMessagesDelivered,
} from "../../controllers/Chat/messageActions";
import { uploadChatAudio } from "../../controllers/Chat/uploadAudio";
import { uploadChatImage } from "../../controllers/Chat/uploadImage";
import { uploadChatFile } from "../../controllers/Chat/uploadFile";
import { getMessageDeliveryStatus } from "../../utils/messageStatus";
import { buildMessagePreview } from "../../utils/messagePreview";
import { formatFileSize } from "../../utils/formatFileSize";
import { formatRatingLabel } from "../../utils/ratingLabel";
import { buildPublicationSummary } from "../../utils/publicationSummary";
import { setActiveChatId } from "../../utils/activeChatTracker";
import { dataRoutes } from "../../routes/dataRoutes";
import {
    AttachButton,
    Avatar,
    AvatarText,
    AudioBubble,
    AudioDuration,
    AudioPlayButton,
    AudioWave,
    Bubble,
    BubbleFooter,
    BubbleText,
    BubbleTime,
    BubbleWrap,
    CameraButton,
    ChatInput,
    ClosedBar,
    ClosedText,
    Container,
    DeletedText,
    FileInfo,
    FileName,
    FileRow,
    FileSize,
    ForwardedLabel,
    FullscreenClose,
    FullscreenModal,
    Header,
    HeaderInfo,
    HeaderRating,
    HeaderSubtitle,
    HeaderTitle,
    HeaderTouchable,
    ImageBubble,
    InputRow,
    MenuButton,
    PreviewBar,
    PreviewDuration,
    QuoteBlock,
    QuoteName,
    QuoteText,
    RateActionButton,
    RateActionText,
    RateButton,
    RateText,
    RecordButton,
    RecordingBar,
    RecordingDot,
    RecordingIndicator,
    RecordingText,
    RecordingTimer,
    ReplyBar,
    ReplyBarText,
    RoundIconButton,
    SendButton,
    SlideHint,
} from "./styles";
import { ChatWallpaper } from "./ChatWallpaper";
import { MessageActionsSheet } from "./MessageActionsSheet";
import { ForwardModal } from "./ForwardModal";
import { RatingModal } from "../../components/RatingModal";

const NEXT_PLAYBACK_RATE = { 1: 1.5, 1.5: 2, 2: 1 };
const PLAYBACK_RATE_LABEL = { 1: "1x", 1.5: "1,5x", 2: "2x" };

const ReadReceipt = ({ status }) => {
    if (status === "pending") {
        return <Feather name="clock" size={11} color="#8fa3b2" />;
    }
    const color = status === "read" ? "#4BB543" : "#8fa3b2";
    const isDouble = status === "read" || status === "delivered";
    return (
        <View style={{ flexDirection: "row" }}>
            <Feather name="check" size={12} color={color} />
            {isDouble && (
                <Feather
                    name="check"
                    size={12}
                    color={color}
                    style={{ marginLeft: -7 }}
                />
            )}
        </View>
    );
};

export const PublicationChat = ({ route, navigation }) => {
    const { publication, sellerId, sellerName, buyerName: paramBuyerName, chatId, buyerId: paramBuyerId, initialMessage, autoSend } = route.params;

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [resolvedSellerName, setResolvedSellerName] = useState(sellerName || "");
    const [resolvedBuyerName, setResolvedBuyerName] = useState(paramBuyerName || "");
    const [myId, setMyId] = useState(null);
    const [buyerName, setBuyerName] = useState(paramBuyerName || "");
    const [publicationData, setPublicationData] = useState(publication);
    const [chatMeta, setChatMeta] = useState(null);
    const [myRating, setMyRating] = useState(undefined);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [otherUserRating, setOtherUserRating] = useState(null);

    const lastSeenAt = chatMeta?.lastSeenAt || {};

    const [recordingState, setRecordingState] = useState("idle");
    const [pendingAudio, setPendingAudio] = useState(null);
    const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadingLabel, setUploadingLabel] = useState("");
    const [recordingDuration, setRecordingDuration] = useState(0);

    const [playingId, setPlayingId] = useState(null);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [fullscreenImage, setFullscreenImage] = useState(null);

    const [actionsFor, setActionsFor] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [forwardingMsg, setForwardingMsg] = useState(null);
    const [forwardChats, setForwardChats] = useState([]);
    const [attentionCooldown, setAttentionCooldown] = useState(false);
    const [myAttentionEnabled, setMyAttentionEnabled] = useState(true);

    const listRef = useRef(null);
    const recordingRef = useRef(null);
    const durationIntervalRef = useRef(null);
    const soundRef = useRef(null);
    const previewSoundRef = useRef(null);
    const autoSentRef = useRef(false);
    const messagesReadyRef = useRef(false);
    const deliveredMarkedRef = useRef(new Set());
    const lastSeenSignatureRef = useRef("");
    const swipeableRefs = useRef({});
    const attentionTimeoutRef = useRef(null);

    // Self-chat: usuário abre a própria publicação sem paramBuyerId (seria comprador e vendedor ao mesmo tempo)
    const isSelfChat = myId && sellerId && !paramBuyerId && myId === sellerId;
    const buyerId = paramBuyerId ?? myId;
    const otherUserId = myId === sellerId ? buyerId : sellerId;
    const resolvedChatId = chatId ?? (publication.id && buyerId ? chatDocId(publication.id, buyerId) : null);
    const publicationSummary = buildPublicationSummary(publicationData?.shrimps);
    const isChatClosed = chatMeta?.status === "closed";

    useEffect(() => {
        GetUserStorage().then((user) => {
            if (user) {
                setMyId(user.email ?? user.uid);
                if (!paramBuyerName) {
                    setBuyerName(user.name || "");
                }
            }
        });
    }, []);

    useEffect(() => {
        if (!autoSend || !initialMessage || !myId || !buyerId || autoSentRef.current) return;
        if (!messagesReadyRef.current) return; // aguarda subscription carregar
        if (messages.length > 0) return; // chat já tem mensagens — não dispara de novo
        // trava persistente: já enviada 1x p/ este cliente+anúncio
        if (chatMeta?.autoMessageSentAt) return;
        const effectiveSellerName = resolvedSellerName || sellerName || "";
        if (sellerId && !effectiveSellerName) return; // aguarda resolvedSellerName
        autoSentRef.current = true;
        sendChatMessage({
            publicationId: publication.id,
            sellerId,
            buyerId,
            senderId: myId,
            text: initialMessage,
            sellerName: effectiveSellerName,
            buyerName,
            publicationTitle: publication?.publicationTitle || publication?.location || "",
            publicationLocation: publicationData?.location || "",
            publicationSummary,
        }).then((ok) => {
            if (ok && resolvedChatId) markAutoMessageSent(resolvedChatId);
        });
    }, [myId, resolvedSellerName, messages, chatMeta]);

    useEffect(() => {
        if (!sellerId) return;
        getDoc(doc(firestore, models.users, sellerId))
            .then((snap) => {
                if (snap.exists()) {
                    const name = snap.data()?.name;
                    if (name) setResolvedSellerName(name);
                }
            })
            .catch(() => {});
    }, [sellerId]);

    // Avaliação do outro participante (média + contagem) pro cabeçalho
    useEffect(() => {
        if (!otherUserId) return;
        getDoc(doc(firestore, models.users, otherUserId))
            .then((snap) => {
                if (snap.exists()) {
                    const data = snap.data() || {};
                    setOtherUserRating({
                        average: data.ratingAverage,
                        count: data.ratingCount,
                    });
                }
            })
            .catch(() => {});
    }, [otherUserId]);

    // Minha preferência de chamadas de atenção (toggle no menu 3 pontos)
    useEffect(() => {
        if (!myId) return;
        getDoc(doc(firestore, models.users, myId))
            .then((snap) => {
                if (snap.exists()) {
                    setMyAttentionEnabled(snap.data()?.attentionEnabled !== false);
                }
            })
            .catch(() => {});
    }, [myId]);

    useEffect(() => () => {
        if (attentionTimeoutRef.current) clearTimeout(attentionTimeoutRef.current);
    }, []);

    // Chat encerrado: carrega minha avaliação (null = ainda não avaliei)
    useEffect(() => {
        if (!isChatClosed || !myId || !resolvedChatId) return;
        getMyRating(resolvedChatId, myId).then(setMyRating);
    }, [isChatClosed, myId, resolvedChatId]);

    // Busca dados completos da publicação quando vem do MyChats (sem location/shrimps)
    useEffect(() => {
        if (!publication.id || publication.location || publication.shrimps) return;
        getDoc(doc(firestore, models.shrimpPonds, publication.id))
            .then((snap) => {
                if (snap.exists()) setPublicationData({ id: publication.id, ...snap.data() });
            })
            .catch(() => {});
    }, [publication.id]);

    useEffect(() => {
        if (!publication.id || !buyerId) return;
        const unsub = subscribeToChat({
            publicationId: publication.id,
            buyerId,
            onMessages: (msgs) => {
                messagesReadyRef.current = true;
                setMessages([...msgs].reverse());
                if (myId && resolvedChatId) {
                    // Evita write de lastSeenAt em eventos metadata-only (includeMetadataChanges
                    // triplica os snapshots); só marca visto quando o conjunto de ids muda.
                    const idsSignature = msgs.map((m) => m.id).join("|");
                    if (idsSignature !== lastSeenSignatureRef.current) {
                        lastSeenSignatureRef.current = idsSignature;
                        markChatAsSeen(resolvedChatId, myId);
                    }
                    const mySafeId = String(myId).replace(/[@.]/g, "_");
                    const toDeliver = msgs.filter((m) => m.senderId !== myId
                        && !m.pending
                        && !m.deliveredTo?.[mySafeId]
                        && !deliveredMarkedRef.current.has(m.id));
                    if (toDeliver.length > 0) {
                        toDeliver.forEach((m) => deliveredMarkedRef.current.add(m.id));
                        markMessagesDelivered(
                            resolvedChatId,
                            toDeliver.map((m) => m.id),
                            myId,
                        );
                    }
                }
            },
            onChatMeta: (meta) => setChatMeta(meta || null),
        });
        return unsub;
    }, [publication.id, buyerId, myId]);

    useEffect(() => {
        if (!resolvedChatId) return undefined;
        setActiveChatId(resolvedChatId);
        return () => setActiveChatId(null);
    }, [resolvedChatId]);

    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed || !myId || !buyerId) return;
        const reply = replyingTo;
        setText("");
        setReplyingTo(null);
        await sendChatMessage({
            publicationId: publication.id,
            sellerId,
            buyerId,
            senderId: myId,
            text: trimmed,
            sellerName: resolvedSellerName || "",
            buyerName,
            publicationTitle: publication?.publicationTitle || publication?.location || "",
            publicationLocation: publicationData?.location || "",
            publicationSummary,
            ...(reply ? {
                replyTo: {
                    id: reply.id,
                    senderId: reply.senderId,
                    preview: buildMessagePreview(reply),
                },
            } : {}),
        });
    };

    const pickAndSendImage = async (source) => {
        try {
            if (source === "camera") {
                const { granted } = await ImagePicker.requestCameraPermissionsAsync();
                if (!granted) return;
            } else {
                const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (!granted) return;
            }

            const options = { mediaTypes: ["images"], quality: 0.7, allowsEditing: false };
            const result = source === "camera"
                ? await ImagePicker.launchCameraAsync(options)
                : await ImagePicker.launchImageLibraryAsync(options);

            if (result.canceled || !result.assets?.[0]?.uri) return;
            const uri = result.assets[0].uri;

            const currentBuyerId = paramBuyerId ?? myId;
            const currentChatId = chatId ?? (publication.id && currentBuyerId
                ? chatDocId(publication.id, currentBuyerId)
                : null);

            if (!myId || !currentBuyerId || !currentChatId) {
                console.warn("[Chat] pickAndSendImage: ids not ready", { myId, currentBuyerId, currentChatId });
                return;
            }

            setIsUploading(true);
            setUploadingLabel("Enviando foto...");
            const { error, url } = await uploadChatImage(currentChatId, uri);
            setIsUploading(false);
            setUploadingLabel("");

            if (!error && url) {
                await sendChatMessage({
                    publicationId: publication.id,
                    sellerId,
                    buyerId: currentBuyerId,
                    senderId: myId,
                    imageUrl: url,
                    sellerName: resolvedSellerName || "",
                    buyerName,
                    publicationTitle: publication?.publicationTitle || publication?.location || "",
                    publicationLocation: publicationData?.location || "",
                    publicationSummary,
                });
            }
        } catch (e) {
            console.error("[Chat] pickAndSendImage error", e);
            setIsUploading(false);
            setUploadingLabel("");
        }
    };

    const sendDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "text/plain",
                ],
                copyToCacheDirectory: true,
            });

            if (result.canceled || !result.assets?.[0]?.uri) return;
            const asset = result.assets[0];

            const currentBuyerId = paramBuyerId ?? myId;
            const currentChatId = chatId ?? (publication.id && currentBuyerId
                ? chatDocId(publication.id, currentBuyerId)
                : null);

            if (!myId || !currentBuyerId || !currentChatId) {
                console.warn("[Chat] sendDocument: ids not ready", { myId, currentBuyerId, currentChatId });
                return;
            }

            setIsUploading(true);
            setUploadingLabel("Enviando documento...");
            const { error, url } = await uploadChatFile(
                currentChatId,
                asset.uri,
                asset.name,
                asset.mimeType,
            );
            setIsUploading(false);
            setUploadingLabel("");

            if (!error && url) {
                await sendChatMessage({
                    publicationId: publication.id,
                    sellerId,
                    buyerId: currentBuyerId,
                    senderId: myId,
                    fileUrl: url,
                    fileName: asset.name || "Documento",
                    fileSize: asset.size ?? null,
                    sellerName: resolvedSellerName || "",
                    buyerName,
                    publicationTitle: publication?.publicationTitle || publication?.location || "",
                    publicationLocation: publicationData?.location || "",
                    publicationSummary,
                });
            }
        } catch (e) {
            console.error("[Chat] sendDocument error", e);
            setIsUploading(false);
            setUploadingLabel("");
        }
    };

    const confirmMarkAsSold = () => {
        Alert.alert(
            "Camarão vendido",
            "Este camarão foi vendido. Deseja encerrar todas as conversas ligadas a este anúncio?",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Confirmar",
                    onPress: async () => {
                        const soldOk = await markPublicationSold(publication.id);
                        const closedCount = soldOk
                            ? await closeChatsForPublication(publication.id)
                            : -1;
                        if (soldOk && closedCount >= 0) {
                            Toast.show({ type: "success", text1: "Anúncio marcado como vendido" });
                            setPublicationData((p) => ({ ...p, sold: true }));
                        } else {
                            Toast.show({ type: "error", text1: "Não foi possível concluir" });
                        }
                    },
                },
            ],
        );
    };

    const canMarkAsSold = myId === sellerId && publicationData && !publicationData.sold;

    const handleAttentionPress = async () => {
        if (attentionCooldown || !myId || !resolvedChatId || !otherUserId) return;
        const myName = myId === sellerId
            ? (resolvedSellerName || sellerName || "")
            : buyerName;
        const result = await sendAttention({
            chatId: resolvedChatId,
            senderId: myId,
            senderName: myName,
            recipientId: otherUserId,
            publicationId: publication.id,
            sellerId,
            buyerId,
        });
        if (result.ok) {
            setAttentionCooldown(true);
            attentionTimeoutRef.current = setTimeout(() => setAttentionCooldown(false), 30_000);
            Toast.show({ type: "success", text1: "Chamada de atenção enviada" });
        } else if (result.reason === "cooldown" || result.reason === "window") {
            Toast.show({ type: "info", text1: "Aguarde para chamar atenção novamente" });
        } else if (result.reason === "disabled") {
            Toast.show({ type: "info", text1: "Este usuário desativou chamadas de atenção" });
        } else if (result.reason === "error") {
            Toast.show({ type: "error", text1: "Não foi possível concluir" });
        }
    };

    const toggleMyAttention = async () => {
        const next = !myAttentionEnabled;
        const ok = await setAttentionEnabled(myId, next);
        if (ok) {
            setMyAttentionEnabled(next);
            Toast.show({
                type: "success",
                text1: next
                    ? "Chamadas de atenção reativadas"
                    : "Chamadas de atenção silenciadas",
            });
        } else {
            Toast.show({ type: "error", text1: "Não foi possível concluir" });
        }
    };

    const openHeaderMenu = () => {
        const details = [
            publicationData?.location ? `📍 ${publicationData.location}` : null,
            publicationSummary ? `🦐 ${publicationSummary}` : null,
        ].filter(Boolean).join("\n");
        const body = details || "Sem dados do anúncio";
        const attentionLabel = myAttentionEnabled
            ? "Silenciar chamadas de atenção"
            : "Reativar chamadas de atenção";
        if (Platform.OS === "ios") {
            const options = ["Cancelar", "Ver dados do anúncio"];
            if (canMarkAsSold) options.push("Marcar como vendido");
            options.push(attentionLabel);
            const attentionIdx = options.length - 1;
            ActionSheetIOS.showActionSheetWithOptions(
                { options, cancelButtonIndex: 0 },
                (idx) => {
                    if (idx === 1) Alert.alert("Anúncio", body);
                    else if (canMarkAsSold && idx === 2) confirmMarkAsSold();
                    else if (idx === attentionIdx) toggleMyAttention();
                },
            );
        } else {
            const buttons = [
                ...(canMarkAsSold
                    ? [{ text: "Marcar como vendido", onPress: confirmMarkAsSold }]
                    : []),
                { text: attentionLabel, onPress: toggleMyAttention },
                { text: "OK" },
            ];
            Alert.alert("Anúncio", body, buttons, { cancelable: true });
        }
    };

    const handleRatingSubmit = async (stars, comment) => {
        const ok = await submitRating({
            chatId: resolvedChatId,
            publicationId: publication.id,
            raterId: myId,
            ratedId: otherUserId,
            stars,
            comment,
        });
        if (ok) {
            Toast.show({ type: "success", text1: "Avaliação enviada" });
            setMyRating({ stars });
            setShowRatingModal(false);
        } else {
            Toast.show({ type: "error", text1: "Não foi possível concluir" });
        }
    };

    const openAttachSheet = () => {
        if (Platform.OS === "ios") {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: ["Cancelar", "Galeria", "Câmera", "Documento"], cancelButtonIndex: 0 },
                (idx) => {
                    if (idx === 1) pickAndSendImage("gallery");
                    if (idx === 2) pickAndSendImage("camera");
                    if (idx === 3) sendDocument();
                },
            );
        } else {
            // Android limita Alert a 3 botões; cancelamento é por toque fora/voltar
            Alert.alert("Enviar", null, [
                { text: "Galeria", onPress: () => pickAndSendImage("gallery") },
                { text: "Câmera", onPress: () => pickAndSendImage("camera") },
                { text: "Documento", onPress: () => sendDocument() },
            ], { cancelable: true });
        }
    };

    const startRecording = async () => {
        try {
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) return;
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            recordingRef.current = recording;
            setRecordingDuration(0);
            setRecordingState("recording");
            durationIntervalRef.current = setInterval(() => {
                setRecordingDuration((d) => d + 1);
            }, 1000);
        } catch (e) {
            console.error("[Audio] startRecording error", e);
            setRecordingState("idle");
        }
    };

    const cancelRecording = async () => {
        clearInterval(durationIntervalRef.current);
        setRecordingDuration(0);
        setRecordingState("idle");
        const recording = recordingRef.current;
        recordingRef.current = null;
        if (recording) {
            try {
                await recording.stopAndUnloadAsync();
            } catch (_) { /* já parada/descartada */ }
        }
    };

    const stopToPreview = async () => {
        if (!recordingRef.current) return;
        clearInterval(durationIntervalRef.current);
        const duration = recordingDuration;
        try {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;
            if (!uri) {
                setRecordingDuration(0);
                setRecordingState("idle");
                return;
            }
            setPendingAudio({ uri, duration });
            setRecordingState("preview");
        } catch (e) {
            console.error("[Audio] stopToPreview error", e);
            recordingRef.current = null;
            setRecordingDuration(0);
            setRecordingState("idle");
        }
    };

    const slidePanResponder = useRef(PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gestureState) => Math.abs(gestureState.dx) > 10,
        onPanResponderMove: (_evt, gestureState) => {
            if (gestureState.dx < -80) cancelRecording();
        },
        onPanResponderRelease: (_evt, gestureState) => {
            if (gestureState.dx < -80) cancelRecording();
        },
    }));

    const stopPreviewSound = async () => {
        if (previewSoundRef.current) {
            try {
                await previewSoundRef.current.stopAsync();
                await previewSoundRef.current.unloadAsync();
            } catch (_) { /* som já descarregado */ }
            previewSoundRef.current = null;
        }
        setIsPreviewPlaying(false);
    };

    const discardPreview = async () => {
        await stopPreviewSound();
        setPendingAudio(null);
        setRecordingDuration(0);
        setRecordingState("idle");
    };

    const sendPendingAudio = async () => {
        const audio = pendingAudio;
        await stopPreviewSound();
        setPendingAudio(null);
        setRecordingDuration(0);
        setRecordingState("idle");
        if (!audio?.uri || !myId || !buyerId || !resolvedChatId) return;
        try {
            setIsUploading(true);
            setUploadingLabel("Enviando áudio...");
            const { error, url } = await uploadChatAudio(resolvedChatId, audio.uri);
            setIsUploading(false);
            setUploadingLabel("");
            if (!error && url) {
                await sendChatMessage({
                    publicationId: publication.id,
                    sellerId,
                    buyerId,
                    senderId: myId,
                    audioUrl: url,
                    audioDuration: audio.duration,
                    sellerName: resolvedSellerName || "",
                    buyerName,
                    publicationTitle: publication?.publicationTitle || publication?.location || "",
                    publicationLocation: publicationData?.location || "",
                    publicationSummary,
                });
            }
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        } catch (e) {
            console.error("[Audio] sendPendingAudio error", e);
            setIsUploading(false);
            setUploadingLabel("");
        }
    };

    const stopSound = async () => {
        if (soundRef.current) {
            try { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); } catch (_) {}
            soundRef.current = null;
        }
        setPlayingId(null);
    };

    const togglePreviewPlayback = async () => {
        if (!pendingAudio?.uri) return;
        if (isPreviewPlaying) {
            await stopPreviewSound();
            return;
        }
        try {
            await stopSound();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
            });
            const { sound } = await Audio.Sound.createAsync({ uri: pendingAudio.uri });
            previewSoundRef.current = sound;
            setIsPreviewPlaying(true);
            await sound.playAsync();
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) stopPreviewSound();
            });
        } catch (e) {
            console.error("[Audio] togglePreviewPlayback error", e);
            setIsPreviewPlaying(false);
        }
    };

    useEffect(() => () => {
        stopSound();
        stopPreviewSound();
        clearInterval(durationIntervalRef.current);
        if (recordingRef.current) {
            recordingRef.current.stopAndUnloadAsync().catch(() => {});
            recordingRef.current = null;
        }
    }, []);

    const cyclePlaybackRate = () => {
        const next = NEXT_PLAYBACK_RATE[playbackRate] || 1;
        setPlaybackRate(next);
        if (soundRef.current) {
            soundRef.current.setRateAsync(next, true).catch(() => {});
        }
    };

    const playAudio = async (msgId, audioUrl) => {
        if (playingId === msgId) { await stopSound(); return; }
        await stopSound();
        try {
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
            const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
            soundRef.current = sound;
            setPlayingId(msgId);
            try {
                await sound.setRateAsync(playbackRate, true);
            } catch (_) { /* dispositivo sem suporte a pitch correction: toca em 1x */ }
            await sound.playAsync();
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) stopSound();
            });
        } catch (e) {
            console.error("[Audio] playAudio error", e);
            setPlayingId(null);
        }
    };

    const closeActions = () => setActionsFor(null);

    const handleReplyAction = () => {
        setReplyingTo(actionsFor);
        closeActions();
    };

    const handleCopyAction = async () => {
        const msg = actionsFor;
        closeActions();
        if (!msg?.text) return;
        await Clipboard.setStringAsync(msg.text);
        Toast.show({ type: "success", text1: "Copiado" });
    };

    const handleForwardAction = async () => {
        const msg = actionsFor;
        closeActions();
        if (!msg || !myId) return;
        const chats = await getMyChats(myId);
        setForwardChats(chats.map((c) => ({
            ...c,
            displayName: c.sellerId === myId ? c.buyerName : c.sellerName,
        })));
        setForwardingMsg(msg);
    };

    const handleDeleteForMeAction = () => {
        const msg = actionsFor;
        closeActions();
        if (!msg || !resolvedChatId || !myId) return;
        Alert.alert("Apagar para mim", "Apagar esta mensagem só para você?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Apagar",
                style: "destructive",
                onPress: () => deleteMessageForMe(resolvedChatId, msg.id, myId),
            },
        ]);
    };

    const handleDeleteForEveryoneAction = () => {
        const msg = actionsFor;
        closeActions();
        if (!msg || !resolvedChatId) return;
        Alert.alert("Apagar para todos", "Apagar esta mensagem para todos?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Apagar",
                style: "destructive",
                onPress: () => deleteMessageForEveryone(resolvedChatId, msg.id),
            },
        ]);
    };

    const handleReportAction = () => {
        const msg = actionsFor;
        closeActions();
        if (!msg || !resolvedChatId || !myId) return;
        Alert.alert("Denunciar", "Denunciar esta mensagem?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Denunciar",
                style: "destructive",
                onPress: async () => {
                    const ok = await reportMessage({
                        chatId: resolvedChatId,
                        messageId: msg.id,
                        reportedBy: myId,
                        reportedUserId: msg.senderId,
                        preview: buildMessagePreview(msg),
                    });
                    if (ok) Toast.show({ type: "success", text1: "Denúncia enviada" });
                },
            },
        ]);
    };

    // Chat encerrado: sem novas escritas na negociação — só Copiar/Apagar para mim/Denunciar
    const messageActions = actionsFor ? [
        ...(!isChatClosed ? [{
            key: "reply",
            label: "Responder",
            icon: "corner-up-left",
            onPress: handleReplyAction,
        }] : []),
        ...(actionsFor.text ? [{
            key: "copy",
            label: "Copiar",
            icon: "copy",
            onPress: handleCopyAction,
        }] : []),
        ...(!isChatClosed ? [{
            key: "forward",
            label: "Encaminhar",
            icon: "share",
            onPress: handleForwardAction,
        }] : []),
        {
            key: "deleteForMe",
            label: "Apagar para mim",
            icon: "trash",
            onPress: handleDeleteForMeAction,
        },
        ...(!isChatClosed && actionsFor.senderId === myId ? [{
            key: "deleteForEveryone",
            label: "Apagar para todos",
            icon: "trash-2",
            destructive: true,
            onPress: handleDeleteForEveryoneAction,
        }] : []),
        ...(actionsFor.senderId !== myId ? [{
            key: "report",
            label: "Denunciar",
            icon: "flag",
            destructive: true,
            onPress: handleReportAction,
        }] : []),
    ] : [];

    const handleForwardSelect = async (chat) => {
        const msg = forwardingMsg;
        setForwardingMsg(null);
        if (!msg || !myId || !chat) return;
        await sendChatMessage({
            publicationId: chat.publicationId,
            sellerId: chat.sellerId,
            buyerId: chat.buyerId,
            senderId: myId,
            text: msg.text || "",
            imageUrl: msg.imageUrl || null,
            audioUrl: msg.audioUrl || null,
            audioDuration: msg.audioDuration ?? null,
            fileUrl: msg.fileUrl || null,
            fileName: msg.fileName || null,
            fileSize: msg.fileSize ?? null,
            forwarded: true,
            sellerName: chat.sellerName || "",
            buyerName: chat.buyerName || "",
            publicationTitle: chat.publicationTitle || "",
            publicationLocation: chat.publicationLocation || "",
            publicationSummary: chat.publicationSummary || "",
        });
        Toast.show({ type: "success", text1: "Mensagem encaminhada" });
    };

    const formatTime = (createdAt) => {
        if (!createdAt) return "";
        try {
            const d = createdAt?.toDate?.() ?? new Date(createdAt);
            return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        } catch { return ""; }
    };

    const formatDuration = (secs) => {
        const m = Math.floor((secs || 0) / 60);
        const s = (secs || 0) % 60;
        return `${m}:${String(s).padStart(2, "0")}`;
    };

    const headerName = myId === sellerId
        ? (resolvedBuyerName || buyerName || "Comprador")
        : (resolvedSellerName || "Produtor");

    const quoteName = (reply) => (reply.senderId === myId ? "Você" : headerName);

    const renderQuote = (item) => (item.replyTo ? (
        <QuoteBlock>
            <QuoteName>{quoteName(item.replyTo)}</QuoteName>
            <QuoteText numberOfLines={2}>{item.replyTo.preview}</QuoteText>
        </QuoteBlock>
    ) : null);

    const renderForwardTag = (item) => (item.forwarded ? (
        <ForwardedLabel>↪ Encaminhada</ForwardedLabel>
    ) : null);

    const renderFooter = (item, isMine, style) => (
        <BubbleFooter style={style}>
            <BubbleTime isMine={isMine}>{formatTime(item.createdAt)}</BubbleTime>
            {isMine && (
                <ReadReceipt
                    status={getMessageDeliveryStatus(item, lastSeenAt, otherUserId)}
                />
            )}
        </BubbleFooter>
    );

    const renderReplyHint = () => (
        <View style={{ justifyContent: "center", paddingHorizontal: 12 }}>
            <Feather name="corner-up-left" size={20} color="#8fa3b2" />
        </View>
    );

    const renderBubbleBody = (item, isMine) => {
        const openActions = () => setActionsFor(item);
        const isPlaying = playingId === item.id;

        if (item.imageUrl) {
            return (
                <Bubble isMine={isMine} style={{ padding: 4 }}>
                    {renderForwardTag(item)}
                    {renderQuote(item)}
                    <TouchableOpacity
                        onPress={() => setFullscreenImage(item.imageUrl)}
                        onLongPress={openActions}
                        activeOpacity={0.9}
                    >
                        <ImageBubble source={{ uri: item.imageUrl }} resizeMode="cover" />
                    </TouchableOpacity>
                    {renderFooter(item, isMine, { paddingHorizontal: 6 })}
                </Bubble>
            );
        }

        if (item.audioUrl) {
            return (
                <Bubble isMine={isMine}>
                    <TouchableOpacity activeOpacity={0.9} onLongPress={openActions}>
                        {renderForwardTag(item)}
                        {renderQuote(item)}
                        <AudioBubble>
                            <AudioPlayButton
                                onPress={() => playAudio(item.id, item.audioUrl)}
                                activeOpacity={0.7}
                            >
                                <Feather
                                    name={isPlaying ? "pause" : "play"}
                                    size={20}
                                    color={isMine ? "#2e5e38" : "#f55b1f"}
                                />
                            </AudioPlayButton>
                            <AudioWave isMine={isMine} />
                            <AudioDuration isMine={isMine}>
                                {formatDuration(item.audioDuration)}
                            </AudioDuration>
                            <RateButton onPress={cyclePlaybackRate} activeOpacity={0.7}>
                                <RateText isMine={isMine}>
                                    {PLAYBACK_RATE_LABEL[playbackRate]}
                                </RateText>
                            </RateButton>
                        </AudioBubble>
                        {renderFooter(item, isMine)}
                    </TouchableOpacity>
                </Bubble>
            );
        }

        if (item.fileUrl) {
            return (
                <Bubble isMine={isMine}>
                    {renderForwardTag(item)}
                    {renderQuote(item)}
                    <TouchableOpacity
                        onPress={() => Linking.openURL(item.fileUrl).catch(() => {})}
                        onLongPress={openActions}
                        activeOpacity={0.7}
                    >
                        <FileRow>
                            <Feather name="file-text" size={24} color={isMine ? "#2e5e38" : "#f55b1f"} />
                            <FileInfo>
                                <FileName isMine={isMine} numberOfLines={1} ellipsizeMode="middle">
                                    {item.fileName || "Documento"}
                                </FileName>
                                {formatFileSize(item.fileSize) ? (
                                    <FileSize isMine={isMine}>
                                        {formatFileSize(item.fileSize)}
                                    </FileSize>
                                ) : null}
                            </FileInfo>
                        </FileRow>
                    </TouchableOpacity>
                    {renderFooter(item, isMine)}
                </Bubble>
            );
        }

        return (
            <Bubble isMine={isMine}>
                <TouchableOpacity activeOpacity={0.9} onLongPress={openActions}>
                    {renderForwardTag(item)}
                    {renderQuote(item)}
                    <BubbleText isMine={isMine}>{item.text}</BubbleText>
                    {renderFooter(item, isMine)}
                </TouchableOpacity>
            </Bubble>
        );
    };

    const renderItem = ({ item }) => {
        const isMine = item.senderId === myId;

        if (item.deletedForEveryone) {
            return (
                <BubbleWrap isMine={isMine}>
                    <Bubble isMine={isMine}>
                        <DeletedText>🚫 Esta mensagem foi apagada</DeletedText>
                        <BubbleFooter>
                            <BubbleTime isMine={isMine}>{formatTime(item.createdAt)}</BubbleTime>
                        </BubbleFooter>
                    </Bubble>
                </BubbleWrap>
            );
        }

        // Chat encerrado: sem swipe-to-reply (não há envio)
        if (isChatClosed) {
            return (
                <BubbleWrap isMine={isMine}>
                    {renderBubbleBody(item, isMine)}
                </BubbleWrap>
            );
        }

        return (
            <Swipeable
                ref={(r) => {
                    if (r) swipeableRefs.current[item.id] = r;
                    else delete swipeableRefs.current[item.id];
                }}
                renderLeftActions={renderReplyHint}
                leftThreshold={40}
                friction={2}
                onSwipeableWillOpen={() => {
                    swipeableRefs.current[item.id]?.close();
                    setReplyingTo(item);
                }}
            >
                <BubbleWrap isMine={isMine}>
                    {renderBubbleBody(item, isMine)}
                </BubbleWrap>
            </Swipeable>
        );
    };

    const mySafeIdMemo = myId ? String(myId).replace(/[@.]/g, "_") : null;
    const visibleMessages = messages.filter((m) => !m.deletedFor?.[mySafeIdMemo]);

    const renderInputArea = () => {
        if (isChatClosed) {
            return (
                <ClosedBar>
                    <ClosedText>🔒 Conversa encerrada</ClosedText>
                    {myRating === null && (
                        <RateActionButton
                            onPress={() => setShowRatingModal(true)}
                            activeOpacity={0.8}
                        >
                            <RateActionText>Avaliar</RateActionText>
                        </RateActionButton>
                    )}
                </ClosedBar>
            );
        }

        if (isSelfChat) {
            return (
                <InputRow>
                    <ChatInput
                        editable={false}
                        placeholder="Você não pode conversar com você mesmo"
                        placeholderTextColor="#b0bec5"
                        style={{ opacity: 0.6 }}
                    />
                </InputRow>
            );
        }

        if (recordingState === "recording") {
            return (
                <RecordingBar>
                    <RoundIconButton
                        color="#8fa3b2"
                        onPress={cancelRecording}
                        activeOpacity={0.7}
                    >
                        <Feather name="trash-2" size={18} color="#fff" />
                    </RoundIconButton>
                    <RecordingDot />
                    <RecordingTimer>{formatDuration(recordingDuration)}</RecordingTimer>
                    <SlideHint {...slidePanResponder.current.panHandlers}>
                        ‹ Deslize para cancelar
                    </SlideHint>
                    <RoundIconButton onPress={stopToPreview} activeOpacity={0.8}>
                        <Feather name="square" size={18} color="#fff" />
                    </RoundIconButton>
                </RecordingBar>
            );
        }

        if (recordingState === "preview") {
            return (
                <PreviewBar>
                    <RoundIconButton
                        color="#8fa3b2"
                        onPress={discardPreview}
                        activeOpacity={0.7}
                    >
                        <Feather name="trash-2" size={18} color="#fff" />
                    </RoundIconButton>
                    <RoundIconButton
                        color="#36536e"
                        onPress={togglePreviewPlayback}
                        activeOpacity={0.8}
                    >
                        <Feather
                            name={isPreviewPlaying ? "pause" : "play"}
                            size={18}
                            color="#fff"
                        />
                    </RoundIconButton>
                    <PreviewDuration>
                        {formatDuration(pendingAudio?.duration)}
                    </PreviewDuration>
                    <View style={{ flex: 1 }} />
                    <RoundIconButton onPress={sendPendingAudio} activeOpacity={0.8}>
                        <Feather name="send" size={18} color="#fff" />
                    </RoundIconButton>
                </PreviewBar>
            );
        }

        return (
            <InputRow>
                <AttachButton onPress={openAttachSheet} activeOpacity={0.7}>
                    <Feather name="paperclip" size={20} color="#64788a" />
                </AttachButton>
                <ChatInput
                    value={text}
                    onChangeText={setText}
                    placeholder="Mensagem..."
                    placeholderTextColor="#8fa3b2"
                    multiline
                />
                <CameraButton onPress={() => pickAndSendImage("camera")} activeOpacity={0.7}>
                    <Feather name="camera" size={20} color="#64788a" />
                </CameraButton>
                {text.trim().length > 0 ? (
                    <SendButton onPress={handleSend} activeOpacity={0.8}>
                        <Feather name="send" size={18} color="#fff" />
                    </SendButton>
                ) : (
                    <RecordButton onPress={startRecording} activeOpacity={0.8}>
                        <Feather name="mic" size={18} color="#fff" />
                    </RecordButton>
                )}
            </InputRow>
        );
    };

    return (
        <Container>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Header>
                    <Feather name="arrow-left" size={22} color="#36536e" onPress={() => navigation.goBack()} />
                    <HeaderTouchable
                        activeOpacity={0.7}
                        onPress={() => {
                            if (otherUserId) {
                                navigation.navigate(dataRoutes.userProfile, {
                                    userId: otherUserId,
                                    userName: headerName,
                                });
                            }
                        }}
                    >
                        <Avatar>
                            <AvatarText>{(headerName?.[0] ?? "?").toUpperCase()}</AvatarText>
                        </Avatar>
                        <HeaderInfo>
                            <HeaderTitle numberOfLines={1}>
                                {headerName}
                            </HeaderTitle>
                            <HeaderRating>
                                {formatRatingLabel(
                                    otherUserRating?.average,
                                    otherUserRating?.count,
                                )}
                            </HeaderRating>
                            {(publicationData?.location || publicationSummary) ? (
                                <HeaderSubtitle numberOfLines={1}>
                                    {[publicationData?.location, publicationSummary]
                                        .filter(Boolean)
                                        .join(" • ")}
                                </HeaderSubtitle>
                            ) : null}
                        </HeaderInfo>
                    </HeaderTouchable>
                    {!isChatClosed && (
                        <MenuButton
                            onPress={handleAttentionPress}
                            activeOpacity={0.7}
                            disabled={attentionCooldown}
                            style={{ opacity: attentionCooldown ? 0.4 : 1 }}
                        >
                            <Feather name="bell" size={20} color="#36536e" />
                        </MenuButton>
                    )}
                    <MenuButton onPress={openHeaderMenu} activeOpacity={0.7}>
                        <Feather name="more-vertical" size={20} color="#36536e" />
                    </MenuButton>
                </Header>

                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={80}
                >
                    <ChatWallpaper />
                    <FlatList
                        ref={listRef}
                        data={visibleMessages}
                        keyExtractor={(item) => item.id ?? String(Math.random())}
                        inverted
                        contentContainerStyle={{ padding: 12 }}
                        renderItem={renderItem}
                    />
                    {isUploading && (
                        <RecordingIndicator>
                            <ActivityIndicator size="small" color="#f55b1f" style={{ marginRight: 8 }} />
                            <RecordingText>{uploadingLabel}</RecordingText>
                        </RecordingIndicator>
                    )}
                    {replyingTo && (
                        <ReplyBar>
                            <ReplyBarText numberOfLines={1}>
                                {`${quoteName(replyingTo)}: ${buildMessagePreview(replyingTo)}`}
                            </ReplyBarText>
                            <TouchableOpacity
                                onPress={() => setReplyingTo(null)}
                                activeOpacity={0.7}
                            >
                                <Feather name="x" size={18} color="#36536e" />
                            </TouchableOpacity>
                        </ReplyBar>
                    )}
                    {renderInputArea()}
                </KeyboardAvoidingView>

                <Modal
                    visible={!!fullscreenImage}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setFullscreenImage(null)}
                >
                    <FullscreenModal>
                        <FullscreenClose
                            onPress={() => setFullscreenImage(null)}
                            activeOpacity={0.8}
                        >
                            <Feather name="x" size={24} color="#fff" />
                        </FullscreenClose>
                        {fullscreenImage && (
                            <Image
                                source={{ uri: fullscreenImage }}
                                style={{ width: "100%", height: "80%" }}
                                resizeMode="contain"
                            />
                        )}
                    </FullscreenModal>
                </Modal>

                <MessageActionsSheet
                    visible={!!actionsFor}
                    onClose={closeActions}
                    actions={messageActions}
                />

                <ForwardModal
                    visible={!!forwardingMsg}
                    onClose={() => setForwardingMsg(null)}
                    chats={forwardChats}
                    onSelect={handleForwardSelect}
                    currentChatId={resolvedChatId}
                />

                <RatingModal
                    visible={showRatingModal}
                    onClose={() => setShowRatingModal(false)}
                    targetName={headerName}
                    onSubmit={handleRatingSubmit}
                />
            </GestureHandlerRootView>
        </Container>
    );
};
