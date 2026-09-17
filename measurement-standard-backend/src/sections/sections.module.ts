
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Section } from './entities/section.entity';
import { ExamType } from '../exam-types/entities/exam-type.entity';

import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Section,
      ExamType,
    ]),
  ],

  controllers: [
    SectionsController,
  ],

  providers: [
    SectionsService,
  ],

  exports: [
    SectionsService,
  ],
})
export class SectionsModule {}