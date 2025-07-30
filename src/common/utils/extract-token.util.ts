import { UnauthorizedException } from "@nestjs/common";
import { isJWT } from "class-validator";
import { Request } from "express";

export function ExtractToken(request: Request){
    const { authorization } = request.headers;

    if(!authorization || authorization?.trim() == "")
        throw new UnauthorizedException("Login Please.")

    const [bearer, token] = authorization?.split(" ");

    if(bearer.toLowerCase() !== 'bearer' || !token || !isJWT(token))
        throw new UnauthorizedException("Login Again.")

    return token;
}