import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentEntity } from './entity/comment.entity';
import { AuthModule } from '../auth/auth.module';
import { BlogService } from '../blog/blog.service';
import { BlogEntity } from '../blog/entity/blog.entity';
import { CategoryEntity } from '../category/entities/category.entity';
import { CategoryModule } from '../category/category.module';
import { CategoryService } from '../category/category.service';
import { UserEntity } from '../user/entities/user.entity';
import { BlogModule } from '../blog/blog.module';

@Module({
  imports: [
    AuthModule,
    BlogModule,
    TypeOrmModule.forFeature([
      CommentEntity,
      BlogEntity,
      UserEntity,
    ])
  ],
  controllers: [CommentController],
  providers: [CommentService, BlogService],
})
export class CommentModule {}
