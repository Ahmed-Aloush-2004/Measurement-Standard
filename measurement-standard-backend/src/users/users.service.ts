import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import UserProfile from './interfaces/user-profile.interface';
import { CloudinaryService } from './cloudinary.service';
import { Role } from 'src/auth/enums/role.enum';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private readonly profileSelect: Prisma.UserSelect = {
    id: true,
    username: true,
    email: true,
    created_at: true,
    profile_picture: true,
    role: true,
    // password_hash غير مدرجة هنا، فسيتم استبعادها تلقائياً
  };

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.profileSelect,
    });

    if (!user) throw new NotFoundException('المستخدم غير موجود');
    return user;
  }

  async updateProfileImage(
    userId: string,
    imageUrl: string | null,
  ): Promise<UserProfile> {
    const savedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { profile_picture: imageUrl },
      select: this.profileSelect,
    });

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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { username: newUsername },
    });

    return {
      success: true,
      username: updated.username,
      message: 'تم تحديث الملف الشخصي بنجاح',
    };
  }

  async updateUserRole(userId: string, newRole: Role) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('المستخدم غير موجود');

    await this.prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    return {
      success: true,
      message: 'تم تغيير صلاحية المستخدم بنجاح',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: newRole,
      },
    };
  }

  async findAll() {
    return await this.prisma.user.findMany({
      where: {
        role: { not: Role.SUPER_ADMIN },
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
        profile_picture: true,
      },
    });
  }

  async getUsersbyRoles(roles: Role[]) {
    return await this.prisma.user.findMany({
      where: {
        role: { in: roles },
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        created_at: true,
        profile_picture: true,
      },
    });
  }

  async findOne(id: string): Promise<UserProfile> {
    return this.findByQuery({ id });
  }

  async findByQuery(query: Prisma.UserWhereInput): Promise<UserProfile> {
    const user = await this.prisma.user.findFirst({
      where: query,
      select: this.profileSelect,
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return user;
  }

  async remove(id: string) {
    const user = await this.findByQuery({ id });
    await this.prisma.user.delete({ where: { id: user.id } });
    return { message: 'تم حذف المستخدم بنجاح' };
  }
}
