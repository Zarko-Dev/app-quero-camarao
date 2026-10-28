const { formatKilo } = require("./formatKilo");

// Link https (clicável no WhatsApp): a ponte hospedada em
// querocamarao.com.br/publicacao/<id> abre o app via querocamarao://
// e cai na loja se o app não estiver instalado.
const PUBLICATION_SHARE_BASE_URL = "https://querocamarao.com.br/publicacao";

const buildShareMessage = ({
    id, location, ponds, shrimps,
}) => {
    const shrimpBlock = (shrimps || [])
        .map((shrimp) => `🍤 Gramatura: ${shrimp.grammage} g\n📦 Quantidade: ${formatKilo(shrimp.kilo)} kg`)
        .join("\n");

    return `🍤 Camarão disponível no Quero Camarão!

📍 ${location || ""}
${shrimpBlock}
🌊 Viveiros: ${ponds ?? ""}

Veja os detalhes e fale com o produtor:
${PUBLICATION_SHARE_BASE_URL}/${id}`;
};

module.exports = { PUBLICATION_SHARE_BASE_URL, buildShareMessage };
