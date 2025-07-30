import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfiguration } from 'src/configs/typeorm.config';
import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../category/category.module';
import { BlogModule } from '../blog/blog.module';
import { CommentModule } from '../comment/comment.module';
import { ImageModule } from '../image/image.module';
import { CustomHttpModule } from '../http/http.module';

@Module({
  imports: [UserModule,
    ConfigModule.forRoot({
      envFilePath: join(process.cwd(),'.env'),
      isGlobal: true
    }),
    TypeOrmModule.forRoot(TypeOrmConfiguration()),
    UserModule,
    AuthModule,
    CategoryModule,
    BlogModule,
    CommentModule,
    ImageModule,
    CustomHttpModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
