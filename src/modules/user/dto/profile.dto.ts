import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";
import { BaseEntity } from "src/common/abstracts/BaseEntity.abstract";
import { GenderEnum } from "src/common/enums/gender.enum";

export class ProfileDto{
    @ApiPropertyOptional({nullable: true})
    @IsOptional()
    @Length(3,100)
    nick_name: string;
    @ApiPropertyOptional({nullable: true})
    @IsOptional()
    @Length(3,200)
    bio: string;
    @ApiPropertyOptional({nullable: true, format: "binary"})
    image_profile: string
    @ApiPropertyOptional({nullable: true, format: "binary"})
    bg_image: string
    @ApiPropertyOptional({nullable: true, enum: GenderEnum})
    gender: string
    @ApiPropertyOptional({nullable: true, example: "1990-07-06T08:36:55.485Z"})
    birthday: Date
    @ApiPropertyOptional({nullable: true})
    x_profile: string
    @ApiPropertyOptional({nullable: true})
    linkedin_profile: string
}