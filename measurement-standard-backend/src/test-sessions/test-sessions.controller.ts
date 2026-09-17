import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { TestSessionsService } from './test-sessions.service';
import { CreateTestSessionDto } from './dto/create-test-session.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('test-sessions')
export class TestSessionsController {
  constructor(private readonly testSessionsService: TestSessionsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Req() req: any, @Body() createTestSessionDto: CreateTestSessionDto) {
    return this.testSessionsService.create(req.user.userId,req.user.email, createTestSessionDto);
  }


  @UseGuards(AuthGuard('jwt'))  
  @Get()
  findAll(@Req() req: any) {
    return this.testSessionsService.findAllForUser(req.user.userId);
  }
}