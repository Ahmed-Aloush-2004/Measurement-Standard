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
import { ChoicesService } from './choices.service';
import { CreateChoiceDto } from './dto/create-choice.dto';
import { UpdateChoiceDto } from './dto/update-choice.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('choices')
export class ChoicesController {
  constructor(private readonly choicesService: ChoicesService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  create(@Body() createChoiceDto: CreateChoiceDto) {
    return this.choicesService.create(createChoiceDto);
  }

  @Get()
  findAll() {
    return this.choicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.choicesService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChoiceDto: UpdateChoiceDto) {
    return this.choicesService.update(id, updateChoiceDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.choicesService.remove(id);
  }
}
