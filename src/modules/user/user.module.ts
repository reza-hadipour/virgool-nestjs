import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { ProfileEntity } from './entities/profile.entity';
import { OtpEntity } from './entities/otp.entity';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';
import { AuthGuard } from '../auth/guard/auth.guard';

@Module({
  imports:[
        TypeOrmModule.forFeature([UserEntity,ProfileEntity, OtpEntity]),
        AuthModule
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [TypeOrmModule, UserService]
})
export class UserModule {}
