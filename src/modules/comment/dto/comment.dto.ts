import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsOptional, Length } from "class-validator";

export class CreateCommentDto {
    @ApiProperty()
    @IsNotEmpty()
    @Length(5)
    text: string;
    @ApiProperty()
    @IsNumberString()
    blogId: number;
    @ApiPropertyOptional({nullable: true})
    @IsOptional()
    @IsNumberString()
    parentId: number
}