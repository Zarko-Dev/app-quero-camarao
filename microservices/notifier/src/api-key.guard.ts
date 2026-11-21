import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { timingSafeEqual } from "node:crypto";
import { config } from "./config";

export const safeEqual = (a: string, b: string) => {
    const x = Buffer.from(a);
    const y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
};

@Injectable()
export class ApiKeyGuard implements CanActivate {
    canActivate(ctx: ExecutionContext) {
        const key = String(ctx.switchToHttp().getRequest().headers["x-api-key"] ?? "");
        if (!safeEqual(key, config.apiKey)) throw new UnauthorizedException();
        return true;
    }
}
