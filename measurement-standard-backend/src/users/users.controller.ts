import { Controller, Get, Patch, Param, Delete, Req, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import UserProfile from './interfaces/user-profile.interface';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

  // جلب الملف الشخصي للمستخدم الحالي
  @Get('profile')
  getProfile(@Req() req: any):Promise<UserProfile> {
    return this.usersService.getProfile(req.user.userId);
  }

  // تحديث الصورة الشخصية للمستخدم الحالي من صفحة الملف الشخصي
  @Patch('profile/image')
  @UseInterceptors(FileInterceptor('profile_picture'))
  async updateImage(@Req() req: any, @UploadedFile() file: Express.Multer.File):Promise<UserProfile> {
    if (!file) throw new BadRequestException('لم يتم إرفاق أي صورة');
    
    const uploadResult = await this.cloudinaryService.uploadFile(file);
    return this.usersService.updateProfileImage(req.user.userId, uploadResult.secure_url);
  }

  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Req() req, @Body('username') username: string) {
    // req.user.sub is the user ID provided by your JWT payload
    return this.usersService.updateUserProfile(req.user.userId, username);
  }


  @Delete('profile/image')
  async deleteImage(@Req() req: any){
    return this.usersService.deleteProfileImage(req.user.userId);
  }
  



  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}