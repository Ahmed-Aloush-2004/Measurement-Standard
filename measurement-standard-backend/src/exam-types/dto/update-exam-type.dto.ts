
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
