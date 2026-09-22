import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@UseGuards(AuthGuard('jwt'))
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER, Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  add(@Req() req: any, @Body() createFavoriteDto: CreateFavoriteDto) {
    return this.favoritesService.add(
      req.user.userId,
      createFavoriteDto.questionId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(@Req() req: any) {
    return this.favoritesService.findAllForUser(req.user.userId);
  }

  // استخدام questionId بدلاً من favoriteId لتسهيل عملية الحذف من واجهة المستخدم
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.USER, Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':questionId')
  remove(@Req() req: any, @Param('questionId') questionId: string) {
    return this.favoritesService.remove(req.user.userId, questionId);
  }
}
