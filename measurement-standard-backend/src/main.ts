import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

async function createServer() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

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
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 3000);
}

// Vercel Serverless Function Handler
export default async (req: any, res: any) => {
  if (!server.listeners('request').length) {
    await createServer();
  }
  server(req, res);
};
