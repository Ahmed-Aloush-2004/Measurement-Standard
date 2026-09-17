import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import  express from 'express'



const server = express();

async function createServer() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  // Enable CORS so your React dashboard & React Native app can call the API
  app.enableCors();

  await app.init();
  return server;
}

// Local development execution
if (process.env.NODE_ENV !== 'production') {
  bootstrap();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // يتجاهل أي حقول إضافية غير موجودة في الـ DTO
    transform: true, // تحويل الأنواع تلقائياً (مثل تحويل query params)
  },));

  await app.listen(process.env.PORT || 3000);
}

// Vercel Serverless Function Handler
export default async (req: any, res: any) => {
  if (!server.listeners('request').length) {
    await createServer();
  }
  server(req, res);
};
