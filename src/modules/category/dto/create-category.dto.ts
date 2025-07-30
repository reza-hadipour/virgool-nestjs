import { Optional } from "@nestjs/common";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty()
    @IsString()
    @Length(3)
    title: string
    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    priority: number
}
