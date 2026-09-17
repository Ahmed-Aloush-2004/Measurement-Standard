
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { User } from 'src/users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { Role } from './enums/role.enum';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User) 
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService, // Inject ConfigService
    ) {
      this.googleClient = new OAuth2Client(
        this.configService.get<string>('GOOGLE_WEB_CLIENT_ID'),
      );
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
    console.log('this user : ', user)
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

  async verifyGoogleToken(token: string) {
    try {
      const audienceList = [
        process.env.GOOGLE_WEB_CLIENT_ID,
        process.env.GOOGLE_ANDROID_CLIENT_ID,
        process.env.GOOGLE_IOS_CLIENT_ID,
      ].filter((id): id is string => Boolean(id));

      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: audienceList.length > 0 ? audienceList : undefined,
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
          role:Role.USER,
        });
        await this.usersRepository.save(user);
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('رمز Google غير صالح أو منتهي الصلاحية');
    }


}



  private async generateTokens(user: User) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    const accessExpiresIn = this.configService.get<number>('ACCESS_EXPIRE_IN') ?? Number(process.env.ACCESS_EXPIRE_IN)
    const refreshExpiresIn = this.configService.get<number>('REFRESH_EXPIRE_IN') ?? Number(process.env.REFRESH_EXPIRE_IN)
   
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'secretKey',
      expiresIn: `${accessExpiresIn}d`,
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refreshSecretKey',
      expiresIn: `${refreshExpiresIn}d`,
    });

    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    user.refresh_token = hashedRefreshToken;
    await this.usersRepository.save(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile_picture: user.profile_picture,
      },
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



