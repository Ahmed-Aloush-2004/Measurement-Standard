import {
  IsDateString,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateNotificationDto {
  // @IsOptional()
  // @IsString()
  // userId?: string;

  @IsOptional()
  @IsEmail()
  user_email?: string;

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsDateString() // Add this to ensure valid dates
  expiresAt?: string;
}
