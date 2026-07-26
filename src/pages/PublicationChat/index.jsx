import { useEffect, useRef, useState } from "react";
import { ActionSheetIOS, ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Modal, Platform, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc } from "firebase/firestore";

import { GetUserStorage } from "../../services/Storage/UserStorage";
import { firestore } from "../../services/Firebase";
import { models } from "../../services/Firebase/models";
import { sendChatMessage, subscribeToChat, markChatAsSeen, chatDocId } from "../../controllers/Chat";
import { uploadChatAudio } from "../../controllers/Chat/uploadAudio";
import { uploadChatImage } from "../../controllers/Chat/uploadImage";
import { getMessageReadStatus } from "../../utils/chatReadStatus";
import { setActiveChatId } from "../../utils/activeChatTracker";
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
    ChatInput,
    Container,
    FullscreenClose,
    FullscreenModal,
    Header,
    HeaderInfo,
    HeaderSubtitle,
    HeaderTitle,
    ImageBubble,
    InputRow,
    RecordButton,
    RecordingIndicator,
    RecordingText,
    SendButton,
} from "./styles";

const ReadReceipt = ({ status }) => (
    <View style={{ flexDirection: "row" }}>
        <Feather
            name="check"
            size={12}
            color={status === "read" ? "#ffd9c2" : "rgba(255,255,255,0.7)"}
        />
        {status === "read" && (
            <Feather
                name="check"
                size={12}
                color="#ffd9c2"
                style={{ marginLeft: -7 }}
            />
        )}
    </View>
);

