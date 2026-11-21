import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Queue, Worker } from "bullmq";
import Redis from "ioredis";
import { config } from "./config";
import { WahaClient } from "./waha.client";

export type SendJob = { chatId: string; text: string; imageUrl?: string; ignoreOptOut?: boolean };

// 0 = resposta ao SAIR, 1 = grupos, 2 = clientes
export const PRIORITY = { reply: 1, group: 2, contact: 3 } as const;

const OPTOUT_KEY = "wpp:optout";

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
    private readonly log = new Logger(QueueService.name);
    private redis = new Redis({ ...config.redis, maxRetriesPerRequest: null });
    private queue = new Queue<SendJob>("wpp", { connection: this.redis });
    private worker?: Worker<SendJob>;

    constructor(private readonly waha: WahaClient) {}

    onModuleInit() {
        this.worker = new Worker<SendJob>("wpp", (job) => this.send(job.data), {
            connection: this.redis,
            concurrency: 1,
            limiter: { max: 1, duration: config.sendIntervalMs },
        });
        this.worker.on("failed", (job, err) => this.log.error(`falhou ${job?.data.chatId}: ${err.message}`));
    }

    async onModuleDestroy() {
        await this.worker?.close();
        await this.queue.close();
        this.redis.disconnect();
    }

    private async send(job: SendJob) {
        if (!job.ignoreOptOut && await this.redis.sismember(OPTOUT_KEY, job.chatId)) return;
        await new Promise((r) => setTimeout(r, Math.random() * 3000));
        if (job.imageUrl) await this.waha.sendImage(job.chatId, job.imageUrl, job.text);
        else await this.waha.sendText(job.chatId, job.text);
    }

    // jobId custom evita duplicar se a Cloud Function reenviar o mesmo evento.
    enqueue(jobId: string, data: SendJob, priority: number) {
        return this.queue.add("send", data, {
            jobId,
            priority,
            attempts: 3,
            backoff: { type: "exponential", delay: 30_000 },
            removeOnComplete: 1000,
            removeOnFail: 1000,
        });
    }

    addOptOut(chatId: string) {
        return this.redis.sadd(OPTOUT_KEY, chatId);
    }

    // true se este é o primeiro aviso na janela (SET NX EX).
    async firstInWindow(key: string, seconds: number) {
        return (await this.redis.set(key, "1", "EX", seconds, "NX")) === "OK";
    }
}
