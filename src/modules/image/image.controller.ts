import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, ParseIntPipe, } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageDto } from './dto/image.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SwaggerConsumesEnum } from 'src/common/enums/swagger-consumes.enum';
import { MulterType } from 'src/common/utils/multer.util';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { UploadFile } from 'src/common/interceptors/upload.interceptor';

@Controller('image')
@ApiTags('Image')
@AuthDecorator()

export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @ApiConsumes(SwaggerConsumesEnum.MultiPart)
  @UseInterceptors(UploadFile("image","images",3))
  create(
    @UploadedFile() file: MulterType,
    @Body() imageDto: ImageDto
  ) {
    return this.imageService.create(imageDto, file);
  }

  @Get()
  findAll() {
    return this.imageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.imageService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imageService.remove(+id);
  }
}
