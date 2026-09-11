import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { UserResponsesService } from './user-responses.service';
import { CreateUserResponseDto } from './dto/create-user-response.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('user-responses')
export class UserResponsesController {
  constructor(private readonly userResponsesService: UserResponsesService) {}

  @UseGuards(AuthGuard('jwt'))  
  @Post()
  create(@Req() req: any, @Body() createDto: CreateUserResponseDto) {
    // req.user.userId تم تعريفه داخل auth/jwt.strategy.ts
    const userId = req.user.userId; 
    return this.userResponsesService.create(userId, createDto);
  }

  @UseGuards(AuthGuard('jwt'))  
  @Get()
  findAll(@Req() req: any) {
    return this.userResponsesService.findAllForUser(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))  
  @Get('mistakes')
  getMistakes(@Req() req: any) {
    return this.userResponsesService.getMistakesForUser(req.user.userId);
  }
}