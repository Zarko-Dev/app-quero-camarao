const DEFAULT_ENCARTE_BASE_URL = "https://querocamarao.com.br/encarte";

const isValidHttpUrl = (value) =>
    typeof value === "string" &&
    /^https?:\/\/.+/i.test(value.trim());

const buildEncarteLink = ({ providedLink, publicationId }) => {
    if (isValidHttpUrl(providedLink)) {
        return providedLink.trim();
    }

    if (!publicationId) {
        return DEFAULT_ENCARTE_BASE_URL;
    }

    return `${DEFAULT_ENCARTE_BASE_URL}/${encodeURIComponent(publicationId)}`;
};

const buildEncarteContactMessage = ({
    location,
    shrimpSizeLabel,
    grammageValue,
    saleDate,
    encarteLink,
}) => {
    const priceText = grammageValue ? `R$ ${grammageValue},00` : "-";

    return (
        `Ola, venho atraves do aplicativo *Quero Camarao* 🦐\n\n` +
        `Vi seu encarte do *Preco Atual do Camarao* em *${location || "-"}*:\n` +
        `- Camarao de: *${shrimpSizeLabel || "-"}*\n` +
        `- Preco Kg: *${priceText}*\n` +
        `- Despesca: *${saleDate || "-"}*\n` +
        `- Encarte: ${encarteLink}\n\n` +
        `Gostaria de mais informacoes. Poderia me ajudar?`
    );
};

module.exports = {
    buildEncarteLink,
    buildEncarteContactMessage,
};
