import { Injectable, Logger } from "@nestjs/common";
import { config } from "./config";

const digits = (id?: string) => String(id ?? "").split("@")[0].replace(/\D/g, "");
const CACHE_MS = 10 * 60 * 1000;

@Injectable()
export class WahaClient {
    private readonly log = new Logger(WahaClient.name);
    private cache?: { at: number; ids: string[] };

    private async get(path: string) {
        const res = await fetch(`${config.waha.url}${path}`, { headers: { "X-Api-Key": config.waha.apiKey } });
        if (!res.ok) throw new Error(`WAHA GET ${path} -> ${res.status}`);
        return res.json();
    }

    // Grupos em que a sessão é admin/superadmin. Cache de 10 min; erro => lista vazia
    // (a publicação segue só para os contatos, nunca falha por causa disso).
    async adminGroupIds(): Promise<string[]> {
        if (this.cache && Date.now() - this.cache.at < CACHE_MS) return this.cache.ids;
        try {
            const s = encodeURIComponent(config.waha.session);
            const me = await this.get(`/api/sessions/${s}/me`);
            const mine = new Set([digits(me?.id), digits(me?.lid)].filter(Boolean));
            const groups: { id: string }[] = await this.get(`/api/${s}/groups`);
            const ids: string[] = [];
            for (const g of groups) {
                const parts: { id: string; role: string }[] = await this.get(`/api/${s}/groups/${encodeURIComponent(g.id)}/participants/v2`);
                if (parts.some((p) => mine.has(digits(p.id)) && (p.role === "admin" || p.role === "superadmin"))) ids.push(g.id);
            }
            this.log.log(`grupos admin: ${ids.length}/${groups.length}`);
            this.cache = { at: Date.now(), ids };
            return ids;
        } catch (e) {
            this.log.error(`descoberta de grupos falhou: ${(e as Error).message}`);
            return [];
        }
    }
    private async post(path: string, body: unknown) {
        const res = await fetch(`${config.waha.url}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Api-Key": config.waha.apiKey },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`WAHA ${path} -> ${res.status} ${await res.text()}`);
        return res.json();
    }

    sendText(chatId: string, text: string) {
        return this.post("/api/sendText", { session: config.waha.session, chatId, text });
    }

    sendImage(chatId: string, url: string, caption: string) {
        return this.post("/api/sendImage", {
            session: config.waha.session,
            chatId,
            file: { mimetype: "image/png", url },
            caption,
        });
    }
}
