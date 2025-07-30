import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumesEnum } from 'src/common/enums/swagger-consumes.enum';
import { CreateCommentDto } from './dto/comment.dto';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';


@Controller('comment')
@ApiTags('Comment')
@AuthDecorator()
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  
  @Post('/')
  @ApiConsumes(SwaggerConsumesEnum.JSON,SwaggerConsumesEnum.Urlencoded)
  create(@Body() commentDto: CreateCommentDto){
    return this.commentService.create(commentDto);
  }
  
  @Get('/:id')
  @Pagination()
  getBlogComments(@Param("blogId") blogId: number,@Query() pagination: PaginationDto){
    return this.commentService.getBlogComments(blogId, pagination);
  }
  
  @Get('/accept/:id')
  @CanAccess(RolesEnum.MANAGER)
  accept(@Param('id', ParseIntPipe) id: number){
    return this.commentService.accept(id);
  }
  
  @Get('/reject/:id')
  @CanAccess(RolesEnum.MANAGER)
  reject(@Param('id', ParseIntPipe) id: number){
    return this.commentService.reject(id);
  }
}
