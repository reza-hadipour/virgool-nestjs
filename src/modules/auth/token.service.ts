import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AccessTokenPayload, CookiePayload } from "./types/payload";
import { retry } from "rxjs";

@Injectable()
export class TokenService{
    constructor(
        private jwtService: JwtService
    ){}

    GenerateOtpToken(payload: CookiePayload){
        const token = this.jwtService.sign(payload,{
            secret: process.env.SECRET_JWT,
            expiresIn: 60*2
        })

        return token;
    }

    VerifyOtpToken(token: string){
        try {
            let payload: CookiePayload = this.jwtService.verify(token,{secret: process.env.SECRET_JWT})
            return payload;
        } catch (error) {
            throw new UnauthorizedException("Invalid token.")
        }
    }

    GenerateAccessToken(payload: AccessTokenPayload){
        const token = this.jwtService.sign(payload,{
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: "365d"
        })
        return token;
    }

    VerifyAccessToken(token: string): AccessTokenPayload{
        let result;

        try {
            result = this.jwtService.verify(token,{secret:process.env.ACCESS_TOKEN_SECRET})
            if(!result || !result.userId) throw new UnauthorizedException("Invalid AccessToken.");

        } catch (error) {
            if(error) throw new UnauthorizedException("Invalid AccessToken.")
        }

        return {
                userId: result.userId
            }
    }
}