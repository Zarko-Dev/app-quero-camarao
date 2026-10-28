import Share from "react-native-share";

import {
    PUBLICATION_SHARE_BASE_URL,
    buildShareMessage,
} from "../../../utils/publicationShareMessage";

export { PUBLICATION_SHARE_BASE_URL };

// Principal: só texto + link https. O WhatsApp iOS descarta o texto quando há
// imagem anexa, e o link clicável precisa ir no texto.
export const ShareNativeAction = async (item) => {
    try {
        await Share.open({
            title: "Compartilhar publicação",
            message: buildShareMessage(item),
        });
    } catch (error) {
        if (__DEV__) console.log("[Share] text share dismissed/failed:", error?.message);
    }
};

// Duas mensagens: 1) imagem do encarte; 2) texto com o link https.
// Assim o WhatsApp iOS não descarta o texto (ele só descarta texto junto de imagem).
export const ShareImageAction = async (item, dataUri) => {
    try {
        await Share.open({
            title: "Compartilhar imagem do encarte",
            filename: `camarao-${item.ponds}-${item.location}`,
            url: dataUri,
        });
    } catch (error) {
        if (__DEV__) console.log("[Share] image share dismissed/failed:", error?.message);
        return;
    }

    await ShareNativeAction(item);
};
