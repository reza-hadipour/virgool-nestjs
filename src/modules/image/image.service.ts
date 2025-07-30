import { Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { ImageDto } from './dto/image.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ImageEntity } from './entities/image.entity';
import { Repository } from 'typeorm';
import { MulterType } from 'src/common/utils/multer.util';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { join } from 'path';
import { unlinkSync } from 'fs';

@Injectable({scope: Scope.REQUEST})
export class ImageService {
  constructor(
    @InjectRepository(ImageEntity) private imageRepository: Repository<ImageEntity>,
    @Inject(REQUEST) private req: Request
  ){}

  async create(imageDto: ImageDto, image: MulterType) {
    const userId = this.req.user.id;
    const {alt,name} = imageDto;

    const location = image.path.slice(7);

    await this.imageRepository.insert({
      name,
      alt : alt || name,
      location,
      userId
    })

    return {
      location
    }
  }

  async findAll() {
    const userId = this.req.user.id;
    const images = await this.imageRepository.find({
      where:{
        userId
      },
      order: {
        created_at: 'DESC'
      }
    })

    return images;

  }

  async findOne(id: number) {
    const userId = this.req.user.id;
    const image = await this.imageRepository.find({
      where:{
        id,
        userId
      },
      order: {
        created_at: 'DESC'
      }
    })

    if(!image) throw new NotFoundException("Image not found.");

    return image;
  }

  async remove(id: number) {
    const userId = this.req.user.id;
    const image = await this.imageRepository.findOneBy({
        id,
        userId
    })

    if(!image) throw new NotFoundException("Image not found.");

    const imagePath = join("public",image.location)
    this.imageRepository.remove(image).then(()=>{
      unlinkSync(imagePath);
    })

    return {
      message: "Image removed successfully."
    };
  }
}
