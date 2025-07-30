import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumesEnum } from 'src/common/enums/swagger-consumes.enum';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Pagination } from 'src/common/decorators/pagination.decorator';

@Controller('category')
@ApiTags("Category")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiConsumes(SwaggerConsumesEnum.Urlencoded, SwaggerConsumesEnum.JSON)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  @Pagination()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.categoryService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id' ,ParseIntPipe) id: Number) {
    return this.categoryService.findOne(+id);
  }

  @Patch(':id')
  @ApiConsumes(SwaggerConsumesEnum.Urlencoded, SwaggerConsumesEnum.JSON)
  update(@Param('id', ParseIntPipe) id: Number, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: Number) {
    return this.categoryService.remove(+id);
  }
}
