import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class ChangeEmailDto{
    @ApiProperty()
    @IsEmail()
    email: string
}