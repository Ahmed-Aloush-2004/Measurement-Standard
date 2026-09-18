// import { PartialType } from '@nestjs/mapped-types';
// import { CreateExamTypeDto } from './create-exam-type.dto';

// export class UpdateExamTypeDto extends PartialType(CreateExamTypeDto) {}

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateExamTypeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;
}
