import { Body, Controller, Get, InternalServerErrorException, Param, ParseIntPipe, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { checkOtpDto, LoginDto } from './dto/auth.dto';
import { SwaggerConsumesEnum } from 'src/common/enums/swagger-consumes.enum';
import { Response, Request } from 'express';
import { CookieKeys } from 'src/common/enums/cookie.enum';
import { AuthDecorator } from 'src/common/decorators/auth.decorator';
import { EnvEnum } from 'src/common/enums/application.enums';
import { RoleGuard } from './guard/role.guard';
import { RolesEnum } from 'src/common/enums/roles.enum';
import { CanAccess } from 'src/common/decorators/role.decorator';

@Controller('auth')
@ApiTags("Auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('user-existence')
  @ApiConsumes(SwaggerConsumesEnum.Urlencoded, SwaggerConsumesEnum.JSON)
  async userExistence(@Body() loginDto: LoginDto, @Res() res: Response){
    const result = await this.authService.userExistence(loginDto);

      res.cookie(CookieKeys.Otp, result?.token, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000*60*2)
      })

      let response = {
        message: result?.message,
        token: result?.token
      }

      if(process.env.ENVIRONMENT === EnvEnum.DEVELOPMENT ) response['code'] = result?.code;
      
      return res.json(response);
    
  }

  @Post('check-otp')
  @ApiConsumes(SwaggerConsumesEnum.Urlencoded, SwaggerConsumesEnum.JSON)
  async checkOtp(@Body() otpDto: checkOtpDto, @Res() res: Response){

    // return otpDto.code;
    const result = await this.authService.checkOtp(otpDto);
    res['user'] = result.user
    res.json(result)

  }

  @Get('check-auth')
  @AuthDecorator()
  @CanAccess(RolesEnum.MANAGER, RolesEnum.USER)
  async checkAuth(@Req() req: Request){
    return req?.user
  }


}
