import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";

@Controller("/auth/google")
@UseGuards(AuthGuard("google"))
@ApiTags("Google Auth")
export class GoogleController {
    constructor(private authService: AuthService){}

    @Get()
    googleLogin(@Req() req){}

    @Get("/redirect")
    googleRedirect(@Req() req){
        // return "Google authentication successful! You can now use the application.";
        const {email, displayName: nick_name } = req.user;
        return this.authService.googleLogin({
            email,
            nick_name
        })
    }
}