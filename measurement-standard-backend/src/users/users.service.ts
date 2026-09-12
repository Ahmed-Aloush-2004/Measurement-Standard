import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import UserProfile from './interfaces/user-profile.interface';
import { CloudinaryService } from './cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService
  ) { }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,
        profile_picture: true,
        // password_hash غير مدرجة هنا، فسيتم استبعادها تلقائياً
      },
    });

    if (!user) throw new NotFoundException('المستخدم غير موجود');
    return user;
  }

  async updateProfileImage(userId: string, imageUrl: string | null): Promise<UserProfile> {
    const user = await this.getProfile(userId);
    user.profile_picture = imageUrl as any; // أو يمكنك تحديث نوع الحقل في الكيان ليقبل null صراحة
    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
      created_at: savedUser.created_at,
      profile_picture: savedUser.profile_picture,
    };

  }


  async deleteProfileImage(userId: string) {
    const user = await this.getProfile(userId);
    if (!user.profile_picture) {
      return { message: 'لا توجد صورة شخصية لحذفها' };
    }

    // 2. استخراج public_id من رابط الصورة المحفوظ في قاعدة البيانات
    // مثال للرابط: https://res.cloudinary.com/cloudname/image/upload/v12345/qiyas%20app/xyz123.jpg
    const urlParts = user.profile_picture.split('/');
    const fileNameWithExt = urlParts.pop(); // xyz123.jpg
    const folderName = urlParts.pop(); // qiyas%20app

    if (fileNameWithExt && folderName) {
      const fileName = fileNameWithExt.split('.')[0]; // xyz123
      // فك تشفير مسافات اسم المجلد (qiyas%20app -> qiyas app) ودمجه مع اسم الملف
      const publicId = `${decodeURIComponent(folderName)}/${fileName}`;

      // 3. حذف الصورة من Cloudinary
      await this.cloudinaryService.deleteFile(publicId);
    }

    // 4. إزالة رابط الصورة من قاعدة البيانات
    await this.updateProfileImage(user.id, null);

    return { message: 'تم حذف الصورة الشخصية بنجاح' };

  }



  async updateUserProfile(userId: string, newUsername: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    user.username = newUsername;
    await this.userRepository.save(user);

    return { 
      success: true, 
      username: user.username,
      message: 'تم تحديث الملف الشخصي بنجاح' 
    };
  }

  // يمكن الإبقاء على باقي الدوال إذا احتجتها للوحة تحكم الإدارة (Admin Panel)
  async findAll() {
    return await this.userRepository.find({
      select: {
        id: true,
        username: true,
        email: true,
        created_at: true,
        profile_picture: true,
        // password_hash غير مدرجة هنا، فسيتم استبعادها تلقائياً
      },
    });
  }

  async findOne(id: string) {
    return this.getProfile(id);
  }

  async remove(id: string) {
    const user = await this.getProfile(id);
    await this.userRepository.remove({ id: user.id } as User);
    return { message: 'تم حذف المستخدم بنجاح' };
  }
}