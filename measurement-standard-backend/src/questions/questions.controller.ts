import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { QuestionFilterQueryDto } from './dto/question-filter.query.dto';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/auth/enums/role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN) 
  @Post()
  create(@Body() createQuestionDto: CreateQuestionDto) {
    return this.questionsService.create(createQuestionDto);
  }

  // نقطة النهاية الخاصة بالتحدي اليومي (توضع قبل :id)
  @UseGuards(AuthGuard('jwt'))
  @Get('daily-challenge')
  getDailyChallenge() {
    return this.questionsService.getDailyChallenge();
  }

  // جلب الأسئلة مع فلاتر اختيارية (محمي بـ JWT لمنع كشف الإجابات)
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Query() query: QuestionFilterQueryDto) {
    console.log("this is  the query : ", query);
    
    return this.questionsService.findAllFiltered(query);
  }

  // جلب سؤال واحد مع خياراته (بدون كشف الإجابة الصحيحة)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN) 
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    return this.questionsService.update(id, updateQuestionDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN) 
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionsService.remove(id);
  }
}