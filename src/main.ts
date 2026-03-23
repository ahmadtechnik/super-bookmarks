import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import hbs from 'hbs';
import { AuthService } from './auth/auth.service';
import { createSwaggerBasicAuthMiddleware } from './auth/swagger-basic-auth.middleware';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const authService = app.get(AuthService);
  const viewsPath = join(process.cwd(), 'views');
  const partialsPath = join(viewsPath, 'parts');
  const swaggerPath = configService.get<string>('app.swagger.path', 'docs');

  app.setBaseViewsDir(viewsPath);
  app.setViewEngine('hbs');
  app.useStaticAssets(join(process.cwd(), 'public'));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  hbs.registerPartials(partialsPath);
  hbs.registerHelper('json', (context: unknown) => JSON.stringify(context));

  const swaggerDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle(configService.get<string>('app.name', 'SuperBookmarks'))
      .setDescription(
        'Dashboard pages and JSON APIs for tracking and sorting frequently used tools.',
      )
      .setVersion('1.0.0')
      .addBasicAuth(
        {
          type: 'http',
          scheme: 'basic',
          description: 'Use the configured Basic auth username and password.',
        },
        'basic',
      )
      .build(),
  );

  app.use(`/${swaggerPath}`, createSwaggerBasicAuthMiddleware(authService));
  app.use(
    `/${swaggerPath}-json`,
    createSwaggerBasicAuthMiddleware(authService),
  );
  SwaggerModule.setup(swaggerPath, app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(configService.get<number>('app.port', 3000));
}

void bootstrap();
