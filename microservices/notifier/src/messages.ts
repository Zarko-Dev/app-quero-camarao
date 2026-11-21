export const SITE_URL = "https://querocamarao.com.br";
export const OPT_OUT_FOOTER = "Para não receber mais avisos, responda SAIR.";

export type Shrimp = { grammage?: string | number; kilo?: string | number };
export type PublicationInput = {
    publicationId: string;
    location?: string;
    shrimps?: Shrimp[];
};

export const publicationLink = (id: string) => `${SITE_URL}/publicacao/${id}`;

export const buildPublicationText = (pub: PublicationInput): string => {
    const shrimps = pub.shrimps ?? [];
    const totalKg = shrimps.reduce((sum, s) => sum + (Number(s.kilo) || 0), 0);
    const grammages = [...new Set(shrimps.map((s) => s.grammage).filter((g) => g != null && g !== ""))];
    const what = totalKg > 0 ? `${totalKg} kg de camarão` : "Camarão";
    const grams = grammages.length ? ` de ${grammages.join("/")}g` : "";
    const where = pub.location ? ` em ${pub.location}` : "";

    return [
        "🦐 *Novo camarão publicado!*",
        `${what}${grams}${where}`,
        "",
        `Veja e negocie: ${publicationLink(pub.publicationId)}`,
        "",
        OPT_OUT_FOOTER,
    ].join("\n");
};

// Sem o conteúdo da conversa: dado privado não vai para o WhatsApp.
export const buildChatText = (senderName?: string): string => [
    `💬 *${senderName || "Alguém"}* te enviou uma mensagem no Quero Camarão.`,
    "",
    `Responda pelo app: ${SITE_URL}`,
    "",
    OPT_OUT_FOOTER,
].join("\n");

export const isOptOut = (text?: string) => String(text ?? "").trim().toUpperCase() === "SAIR";
