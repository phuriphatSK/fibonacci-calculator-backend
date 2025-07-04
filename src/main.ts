import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: [process.env.CORS_ORIGIN || 'http://localhost:3001'],
    credentials: true,
  });

  await app.listen(3001, '0.0.0.0');
  console.log('Application is running on: http://localhost:3001');
}
bootstrap();
