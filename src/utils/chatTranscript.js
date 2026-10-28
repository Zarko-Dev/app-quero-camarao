const EMPTY_DATE = "--/--/---- --:--";
const BRT_OFFSET_MS = -3 * 60 * 60 * 1000; // Brasil sem horário de verão

const pad = (n) => String(n).padStart(2, "0");

const formatDate = (createdAt) => {
    if (!createdAt) return EMPTY_DATE;
    const d = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    if (Number.isNaN(d.getTime())) return EMPTY_DATE;
    const b = new Date(d.getTime() + BRT_OFFSET_MS);
    return `${pad(b.getUTCDate())}/${pad(b.getUTCMonth() + 1)}/${b.getUTCFullYear()} ${pad(b.getUTCHours())}:${pad(b.getUTCMinutes())}`;
};

const describe = (m) => {
    if (m.audioUrl) return "🎵 Áudio";
    if (m.imageUrl) return "📷 Foto";
    if (m.videoUrl) return "🎬 Vídeo";
    if (m.fileUrl) return "📎 Documento";
    if (m.location) return `📍 Localização: https://maps.google.com/maps?q=${m.location.lat},${m.location.lng}`;
    return String(m.text || "");
};

// Plain-text export of a chat, for the native share sheet (WhatsApp etc.).
const buildChatTranscript = (messages, { myId, myName, otherName }) =>
    (messages || [])
        .filter((m) => !m.deletedForEveryone && !m.deletedFor?.[myId])
        .map((m) => `[${formatDate(m.createdAt)}] ${m.senderId === myId ? myName : otherName}: ${describe(m)}`)
        .join("\n");

module.exports = { buildChatTranscript };
