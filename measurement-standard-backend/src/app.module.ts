// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

// // استيراد جميع الوحدات (Modules)
// import { UsersModule } from './users/users.module';
// import { UserProgressModule } from './user-progress/user-progress.module';
// import { ExamTypesModule } from './exam-types/exam-types.module';
// import { SectionsModule } from './sections/sections.module';
// import { QuestionsModule } from './questions/questions.module';
// import { ChoicesModule } from './choices/choices.module';
// import { UserResponsesModule } from './user-responses/user-responses.module';

// // استيراد جميع الجداول (Entities)
// import { User } from './users/entities/user.entity';
// import { UserProgress } from './user-progress/entities/user-progress.entity';
// import { ExamType } from './exam-types/entities/exam-type.entity';
// import { Section } from './sections/entities/section.entity';
// import { Question } from './questions/entities/question.entity';
// import { Choice } from './choices/entities/choice.entity';
// import { UserResponse } from './user-responses/entities/user-response.entity';
// import { AuthModule } from './auth/auth.module';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { FavoritesModule } from './favorites/favorites.module';
// import { TestSessionsModule } from './test-sessions/test-sessions.module';
// import { NotificationsModule } from './notifications/notifications.module';
// import { AnalyticsModule } from './analytics/analytics.module';
// import { ScheduleModule } from '@nestjs/schedule';


// @Module({
//   imports: [
//     // تهيئة المتغيرات البيئية وجعلها متاحة في جميع أنحاء التطبيق
//     ConfigModule.forRoot({
//       isGlobal: true,
//     }),
    
//     // الاتصال بقاعدة البيانات باستخدام ConfigService
//     TypeOrmModule.forRootAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => ({
//         type: 'postgres',
//         host: configService.get<string>('DB_HOST'),
//         port: configService.get<number>('DB_PORT'),
//         username: configService.get<string>('DB_USER'),
//         password: configService.get<string>('DB_PASSWORD'),
//         database: configService.get<string>('DB_NAME'),
//         autoLoadEntities: true, // يقوم بتحميل الجداول تلقائياً دون الحاجة لكتابتها يدوياً
//         synchronize: true, 
//       }),
//     }),

//     TypeOrmModule.forRootAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => ({
//         type: 'postgres',
//         url: configService.get<string>('DATABASE_URL'),
//         schema: 'public', // Force TypeORM to create tables in the public schema
//         ssl: {
//           rejectUnauthorized: false, // Required for Neon SSL connections
//         },
//         autoLoadEntities: true,
//         synchronize: true, // Keep true for development; set to false in production
//       }),
//     }),

//     UsersModule, 
//     UserProgressModule, 
//     ExamTypesModule, 
//     SectionsModule, 
//     QuestionsModule, 
//     ChoicesModule, 
//     UserResponsesModule,
//     AuthModule, 
//     FavoritesModule, 
//     TestSessionsModule, 
//     NotificationsModule,
//     AnalyticsModule,
//     ScheduleModule.forRoot(),
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}





import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { UserProgressModule } from './user-progress/user-progress.module';
import { ExamTypesModule } from './exam-types/exam-types.module';
import { SectionsModule } from './sections/sections.module';
import { QuestionsModule } from './questions/questions.module';
import { ChoicesModule } from './choices/choices.module';
import { UserResponsesModule } from './user-responses/user-responses.module';
import { AuthModule } from './auth/auth.module';
import { FavoritesModule } from './favorites/favorites.module';
import { TestSessionsModule } from './test-sessions/test-sessions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Single unified TypeORM configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');

        // Check if using single DATABASE_URL connection string or individual credentials
        if (dbUrl) {
          return {
            type: 'postgres',
            url: dbUrl,
            schema: 'public',
            ssl: {
              rejectUnauthorized: false, // Required for Neon / hosted SSL databases
            },
            autoLoadEntities: true,
            synchronize: false, // Set to false when using migrations
          };
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: false, // Set to false when using migrations
        };
      },
    }),

    UsersModule,
    UserProgressModule,
    ExamTypesModule,
    SectionsModule,
    QuestionsModule,
    ChoicesModule,
    UserResponsesModule,
    AuthModule,
    FavoritesModule,
    TestSessionsModule,
    NotificationsModule,
    AnalyticsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}