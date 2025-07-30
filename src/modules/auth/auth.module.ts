import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { TokenService } from './token.service';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './guard/auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { OtpEntity } from '../user/entities/otp.entity';
import { ProfileEntity } from '../user/entities/profile.entity';
import { SmsService } from '../http/sms.service';
import { HttpModule } from '@nestjs/axios';
import { GoogleController } from './google.controller';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports:[
    TypeOrmModule.forFeature([UserEntity,OtpEntity, ProfileEntity]),
    HttpModule
  ],
  controllers: [AuthController, GoogleController],
  providers: [AuthService, TokenService, JwtService, SmsService, GoogleStrategy],
  exports: [AuthService, TokenService, JwtService, TypeOrmModule]
})
export class AuthModule {}
