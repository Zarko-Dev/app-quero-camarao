const required = (name: string): string => {
    const v = process.env[name];
    if (!v) throw new Error(`Variável de ambiente ausente: ${name}`);
    return v;
};

export const config = {
    port: Number(process.env.PORT ?? 3000),
    apiKey: required("NOTIFIER_API_KEY"),
    webhookSecret: required("WEBHOOK_SECRET"),
    redis: { host: process.env.REDIS_HOST ?? "redis", port: Number(process.env.REDIS_PORT ?? 6379) },
    waha: {
        url: process.env.WAHA_URL ?? "http://waha:3000",
        apiKey: required("WAHA_API_KEY"),
        session: process.env.WAHA_SESSION ?? "default",
    },
    // Opcional: fixa os grupos (@g.us, separados por vírgula). Vazio = descobre sozinho os grupos em que o número é admin.
    groupIds: (process.env.WPP_GROUP_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
    // Intervalo mínimo entre envios (ms) + até 3s de jitter. Anti-ban.
    sendIntervalMs: Number(process.env.SEND_INTERVAL_MS ?? 8000),
    // Mesma conversa só gera novo aviso depois disso (s).
    chatDebounceSec: Number(process.env.CHAT_DEBOUNCE_SEC ?? 1800),
    encarteBaseUrl: process.env.ENCARTE_BASE_URL ?? "", // https://firebasestorage.googleapis.com/v0/b/<bucket>/o
};
