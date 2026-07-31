import { useEffect, useRef, useState } from "react";
import { ActionSheetIOS, ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Linking, Modal, Platform, TouchableOpacity, View } from "react-native";
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
    QuoteBlock,
    QuoteName,
    QuoteText,
    RecordButton,
    RecordingIndicator,
    RecordingText,
    ReplyBar,
    ReplyBarText,
    SendButton,
} from "./styles";
import { ChatWallpaper } from "./ChatWallpaper";
import { MessageActionsSheet } from "./MessageActionsSheet";
import { ForwardModal } from "./ForwardModal";

const {
    LOCK_DISTANCE,
    shouldLockRecording,
    shouldKeepRecordingOnRelease,
} = require("./recordingGesture.cjs");

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

    const lastSeenAt = chatMeta?.lastSeenAt || {};

    const [isRecording, setIsRecording] = useState(false);
    const [isRecordingLocked, setIsRecordingLocked] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadingLabel, setUploadingLabel] = useState("");
    const [recordingDuration, setRecordingDuration] = useState(0);

    const [playingId, setPlayingId] = useState(null);
    const [fullscreenImage, setFullscreenImage] = useState(null);

    const [actionsFor, setActionsFor] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [forwardingMsg, setForwardingMsg] = useState(null);
    const [forwardChats, setForwardChats] = useState([]);

    const listRef = useRef(null);
    const recordingRef = useRef(null);
    const durationIntervalRef = useRef(null);
    const soundRef = useRef(null);
    const autoSentRef = useRef(false);
    const messagesReadyRef = useRef(false);
    const recordingTouchStartYRef = useRef(null);
    const recordingTouchCurrentYRef = useRef(null);
    const recordingLockedRef = useRef(false);
    const deliveredMarkedRef = useRef(new Set());
    const lastSeenSignatureRef = useRef("");
    const swipeableRefs = useRef({});

    // Self-chat: usuário abre a própria publicação sem paramBuyerId (seria comprador e vendedor ao mesmo tempo)
    const isSelfChat = myId && sellerId && !paramBuyerId && myId === sellerId;
    const buyerId = paramBuyerId ?? myId;
    const otherUserId = myId === sellerId ? buyerId : sellerId;
    const resolvedChatId = chatId ?? (publication.id && buyerId ? chatDocId(publication.id, buyerId) : null);
    const publicationSummary = buildPublicationSummary(publicationData?.shrimps);

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

    useEffect(() => {
        return () => { stopSound(); };
    }, []);

    const resetRecordingGesture = () => {
        recordingTouchStartYRef.current = null;
        recordingTouchCurrentYRef.current = null;
        recordingLockedRef.current = false;
        setIsRecordingLocked(false);
    };

    const maybeLockRecording = () => {
        if (recordingLockedRef.current) return;
        const startY = recordingTouchStartYRef.current;
        const currentY = recordingTouchCurrentYRef.current;
        if (startY == null || currentY == null) return;
        if (shouldLockRecording(currentY - startY, LOCK_DISTANCE)) {
            recordingLockedRef.current = true;
            setIsRecordingLocked(true);
        }
    };

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

    const openHeaderMenu = () => {
        const details = [
            publicationData?.location ? `📍 ${publicationData.location}` : null,
            publicationSummary ? `🦐 ${publicationSummary}` : null,
        ].filter(Boolean).join("\n");
        const body = details || "Sem dados do anúncio";
        if (Platform.OS === "ios") {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: ["Cancelar", "Ver dados do anúncio"], cancelButtonIndex: 0 },
                (idx) => {
                    if (idx === 1) Alert.alert("Anúncio", body);
                },
            );
        } else {
            Alert.alert("Anúncio", body, [{ text: "OK" }], { cancelable: true });
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
            setIsRecording(true);
            setIsRecordingLocked(false);
            recordingLockedRef.current = false;
            setRecordingDuration(0);
            maybeLockRecording();
            durationIntervalRef.current = setInterval(() => {
                setRecordingDuration((d) => d + 1);
            }, 1000);
        } catch (e) {
            console.error("[Audio] startRecording error", e);
        }
    };

    const stopRecording = async () => {
        if (!recordingRef.current) return;
        clearInterval(durationIntervalRef.current);
        setIsRecording(false);
        setIsRecordingLocked(false);
        recordingLockedRef.current = false;
        recordingTouchStartYRef.current = null;
        recordingTouchCurrentYRef.current = null;
        const duration = recordingDuration;
        setRecordingDuration(0);
        try {
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;
            if (!uri || !myId || !buyerId || !resolvedChatId) return;
            setIsUploading(true);
            setUploadingLabel("Enviando áudio...");
            const { error, url } = await uploadChatAudio(resolvedChatId, uri);
            setIsUploading(false);
            setUploadingLabel("");
            if (!error && url) {
                await sendChatMessage({
                    publicationId: publication.id,
                    sellerId,
                    buyerId,
                    senderId: myId,
                    audioUrl: url,
                    audioDuration: duration,
                    sellerName: resolvedSellerName || "",
                    buyerName,
                    publicationTitle: publication?.publicationTitle || publication?.location || "",
                    publicationLocation: publicationData?.location || "",
                    publicationSummary,
                });
            }
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        } catch (e) {
            console.error("[Audio] stopRecording error", e);
            setIsUploading(false);
            setUploadingLabel("");
        }
    };

    const handleRecordTouchStart = (event) => {
        const startY = event?.nativeEvent?.pageY;
        recordingTouchStartYRef.current = Number.isFinite(startY) ? startY : null;
        recordingTouchCurrentYRef.current = recordingTouchStartYRef.current;
        if (!isRecording) {
            setIsRecordingLocked(false);
            recordingLockedRef.current = false;
        }
    };

    const handleRecordTouchMove = (event) => {
        const currentY = event?.nativeEvent?.pageY;
        recordingTouchCurrentYRef.current = Number.isFinite(currentY) ? currentY : recordingTouchCurrentYRef.current;
        if (isRecording) {
            maybeLockRecording();
        }
    };

    const handleRecordPressOut = async () => {
        if (!isRecording) return;
        if (shouldKeepRecordingOnRelease(recordingLockedRef.current)) return;
        await stopRecording();
    };

    const handleRecordPress = async () => {
        if (isRecording && recordingLockedRef.current) {
            await stopRecording();
        }
    };

    const stopSound = async () => {
        if (soundRef.current) {
            try { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); } catch (_) {}
            soundRef.current = null;
        }
        setPlayingId(null);
    };

    const playAudio = async (msgId, audioUrl) => {
        if (playingId === msgId) { await stopSound(); return; }
        await stopSound();
        try {
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
            const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
            soundRef.current = sound;
            setPlayingId(msgId);
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

    const messageActions = actionsFor ? [
        {
            key: "reply",
            label: "Responder",
            icon: "corner-up-left",
            onPress: handleReplyAction,
        },
        ...(actionsFor.text ? [{
            key: "copy",
            label: "Copiar",
            icon: "copy",
            onPress: handleCopyAction,
        }] : []),
        {
            key: "forward",
            label: "Encaminhar",
            icon: "share",
            onPress: handleForwardAction,
        },
        {
            key: "deleteForMe",
            label: "Apagar para mim",
            icon: "trash",
            onPress: handleDeleteForMeAction,
        },
        ...(actionsFor.senderId === myId ? [{
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
                            <HeaderRating>⭐ Sem avaliações</HeaderRating>
                            {(publicationData?.location || publicationSummary) ? (
                                <HeaderSubtitle numberOfLines={1}>
                                    {[publicationData?.location, publicationSummary]
                                        .filter(Boolean)
                                        .join(" • ")}
                                </HeaderSubtitle>
                            ) : null}
                        </HeaderInfo>
                    </HeaderTouchable>
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
                    {(isRecording || isUploading) && (
                        <RecordingIndicator>
                            {isRecording ? (
                                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#e53935", marginRight: 8 }} />
                            ) : (
                                <ActivityIndicator size="small" color="#f55b1f" style={{ marginRight: 8 }} />
                            )}
                            <RecordingText>
                                {isRecording
                                    ? `${isRecordingLocked ? "Gravando travado" : "Gravando"}... ${formatDuration(recordingDuration)}`
                                    : uploadingLabel}
                            </RecordingText>
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
                    {isSelfChat ? (
                        <InputRow>
                            <ChatInput
                                editable={false}
                                placeholder="Você não pode conversar com você mesmo"
                                placeholderTextColor="#b0bec5"
                                style={{ opacity: 0.6 }}
                            />
                        </InputRow>
                    ) : (
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
                                <RecordButton
                                    onTouchStart={handleRecordTouchStart}
                                    onTouchMove={handleRecordTouchMove}
                                    onLongPress={startRecording}
                                    onPress={handleRecordPress}
                                    onPressOut={handleRecordPressOut}
                                    onTouchCancel={handleRecordPressOut}
                                    activeOpacity={0.8}
                                    isRecording={isRecording}
                                    isLocked={isRecordingLocked}
                                >
                                    <Feather name="mic" size={18} color="#fff" />
                                </RecordButton>
                            )}
                        </InputRow>
                    )}
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
            </GestureHandlerRootView>
        </Container>
    );
};
