import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // السماح بالوصول من تطبيقات الويب/الموبايل أثناء التطوير
  app.enableCors();

  // تفعيل التحقق على مستوى التطبيق بالكامل
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // يتجاهل أي حقول إضافية غير موجودة في الـ DTO
  }));

  await app.listen(3000);
  // await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
  