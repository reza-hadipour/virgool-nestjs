import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ImageDto {
    @ApiProperty({format: "binary"})
    image: string
    @ApiProperty()
    name: string
    @ApiPropertyOptional()
    alt: string
}
