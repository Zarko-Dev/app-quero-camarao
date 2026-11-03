import Share from "react-native-share";

import {
    PUBLICATION_SHARE_BASE_URL,
    buildShareMessage,
} from "../../../utils/publicationShareMessage";

export { PUBLICATION_SHARE_BASE_URL };

// Uma mensagem só: texto + link https. O WhatsApp monta a prévia com a imagem
// do encarte (og:image da página /publicacao/<id>) e o link fica clicável.
export const ShareNativeAction = async (item) => {
    try {
        await Share.open({
            title: "Compartilhar publicação",
            message: buildShareMessage(item),
        });
    } catch (error) {
        if (__DEV__) console.log("[Share] share dismissed/failed:", error?.message);
    }
};
