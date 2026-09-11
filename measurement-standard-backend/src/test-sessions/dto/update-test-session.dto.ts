import { PartialType } from '@nestjs/mapped-types';
import { CreateTestSessionDto } from './create-test-session.dto';

export class UpdateTestSessionDto extends PartialType(CreateTestSessionDto) {}
