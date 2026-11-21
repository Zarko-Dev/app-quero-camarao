import { Body, Controller, Post, Query, UnauthorizedException } from "@nestjs/common";
import { safeEqual } from "./api-key.guard";
import { config } from "./config";
import { isOptOut } from "./messages";
import { PRIORITY, QueueService } from "./queue.service";

type WahaMessageEvent = { event?: string; payload?: { from?: string; fromMe?: boolean; body?: string } };

// WAHA chama aqui a cada mensagem recebida (WHATSAPP_HOOK_URL). "SAIR" bloqueia o contato.
@Controller("webhook")
export class WebhookController {
    constructor(private readonly queue: QueueService) {}

    @Post("waha")
    async waha(@Query("secret") secret: string, @Body() body: WahaMessageEvent) {
        if (!safeEqual(String(secret ?? ""), config.webhookSecret)) throw new UnauthorizedException();

        const msg = body?.payload;
        if (body?.event !== "message" || !msg?.from || msg.fromMe || !isOptOut(msg.body)) return { ok: true };
        if (!msg.from.endsWith("@c.us")) return { ok: true };

        await this.queue.addOptOut(msg.from);
        await this.queue.enqueue(`optout_${msg.from}`, {
            chatId: msg.from,
            text: "Pronto! Você não receberá mais avisos do Quero Camarão por aqui.",
            ignoreOptOut: true,
        }, PRIORITY.reply);
        return { ok: true };
    }
}
