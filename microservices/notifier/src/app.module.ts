import { Module } from "@nestjs/common";
import { NotifyController } from "./notify.controller";
import { QueueService } from "./queue.service";
import { WahaClient } from "./waha.client";
import { WebhookController } from "./webhook.controller";

@Module({
    controllers: [NotifyController, WebhookController],
    providers: [QueueService, WahaClient],
})
export class AppModule {}
