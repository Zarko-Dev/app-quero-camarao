import Share from "react-native-share";

// Enquanto não existe um domínio próprio com Universal Links/App Links
// configurados (ver docs/superpowers/specs/2026-07-30-fase9-compartilhar-link-design.md),
// o link exclusivo usa o esquema customizado do app — funciona quando o
// aplicativo já está instalado. Trocar por "https://{DOMINIO}/camarao" assim
// que o domínio existir é a única mudança necessária aqui.
export const PUBLICATION_SHARE_BASE_URL = "querocamarao://publicacao";

const buildShareMessage = ({
    id, location, ponds, shrimps,
}) => {
    const shrimpBlock = (shrimps || [])
        .map((shrimp) => `🍤 Gramatura: ${shrimp.grammage} g\n📦 Quantidade: ${shrimp.kilo} kg`)
        .join("\n");

    return `🍤 Camarão disponível no Quero Camarão!

📍 ${location || ""}
${shrimpBlock}
🌊 Viveiros: ${ponds ?? ""}

Veja os detalhes e fale com o produtor:
${PUBLICATION_SHARE_BASE_URL}/${id}`;
};

export const ShareNativeAction = async (item, dataUri) => {
    try {
        await Share.open({
            title: "Compartilhar publicação",
            message: buildShareMessage(item),
            filename: `camarao-${item.ponds}-${item.location}`,
            url: dataUri,
        });
    } catch (error) {
        console.error("Share error:", error);
    }
};
