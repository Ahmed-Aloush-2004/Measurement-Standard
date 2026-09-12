// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import * as bcrypt from 'bcrypt';
// import { User } from 'src/users/entities/user.entity';
// import { RegisterDto } from './dto/register.dto';
// import { LoginDto } from './dto/login.dto';

// @Injectable()
// export class AuthService {
//   constructor(
//     @InjectRepository(User) private usersRepository: Repository<User>,
//     private jwtService: JwtService,
//   ) {}

//   async register(registerDto: any) {
//     const { username, email, password, profile_picture } = registerDto;
    
//     const existingUser = await this.usersRepository.findOne({ where: { email } });
//     if (existingUser) throw new UnauthorizedException('البريد الإلكتروني مسجل مسبقاً');

//     const password_hash = await bcrypt.hash(password, 10);
//     const user = this.usersRepository.create({ 
//       username, 
//       email, 
//       password_hash,
//       profile_picture
//     });
    
//     await this.usersRepository.save(user);

//     return this.generateTokens(user);
//   }

//   async login(loginDto: LoginDto) {
//     const { email, password } = loginDto;
//     const user = await this.usersRepository.findOne({ where: { email } });
//     if (!user || !user.password_hash) throw new UnauthorizedException('بيانات الدخول غير صحيحة');

//     const isMatch = await bcrypt.compare(password, user.password_hash);
//     if (!isMatch) throw new UnauthorizedException('بيانات الدخول غير صحيحة');

//     return this.generateTokens(user);
//   }

//   async googleLogin(req: any) {
//     if (!req.user) throw new UnauthorizedException('فشل المصادقة عبر Google');

//     const email = req.user.email;
//     let user = await this.usersRepository.findOne({ where: { email } });

//     if (!user) {
//       user = this.usersRepository.create({
//         username: `${req.user.firstName} ${req.user.lastName}`,
//         email: email,
//       });
//       await this.usersRepository.save(user);
//     }

//     return this.generateTokens(user);
//   }

//   private async generateTokens(user: User) {
//     // إضافة حقل role إلى الـ Payload
//     const payload = { email: user.email, sub: user.id, role: user.role };

//     const access_token = this.jwtService.sign(payload, {
//       secret: process.env.JWT_SECRET || 'secretKey',
//       expiresIn: '2d',
//     });

//     const refresh_token = this.jwtService.sign(payload, {
//       secret: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey',
//       expiresIn: '7d',
//     });

//     const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
//     user.refresh_token = hashedRefreshToken;
//     await this.usersRepository.save(user);

//     return {
//       access_token,
//       refresh_token,
//     };
//   }

//   // دالة اختيارية لتجديد الـ Access Token باستخدام الـ Refresh Token
//   async refreshTokens(userId: string, refreshToken: string) {
//     const user = await this.usersRepository.findOne({ where: { id: userId } });
//     if (!user || !user.refresh_token) throw new UnauthorizedException('غيرو مصرح بالوصول');

//     const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refresh_token);
//     if (!refreshTokenMatches) throw new UnauthorizedException('توكن التجديد غير صالح');

//     return this.generateTokens(user);
//   }
// }



import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { User } from 'src/users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {
    // تهيئة عميل Google OAuth للتحقق من التوكن القادم من الموبايل
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async register(registerDto: any) {
    const { username, email, password, profile_picture } = registerDto;
    
    const existingUser = await this.usersRepository.findOne({ where: { email } });
    if (existingUser) throw new UnauthorizedException('البريد الإلكتروني مسجل مسبقاً');

    const password_hash = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ 
      username, 
      email, 
      password_hash,
      profile_picture
    });
    
    await this.usersRepository.save(user);

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user || !user.password_hash) throw new UnauthorizedException('بيانات الدخول غير صحيحة');
    console.log('--------------------------------------------')
    console.log('this user : ',user)
    console.log('--------------------------------------------')
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new UnauthorizedException('بيانات الدخول غير صحيحة');

    return this.generateTokens(user);
  }



  // In auth.service.ts

  async verifyCurrentPassword(userId: string, passwordToCheck: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || !user.password_hash) {
      throw new UnauthorizedException('المستخدم غير موجود أو مسجل عبر Google فقط');
    }

    const isMatch = await bcrypt.compare(passwordToCheck, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('كلمة المرور الحالية غير صحيحة');
    }

    return { success: true };
  }

  async changeUserPassword(userId: string, currentPass: string, newPass: string) {
    // 1. Verify old password again for security
    await this.verifyCurrentPassword(userId, currentPass);

    // 2. Hash and save new password
    const newPasswordHash = await bcrypt.hash(newPass, 10);
    await this.usersRepository.update(userId, { password_hash: newPasswordHash });

    return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
  }





  // الدالة الجديدة المخصصة لتسجيل الدخول من الموبايل
  async verifyGoogleToken(token: string) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID, 
      });

      const payload = ticket.getPayload();
      
      if (!payload || !payload.email) {
        throw new UnauthorizedException('بيانات Google غير مكتملة');
      }

      const email = payload.email;
      let user = await this.usersRepository.findOne({ where: { email } });

      if (!user) {
        user = this.usersRepository.create({
          username: payload.name || 'مستخدم Google',
          email: email,
        });
        await this.usersRepository.save(user);
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('رمز Google غير صالح أو منتهي الصلاحية');
    }
  }

  // الدالة القديمة للويب (محتفظ بها لتجنب كسر أي كود يعتمد عليها)
  async googleLogin(req: any) {
    if (!req.user) throw new UnauthorizedException('فشل المصادقة عبر Google');

    const email = req.user.email;
    let user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      user = this.usersRepository.create({
        username: `${req.user.firstName} ${req.user.lastName}`,
        email: email,
      });
      await this.usersRepository.save(user);
    }

    return this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    // إضافة حقل role إلى الـ Payload
    const payload = { email: user.email, sub: user.id, role: user.role };

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'secretKey',
      expiresIn: '2d',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey',
      expiresIn: '7d',
    });

    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    user.refresh_token = hashedRefreshToken;
    await this.usersRepository.save(user);

    return {
      access_token,
      refresh_token,
    };
  }

  // دالة اختيارية لتجديد الـ Access Token باستخدام الـ Refresh Token
  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || !user.refresh_token) throw new UnauthorizedException('غير مصرح بالوصول');

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refresh_token);
    if (!refreshTokenMatches) throw new UnauthorizedException('توكن التجديد غير صالح');

    return this.generateTokens(user);
  }
}