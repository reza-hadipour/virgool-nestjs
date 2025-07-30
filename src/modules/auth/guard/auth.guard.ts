import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { isJWT } from "class-validator";
import { Request } from "express";
import { AuthService } from "../auth.service";
import { Reflector } from "@nestjs/core";
import { SKIP_AUTH } from "src/common/decorators/skip-auth.decorator";
import { ExtractToken } from "src/common/utils/extract-token.util";
import { UserStatus } from "src/modules/user/enums/user_status.enum";

@Injectable()
export class AuthGuard implements CanActivate{
    constructor(private authService: AuthService, private reflector:Reflector){}

    async canActivate(context: ExecutionContext) {
        const isSkippedAuthorization = this.reflector.get<boolean>(SKIP_AUTH,context.getHandler());
        if(isSkippedAuthorization) return true;

        const http = context.switchToHttp();
        const request = http.getRequest<Request>();

        const token = ExtractToken(request);
       
        request.user = await this.authService.getUserByAccessToken(token);

        if(request.user.status === UserStatus.Block) throw new ForbiddenException("You're blocked, contact administrator.")

        return true
    }
}