import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SecuritySchemeObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export function SwaggerConfigInit(app: INestApplication): void{
    const document = new DocumentBuilder()
    .setTitle("Virgool")
    .setDescription("Virgool Back-End Application")
    .setVersion("v0.0.1")
    .addBearerAuth(BearerAuthOption(),"Authorization")
    .build();

    const swaggerDocument = SwaggerModule.createDocument(app,document);
    SwaggerModule.setup('swagger',app,swaggerDocument);
}

export function BearerAuthOption():SecuritySchemeObject{
    return {
        type: "http",
        in: "header",
        bearerFormat: "JWT",
        scheme: "bearer"
    }
}