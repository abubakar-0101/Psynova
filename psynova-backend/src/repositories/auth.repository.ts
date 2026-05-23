import prisma from '../lib/db';
import { Role } from '@prisma/client';

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { therapistProfile: true },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { therapistProfile: true },
  });
}

export async function createUser(data: {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: Role;
  verifyToken: string;
}) {
  return prisma.user.create({ data });
}

export async function verifyUserEmail(token: string) {
  const user = await prisma.user.findFirst({ where: { verifyToken: token } });
  if (!user) return null;

  return prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, verifyToken: null },
  });
}

export async function setResetToken(email: string, token: string, expiry: Date) {
  return prisma.user.update({
    where: { email },
    data: { resetToken: token, resetTokenExpiry: expiry },
  });
}

export async function resetPassword(token: string, passwordHash: string) {
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() },
    },
  });
  if (!user) return null;

  return prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });
}

export async function updateRefreshToken(userId: string, token: string | null) {
  return prisma.user.update({
    where: { id: userId },
    data: { refreshToken: token },
  });
}

export async function findUserByRefreshToken(token: string) {
  return prisma.user.findFirst({ where: { refreshToken: token } });
}
