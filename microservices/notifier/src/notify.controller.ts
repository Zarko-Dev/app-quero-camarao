import { BadRequestException, Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiKeyGuard } from "./api-key.guard";
import { config } from "./config";
import { buildChatText, buildPublicationText, PublicationInput } from "./messages";
import { toWhatsappId } from "./phone";
import { PRIORITY, QueueService } from "./queue.service";
import { WahaClient } from "./waha.client";

type PublicationBody = PublicationInput & { recipients?: string[] };
type ChatBody = { chatId: string; recipientPhone: string; senderName?: string };

@Controller("notify")
@UseGuards(ApiKeyGuard)
export class NotifyController {
    constructor(private readonly queue: QueueService, private readonly waha: WahaClient) {}

    @Post("publication")
    async publication(@Body() body: PublicationBody) {
        if (!body?.publicationId) throw new BadRequestException("publicationId obrigatório");

        const text = buildPublicationText(body);
        const imageUrl = config.encarteBaseUrl
            ? `${config.encarteBaseUrl}/${encodeURIComponent(`encartes/${body.publicationId}.png`)}?alt=media`
            : undefined;

        const contacts = [...new Set((body.recipients ?? []).map(toWhatsappId).filter((c): c is string => !!c))];
        const id = body.publicationId;
        const groupIds = config.groupIds.length ? config.groupIds : await this.waha.adminGroupIds();

        await Promise.all([
            ...groupIds.map((g) => this.queue.enqueue(`pub_${id}_${g}`, { chatId: g, text, imageUrl }, PRIORITY.group)),
            ...contacts.map((c) => this.queue.enqueue(`pub_${id}_${c}`, { chatId: c, text, imageUrl }, PRIORITY.contact)),
        ]);
        return { groups: groupIds.length, contacts: contacts.length };
    }

    @Post("chat")
    async chat(@Body() body: ChatBody) {
        const to = toWhatsappId(body?.recipientPhone);
        if (!body?.chatId || !to) throw new BadRequestException("chatId e recipientPhone válidos obrigatórios");

        const first = await this.queue.firstInWindow(`wpp_chat_${body.chatId}_${to}`, config.chatDebounceSec);
        if (!first) return { queued: false, reason: "debounce" };

        await this.queue.enqueue(`chat_${body.chatId}_${to}_${Date.now()}`, { chatId: to, text: buildChatText(body.senderName) }, PRIORITY.contact);
        return { queued: true };
    }
}
