import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ExamTypesService } from './exam-types.service';
import { CreateExamTypeDto } from './dto/create-exam-type.dto';
import { UpdateExamTypeDto } from './dto/update-exam-type.dto';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/auth/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('exam-types')
export class ExamTypesController {
  constructor(private readonly examTypesService: ExamTypesService) {}

  // إضافة نوع اختبار جديد (محمي بـ JWT)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  create(@Body() createExamTypeDto: CreateExamTypeDto) {
    return this.examTypesService.create(createExamTypeDto);
  }

  // جلب جميع الأنواع (متاح للجميع)
  @Get()
  findAll() {
    return this.examTypesService.findAll();
  }

  // جلب نوع اختبار محدد عبر الـ ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.examTypesService.findOne(id); // استخدام + لتحويل النص إلى رقم
  }

  // تحديث نوع اختبار (محمي)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateExamTypeDto: UpdateExamTypeDto,
  ) {
    return this.examTypesService.update(id, updateExamTypeDto);
  }

  // حذف نوع اختبار (محمي)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.examTypesService.remove(id);
  }
}
