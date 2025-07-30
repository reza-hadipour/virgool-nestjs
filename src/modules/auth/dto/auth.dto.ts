import { IsEmail, IsEnum, IsString, Length } from "class-validator";
import { AuthMethodEnum, AuthTypeEnum } from "../enums/auth.enum";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto{
    @ApiProperty()
    @IsString()
    @Length(3,50)
    username: string;
    @ApiProperty({enum: AuthTypeEnum})
    @IsEnum(AuthTypeEnum)
    type: string;
    @ApiProperty({enum: AuthMethodEnum})
    @IsEnum(AuthMethodEnum)
    method: AuthMethodEnum
}

export class checkOtpDto{
    @ApiProperty()
    @IsString()
    @Length(5,5)
    code: string
}

export class SendSmsDto{
    code: string
    mobile: string
}

export class GoogleUserDto{
    @IsEmail()
    email: string
    @IsString()
    nick_name: string
}