import { Controller, Post, Body, Get, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/users/cloudinary.service';

@Controller('auth')
export class AuthController {
  constructor(
        private readonly authService: AuthService,
        private readonly cloudinaryService: CloudinaryService // تأكد من حقن الخدمة هنا)
  ){}

  @Post('register')
  @UseInterceptors(FileInterceptor('profile_picture'))
  async register(
      @Body() registerDto: RegisterDto,
      @UploadedFile() file: Express.Multer.File
    ) {

      console.log('------------------------------------------');
      console.log('Register DTO:', registerDto);
      console.log('------------------------------------------');

      let imageUrl = null;
      
      // إذا قام المستخدم برفع صورة أثناء التسجيل، ارفعها إلى Cloudinary
      if (file) {
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        imageUrl = uploadResult.secure_url;
      }

      return this.authService.register({ ...registerDto, profile_picture: imageUrl });
    }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('google/verify')
  async verifyGoogle(@Body('token') token: string) {
    return this.authService.verifyGoogleToken(token);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.googleLogin(req);
  }
}