export const PublicationChat = ({ route, navigation }) => {
    const { publication, sellerId, sellerName, buyerName: paramBuyerName, chatId, buyerId: paramBuyerId, initialMessage, autoSend } = route.params;

    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [resolvedSellerName, setResolvedSellerName] = useState(sellerName || "");
    const [resolvedBuyerName, setResolvedBuyerName] = useState(paramBuyerName || "");
    const [myId, setMyId] = useState(null);
    const [buyerName, setBuyerName] = useState(paramBuyerName || "");
    const [publicationData, setPublicationData] = useState(publication);
    const [lastSeenAt, setLastSeenAt] = useState({});

    const [isRecording, setIsRecording] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadingLabel, setUploadingLabel] = useState("");
    const [recordingDuration, setRecordingDuration] = useState(0);

    const [playingId, setPlayingId] = useState(null);
    const [fullscreenImage, setFullscreenImage] = useState(null);

    const listRef = useRef(null);
    const recordingRef = useRef(null);
    const durationIntervalRef = useRef(null);
    const soundRef = useRef(null);
    const autoSentRef = useRef(false);
    const messagesReadyRef = useRef(false);

    // Self-chat: usuário abre a própria publicação sem paramBuyerId (seria comprador e vendedor ao mesmo tempo)
    const isSelfChat = myId && sellerId && !paramBuyerId && myId === sellerId;
    const buyerId = paramBuyerId ?? myId;
    const otherUserId = myId === sellerId ? buyerId : sellerId;
    const resolvedChatId = chatId ?? (publication.id && buyerId ? chatDocId(publication.id, buyerId) : null);

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
        });
    }, [myId, resolvedSellerName, messages]);

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
                    markChatAsSeen(resolvedChatId, myId);
                }
            },
            onChatMeta: (meta) => setLastSeenAt(meta?.lastSeenAt || {}),
        });
        return unsub;
    }, [publication.id, buyerId]);

    useEffect(() => {
        if (!resolvedChatId) return undefined;
        setActiveChatId(resolvedChatId);
        return () => setActiveChatId(null);
    }, [resolvedChatId]);

    useEffect(() => {
        return () => { stopSound(); };
    }, []);

    const handleSend = async () => {
        const trimmed = text.trim();
        if (!trimmed || !myId || !buyerId) return;
        setText("");
        await sendChatMessage({
            publicationId: publication.id,
            sellerId,
            buyerId,
            senderId: myId,
            text: trimmed,
            sellerName: resolvedSellerName || "",
            buyerName,
            publicationTitle: publication?.publicationTitle || publication?.location || "",
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
                });
            }
        } catch (e) {
            console.error("[Chat] pickAndSendImage error", e);
            setIsUploading(false);
            setUploadingLabel("");
        }
    };

    const openAttachSheet = () => {
        if (Platform.OS === "ios") {
            ActionSheetIOS.showActionSheetWithOptions(
                { options: ["Cancelar", "Galeria", "Câmera"], cancelButtonIndex: 0 },
                (idx) => {
                    if (idx === 1) pickAndSendImage("gallery");
                    if (idx === 2) pickAndSendImage("camera");
                },
            );
        } else {
            pickAndSendImage("gallery");
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
            setRecordingDuration(0);
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
                });
            }
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        } catch (e) {
            console.error("[Audio] stopRecording error", e);
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

    const formatTime = (createdAt) => {
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

    const renderItem = ({ item }) => {
        const isMine = item.senderId === myId;
        const isPlaying = playingId === item.id;

        if (item.imageUrl) {
            return (
                <BubbleWrap isMine={isMine}>
                    <Bubble isMine={isMine} style={{ padding: 4 }}>
                        <TouchableOpacity onPress={() => setFullscreenImage(item.imageUrl)} activeOpacity={0.9}>
                            <ImageBubble source={{ uri: item.imageUrl }} resizeMode="cover" />
                        </TouchableOpacity>
                        <BubbleFooter style={{ paddingHorizontal: 6 }}>
                            <BubbleTime isMine={isMine}>{formatTime(item.createdAt)}</BubbleTime>
                            {isMine && (
                                <ReadReceipt
                                    status={getMessageReadStatus(item, lastSeenAt, otherUserId)}
                                />
                            )}
                        </BubbleFooter>
                    </Bubble>
                </BubbleWrap>
            );
        }

        if (item.audioUrl) {
            return (
                <BubbleWrap isMine={isMine}>
                    <Bubble isMine={isMine}>
                        <AudioBubble>
                            <AudioPlayButton onPress={() => playAudio(item.id, item.audioUrl)} activeOpacity={0.7}>
                                <Feather name={isPlaying ? "pause" : "play"} size={20} color={isMine ? "#fff" : "#f55b1f"} />
                            </AudioPlayButton>
                            <AudioWave isMine={isMine} />
                            <AudioDuration isMine={isMine}>{formatDuration(item.audioDuration)}</AudioDuration>
                        </AudioBubble>
                        <BubbleFooter>
                            <BubbleTime isMine={isMine}>{formatTime(item.createdAt)}</BubbleTime>
                            {isMine && (
                                <ReadReceipt
                                    status={getMessageReadStatus(item, lastSeenAt, otherUserId)}
                                />
                            )}
                        </BubbleFooter>
                    </Bubble>
                </BubbleWrap>
            );
        }

        return (
            <BubbleWrap isMine={isMine}>
                <Bubble isMine={isMine}>
                    <BubbleText isMine={isMine}>{item.text}</BubbleText>
                    <BubbleFooter>
                        <BubbleTime isMine={isMine}>{formatTime(item.createdAt)}</BubbleTime>
                        {isMine && (
                            <ReadReceipt
                                status={getMessageReadStatus(item, lastSeenAt, otherUserId)}
                            />
                        )}
                    </BubbleFooter>
                </Bubble>
            </BubbleWrap>
        );
    };

    const headerName = myId === sellerId
        ? (resolvedBuyerName || buyerName || "Comprador")
        : (resolvedSellerName || "Produtor");

    return (
        <Container>
            <Header>
                <Feather name="arrow-left" size={22} color="#36536e" onPress={() => navigation.goBack()} />
                <Avatar>
                    <AvatarText>{(headerName?.[0] ?? "?").toUpperCase()}</AvatarText>
                </Avatar>
                <HeaderInfo>
                    <HeaderTitle numberOfLines={1}>
                        {headerName}
                    </HeaderTitle>
                    {(publicationData?.location || publicationData?.shrimps?.length > 0) ? (
                        <HeaderSubtitle numberOfLines={1}>
                            {publicationData?.location ? `📍 ${publicationData.location}` : ""}
                            {publicationData?.location && publicationData?.shrimps?.length > 0 ? "  ·  " : ""}
                            {publicationData?.shrimps?.length > 0
                                ? `🦐 ${publicationData.shrimps.map((s) => `${s.grammage}g/${s.kilo}kg`).join(" · ")}`
                                : ""}
                        </HeaderSubtitle>
                    ) : null}
                </HeaderInfo>
            </Header>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={80}
            >
                <FlatList
                    ref={listRef}
                    data={messages}
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
                            {isRecording ? `Gravando... ${formatDuration(recordingDuration)}` : uploadingLabel}
                        </RecordingText>
                    </RecordingIndicator>
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
                        {text.trim().length > 0 ? (
                            <SendButton onPress={handleSend} activeOpacity={0.8}>
                                <Feather name="send" size={18} color="#fff" />
                            </SendButton>
                        ) : (
                            <RecordButton
                                onLongPress={startRecording}
                                onPressOut={isRecording ? stopRecording : undefined}
                                activeOpacity={0.8}
                                isRecording={isRecording}
                            >
                                <Feather name="mic" size={18} color="#fff" />
                            </RecordButton>
                        )}
                    </InputRow>
                )}
            </KeyboardAvoidingView>

            <Modal visible={!!fullscreenImage} transparent animationType="fade" onRequestClose={() => setFullscreenImage(null)}>
                <FullscreenModal>
                    <FullscreenClose onPress={() => setFullscreenImage(null)} activeOpacity={0.8}>
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
        </Container>
    );
};
