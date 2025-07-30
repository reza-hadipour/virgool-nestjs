import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseInterceptors } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto, FilterBlogDto, UpdateBlogDto } from './dto/blog.dto';
import { ApiConsumes } from '@nestjs/swagger';
import { SwaggerConsumesEnum } from 'src/common/enums/swagger-consumes.enum';
import { UploadedOptionalFiles } from 'src/common/decorators/upload-file.decorator';
import { BlogImage } from './types/file';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { SkipAuth } from 'src/common/decorators/skip-auth.decorator';
import { FilterBlog } from 'src/common/decorators/filter.decorator';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { UploadFile } from 'src/common/interceptors/upload.interceptor';

@Controller('blog')
@AuthDecorator()
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post("/")
  @ApiConsumes(SwaggerConsumesEnum.MultiPart, SwaggerConsumesEnum.JSON)
  @UseInterceptors(UploadFile("image","blog",3))
  createNewBlog(
    @UploadedOptionalFiles() file: BlogImage,
    @Body() blogDto: CreateBlogDto){
      return this.blogService.createBlog(blogDto, file);
  }

  @Put('/:id')
  @ApiConsumes(SwaggerConsumesEnum.MultiPart, SwaggerConsumesEnum.JSON)
  @UseInterceptors(UploadFile("image","blog",3))
  update(@UploadedOptionalFiles() file: BlogImage,
        @Param("id", ParseIntPipe) id: number,
        @Body() blogDto: UpdateBlogDto){
    return this.blogService.update(id, blogDto, file);
  }

  @Get('my')
  @Pagination()
  getMyBlogs(@Query() paginationDto: PaginationDto){
    return this.blogService.getMyBlogs(paginationDto);
  }

  @Get('/')
  @SkipAuth()
  @Pagination()
  @FilterBlog()
  showAllBlogs(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: FilterBlogDto
  ){
    return this.blogService.getAllBlogs(paginationDto, filterDto);
  }

  @Get('/by-slug/:slug')
  @SkipAuth()
  @Pagination()
  getBlogBySlug(
    @Param("slug") slug: string,
    @Query() pagination: PaginationDto
  ){
    return this.blogService.getBlogBySlug(slug,pagination);
  }

  @Get('/by-id/:blogId')
  @SkipAuth()
  @Pagination()
  getBlogById(
    @Param("blogId") blogId: number,
    @Query() pagination: PaginationDto
  ){
    return this.blogService.getBlogById(blogId,pagination);
  }

  @Delete('/:id')
  delete(@Param('id', ParseIntPipe) id: number){
    return this.blogService.delete(id);
  }

  @Get("like/:id")
  likeToggle(@Param("id", ParseIntPipe) id: number){
    return this.blogService.likeToggle(id);
  }

  @Get("bookmark/:id")
  bookmarkToggle(@Param("id", ParseIntPipe) id: number){
    return this.blogService.bookmarkToggle(id);
  }

}
