import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UploadedFiles, UseInterceptors, ParseFilePipe, Res, ParseIntPipe, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ProfileDto } from './dto/profile.dto';
import { ApiConsumes, ApiParam } from '@nestjs/swagger';
import { SwaggerConsumesEnum } from 'src/common/enums/swagger-consumes.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { multerDiskStorage, multerFilter, multerLimit } from 'src/common/utils/multer.util';
import { ProfileImages } from './types/files.type';
import { UploadedOptionalFiles } from 'src/common/decorators/upload-file.decorator';
import { ChangeEmailDto } from './dto/change-email.dto';
import { Response } from 'express';
import { CookieKeys } from 'src/common/enums/cookie.enum';
import { AuthService } from '../auth/auth.service';
import { checkOtpDto } from '../auth/dto/auth.dto';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { CanAccess } from 'src/common/decorators/role.decorator';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('user')
@AuthDecorator()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private authService: AuthService
  ) {}

  @Put('profile')
  @ApiConsumes(SwaggerConsumesEnum.MultiPart)
  @UseInterceptors(FileFieldsInterceptor([
    {
      name: "bg_image",
      maxCount: 1
    },
    {
      name: "image_profile",
      maxCount: 1
    }
  ],{
    storage: multerDiskStorage("profile"),
    fileFilter : multerFilter,
    limits: multerLimit(3,2)
  }))
  changeProfile(
    @UploadedOptionalFiles() files: ProfileImages,
    @Body() profileDto: ProfileDto){
    return this.userService.changeProfile(profileDto, files)
  }

  @Get("profile")
  showUserProfile(){
    return this.userService.profile();
  }

  @Post("change-email")
  @ApiConsumes(SwaggerConsumesEnum.Urlencoded)
  async askChangeEmail(@Body() changeEmailDto: ChangeEmailDto, @Res() res: Response){

    const result = await this.userService.askChangeEmail(changeEmailDto);
       
    res.cookie(CookieKeys.Otp, result?.token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000*60*2)
    })
    
    res.json({
      message: result?.message,
      code: result?.code,
      token: result?.token
    });
  }

  @Post('verify-new-email')
  @ApiConsumes(SwaggerConsumesEnum.Urlencoded)
  async verifyNewEmail(@Body() checkOtpDto: checkOtpDto, @Res() res: Response){
    let result = await this.authService.checkOtp(checkOtpDto)
    res["user"] = result.user;
    res.json(result)
  }

  @Get('follow/:userId')
  @AuthDecorator()
  @ApiParam({name: "userId"})
  followToggle(@Param("userId", ParseIntPipe) userId: number){
    return this.userService.followToggle(userId);
  }

  @Get("/followers")
  @Pagination()
  followers(@Query() paginationDto: PaginationDto){
    return this.userService.getFollowers(paginationDto);
  }
  
  @Get("/followings")
  @Pagination()
  followings(@Query() paginationDto: PaginationDto){
    return this.userService.getFollowings(paginationDto);
  }

  @Get("block/:id")
  @CanAccess(RolesEnum.MANAGER)
  block(@Param("id", ParseIntPipe) id: number){
    return this.userService.blockToggle(id);
  }

}
