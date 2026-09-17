// import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
// import { SectionsService } from './sections.service';
// import { CreateSectionDto } from './dto/create-section.dto';
// import { UpdateSectionDto } from './dto/update-section.dto';
// import { AuthGuard } from '@nestjs/passport';
// import { Roles } from 'src/auth/decorators/roles.decorator';
// import { Role } from 'src/auth/enums/role.enum';
// import { RolesGuard } from 'src/auth/guards/roles.guard';

// @Controller('sections')
// export class SectionsController {
//   constructor(private readonly sectionsService: SectionsService) {}

//   @UseGuards(AuthGuard('jwt'), RolesGuard)
//   @Roles(Role.ADMIN, Role.SUPER_ADMIN) 
//   @Post()
//   create(@Body() createSectionDto: CreateSectionDto) {
//     return this.sectionsService.create(createSectionDto);
//   }

//   @Get()
//   findAll() {
//     return this.sectionsService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.sectionsService.findOne(id);
//   }

//   @UseGuards(AuthGuard('jwt'), RolesGuard)
//   @Roles(Role.ADMIN, Role.SUPER_ADMIN) 
//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
//     return this.sectionsService.update(id, updateSectionDto);
//   }

//   @UseGuards(AuthGuard('jwt'), RolesGuard)
//   @Roles(Role.ADMIN, Role.SUPER_ADMIN) 
//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.sectionsService.remove(id);
//   }
// }





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

import { AuthGuard } from '@nestjs/passport';

import { SectionsService } from './sections.service';

import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@Controller('sections')
export class SectionsController {
  constructor(
    private readonly sectionsService: SectionsService,
  ) {}

  // ============================================================
  // CREATE
  // ============================================================

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Post()
  create(
    @Body() createSectionDto: CreateSectionDto,
  ) {
    return this.sectionsService.create(
      createSectionDto,
    );
  }

  // ============================================================
  // GET ALL
  // ============================================================

  @Get()
  findAll() {
    return this.sectionsService.findAll();
  }

  // ============================================================
  // GET SECTIONS BY EXAM TYPE
  //
  // GET /sections/exam-type/:examTypeId
  // ============================================================

  @Get('exam-type/:examTypeId')
  findByExamType(
    @Param('examTypeId') examTypeId: string,
  ) {
    return this.sectionsService.findByExamType(
      examTypeId,
    );
  }

  // ============================================================
  // GET ONE
  // ============================================================

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectionsService.findOne(id);
  }

  // ============================================================
  // GET ONE WITH QUESTIONS
  // ============================================================

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get(':id/questions')
  findOneWithQuestions(
    @Param('id') id: string,
  ) {
    return this.sectionsService.findOneWithQuestions(id);
  }

  // ============================================================
  // UPDATE
  // ============================================================

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSectionDto: UpdateSectionDto,
  ) {
    return this.sectionsService.update(
      id,
      updateSectionDto,
    );
  }

  // ============================================================
  // DELETE
  // ============================================================

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectionsService.remove(id);
  }
}