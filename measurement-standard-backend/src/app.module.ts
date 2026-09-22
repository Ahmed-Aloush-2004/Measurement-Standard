import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';

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

    PrismaModule,

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
    ...(process.env.VERCEL === '1'
      ? []
      : [ScheduleModule.forRoot()]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
