import Share from "react-native-share";

export const ShareNativeAction = async (
    androidUri,
    iosUri,
    ponds,
    location,
    dataUri,
) => {
    try {
        await Share.open({
            title: "Compartilhar publicação",
            message: `Olha que incrivel esta publicação na Quero Camarão, da uma olhada lá:

Android/IOS: https://onelink.to/n26bv8?sec=AplicativoQueroCamarão/Android/iOS`,
            filename: `camarao-${ponds}-${location}`,
            url: dataUri,
        });
    } catch (error) {
        console.error("Share error:", error);
    }
};
