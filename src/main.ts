import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { getScalarDocsHtml } from './docs/scalar-page';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const apiPrefix = configService.get<string>('app.apiPrefix', 'api/v1');
  const port = configService.get<number>('app.port', 3000);

  app.setGlobalPrefix(apiPrefix, {
    exclude: ['docs', 'openapi.json'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Kratom Finance API')
    .setDescription('Kratom shop management API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/openapi.json', (_req, res) => {
    res.json(document);
  });
  httpAdapter.get('/docs', (_req, res) => {
    res.type('text/html').send(getScalarDocsHtml('/openapi.json'));
  });

  await app.listen(port);
}
bootstrap();
