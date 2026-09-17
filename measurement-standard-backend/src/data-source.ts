import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const AppDataSource = new DataSource(
  process.env.DATABASE_URL
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        entities: ['dist/**/*.entity.js'],
        migrations: ['dist/migrations/*.js'],
        synchronize: false,
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'measurement_db',
        entities: ['dist/**/*.entity.js'],
        migrations: ['dist/migrations/*.js'],
        synchronize: false,
      },
);