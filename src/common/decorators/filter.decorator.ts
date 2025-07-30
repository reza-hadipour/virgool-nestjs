import { applyDecorators } from "@nestjs/common";
import { ApiQuery } from "@nestjs/swagger";

export function FilterBlog(){
    return applyDecorators(
        ApiQuery({name: "search", example: "nodejs", required: false, type: "string"}),
        ApiQuery({name: "category", example: "cat", required: false, type: "string"})
    )
}