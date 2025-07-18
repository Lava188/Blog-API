import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const messages = validationErrors.map((err) => {
          const constraints = err.constraints ?? {};
          // Lấy mảng message, hoặc ['Invalid field'] nếu không có
          const msgs = Object.values(constraints);
          return {
            [err.property]: msgs.length ? msgs[0] : 'Invalid field',
          };
        });
        return new BadRequestException(messages);
      },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
