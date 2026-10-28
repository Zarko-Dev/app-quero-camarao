const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const { logger } = require("firebase-functions");

// === CONFIGURAÇÕES DA EVOLUTION API ===
// Substitua pelos valores reais da sua Evolution API no Cloud Run
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "https://sua-evolution-api-aqui.run.app";
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || "QueroCamaraoBot";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "sua_apikey_global_aqui";

/**
 * Função utilitária para enviar mensagem de texto via Evolution API
 */
async function sendWhatsAppMessage(phone, text) {
    if (!phone) return false;
    const digits = phone.replace(/\D/g, "");
    const cleanDigits = digits.startsWith("55") ? digits.slice(2) : digits;
    const remoteJid = `55${cleanDigits}@s.whatsapp.net`;

    try {
        const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                apikey: EVOLUTION_API_KEY,
            },
            body: JSON.stringify({
                number: remoteJid,
                text: text,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            logger.error(`Erro ao enviar WhatsApp para ${remoteJid}:`, errorData);
            return false;
        }

        return true;
    } catch (error) {
        logger.error(`Falha na requisição para Evolution API (${remoteJid}):`, error);
        return false;
    }
}

/**
 * CRON 1: Carrinho Abandonado
 * Roda a cada hora para encontrar pedidos 'waiting' não pagos.
 */
exports.cronAbandonedCheckout = onSchedule("0 * * * *", async (event) => {
    logger.info("Iniciando cronAbandonedCheckout...");
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    // 2 horas atrás
    const twoHoursAgo = new admin.firestore.Timestamp(now.seconds - 2 * 60 * 60, 0);
    // 24 horas atrás (para não mandar mensagem pra carrinho de meses atrás)
    const twentyFourHoursAgo = new admin.firestore.Timestamp(now.seconds - 24 * 60 * 60, 0);

    const ordersSnapshot = await db.collection("orders")
        .where("status", "==", "waiting")
        .where("createdAt", "<=", twoHoursAgo)
        .where("createdAt", ">=", twentyFourHoursAgo)
        .get();

    for (const doc of ordersSnapshot.docs) {
        const order = doc.data();

        // Se já mandou a recuperação, pula
        if (order.abandonedRecoverySent === true) continue;

        const phone = order.user?.phone;
        const paymentValue = order.paymentValue || "0,00";

        if (phone) {
            const msg = `Olá! Vi que você deixou uma publicação de camarão esperando na plataforma. Não perca a oportunidade de vender! Conclua seu pagamento de R$ ${paymentValue}. Posso te ajudar em algo?\n\n(Se já tiver publicado seu camarão, desconsidere essa mensagem)`;
            
            const sent = await sendWhatsAppMessage(phone, msg);
            
            if (sent) {
                // Marca que a mensagem foi enviada para não mandar de novo
                await doc.ref.update({ abandonedRecoverySent: true });
                logger.info(`Mensagem de recuperação enviada para o pedido ${doc.id}`);
                
                // Espera 3 segundos para não metralhar a API do WhatsApp (Spam/Bloqueio)
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }
        }
    }
});

/**
 * CRON 2: Reengajamento de Produtores Inativos
 * Roda todo dia às 10h da manhã.
 */
exports.cronInactiveUsers = onSchedule("0 10 * * *", async (event) => {
    logger.info("Iniciando cronInactiveUsers...");
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();

    // 15 dias atrás
    const fifteenDaysAgo = new admin.firestore.Timestamp(now.seconds - 15 * 24 * 60 * 60, 0);

    // DICA: Para otimizar isso, o ideal é que quando o produtor publique, salve `lastPublicationDate: Timestamp` no doc dele em 'users'.
    // Como exemplo, vamos buscar todos os produtores e verificar a última publicação.
    
    // (Opcionalmente, crie uma query simples se tiver lastPublicationDate)
    const usersSnapshot = await db.collection("users")
        .where("userType", "==", "productor")
        .get();

    let countSent = 0;

    for (const doc of usersSnapshot.docs) {
        const user = doc.data();

        // Evitar spam: checa se já mandou aviso recente (ex: não mandar mais que 1 a cada 7 dias)
        const lastPing = user.lastInactivePingDate;
        if (lastPing && lastPing.seconds > (now.seconds - 7 * 24 * 60 * 60)) {
            continue; 
        }

        const phone = user.phone;
        if (phone) {
            const msg = `Fala meu amigo produtor, saudades do seu camarão! Que tal publicar hoje no app Quero Camarão?`;
            
            const sent = await sendWhatsAppMessage(phone, msg);
            
            if (sent) {
                await doc.ref.update({ lastInactivePingDate: now });
                countSent++;
                logger.info(`Reengajamento enviado para o produtor ${user.email}`);

                // Fila espaçada: 10 segundos entre cada mensagem para evitar Banimento da Meta
                await new Promise((resolve) => setTimeout(resolve, 10000));
            }
        }
    }
    
    logger.info(`cronInactiveUsers finalizado. ${countSent} produtores contatados.`);
});
