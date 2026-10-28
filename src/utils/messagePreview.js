const buildMessagePreview = (message) => {
    if (!message) return "";
    if (message.audioUrl) return "🎵 Áudio";
    if (message.imageUrl) return "📷 Foto";
    if (message.fileUrl) return "📎 Documento";
    if (message.location) return "📍 Localização";
    const text = String(message.text || "");
    if (text.length <= 80) return text;
    return `${text.slice(0, 77)}...`;
};

module.exports = { buildMessagePreview };
