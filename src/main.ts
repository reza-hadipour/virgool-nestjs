import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { SwaggerConfigInit } from './configs/swager.config';
import { ValidationPipe } from '@nestjs/common';
import * as CookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets("public")
  app.useGlobalPipes(new ValidationPipe());

  SwaggerConfigInit(app);

  app.use(CookieParser(process.env.SECRET_COOKIE_PARSER));
  
  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}.`)
    console.log(`Swagger on http://ocalhost:/${PORT}/swagger`)
  });
}
bootstrap();
