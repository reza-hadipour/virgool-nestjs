import { Injectable, NestMiddleware, UnauthorizedException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { AuthService } from "src/modules/auth/auth.service";
import { isJWT } from "class-validator";
import { ExtractToken } from "../utils/extract-token.util";

@Injectable()
export class AddUserToReqWOV implements NestMiddleware{
    constructor(private authService: AuthService) {}

    async use(req: Request, res: Response, next: NextFunction) {
        let token: any;

        try {
            token = ExtractToken(req);
            const user = await this.authService.getUserByAccessToken(token);
            if(user) req.user = user;
        } catch (error) {
            console.error(error);
            return next();
        }

        next();
    }
}



    