import bcrypt from 'bcryptjs';
import prisma from '../lib/db';
import { AppError } from '../middleware/errorHandler';

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      photoUrl: true,
      bio: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) throw new AppError('User not found', 404);
  if (user.role !== 'CLIENT') throw new AppError('Not a client account', 403);
  return user;
}

export async function updateMe(userId: string, input: any) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);
  if (user.role !== 'CLIENT') throw new AppError('Not a client account', 403);

  const data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    bio?: string;
    passwordHash?: string;
  } = {};

  if (input.firstName) data.firstName = input.firstName;
  if (input.lastName) data.lastName = input.lastName;
  if (input.bio !== undefined) data.bio = input.bio || null;

  if (input.email && input.email !== user.email) {
    const taken = await prisma.user.findUnique({ where: { email: input.email } });
    if (taken && taken.id !== user.id) throw new AppError('Email already in use', 409);
    data.email = input.email;
  }

  if (input.newPassword) {
    if (!input.currentPassword) throw new AppError('Current password is required', 400);
    const ok = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!ok) throw new AppError('Current password is incorrect', 400);
    data.passwordHash = await bcrypt.hash(input.newPassword, 12);
  }

  if (Object.keys(data).length === 0) {
    return getMe(userId);
  }

  await prisma.user.update({ where: { id: userId }, data });
  return getMe(userId);
}

export async function updateProfilePhoto(userId: string, photoUrl: string, publicId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);
  if (user.role !== 'CLIENT') throw new AppError('Not a client account', 403);

  if (user.cloudinaryPublicId) {
    const { deleteCloudinaryAsset } = await import('../lib/cloudinary');
    await deleteCloudinaryAsset(user.cloudinaryPublicId);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { photoUrl, cloudinaryPublicId: publicId },
  });

  return getMe(userId);
}
