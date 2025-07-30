import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, Length } from "class-validator";

export class CreateBlogDto {
    @ApiProperty()
    @IsNotEmpty()
    @Length(3,150)
    title: string
    @ApiPropertyOptional()
    slug: string
    @ApiPropertyOptional({format: "binary"})
    image: string
    @ApiProperty()
    @IsNotEmpty()
    @Length(3,300)
    description: string
    @ApiProperty()
    @IsNotEmpty()
    @Length(100)
    content: string
    @ApiPropertyOptional({type: "string", isArray: true})
    // @IsArray()
    categories: string[] | string
}

export class UpdateBlogDto extends PartialType(CreateBlogDto) {
    
}

export class FilterBlogDto {
    category: string
    search: string
}