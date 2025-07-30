import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogEntity } from './entity/blog.entity';
import { UserEntity } from '../user/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { CategoryEntity } from '../category/entities/category.entity';
import { CategoryService } from '../category/category.service';
import { CategoryModule } from '../category/category.module';
import { CommentService } from '../comment/comment.service';
import { CommentEntity } from '../comment/entity/comment.entity';
import { AddUserToReqWOV } from 'src/common/middlewares/addUserToReqWOV.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([BlogEntity,
      UserEntity,
      CategoryEntity,
      CommentEntity
    ]),
    AuthModule,
  ],
  controllers: [BlogController],
  providers: [BlogService, CategoryService, CommentService],
  exports: [ CategoryService]
})
export class BlogModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AddUserToReqWOV).forRoutes("blog/by-slug","blog/by-id")
  }
}
