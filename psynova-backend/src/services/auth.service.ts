import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import * as authRepo from '../repositories/auth.repository';
import * as therapistRepo from '../repositories/therapist.repository';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../middleware/auth';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../lib/resend';
import { AppError } from '../middleware/errorHandler';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';
import { Role } from '@prisma/client';

export async function register(input: RegisterInput) {
  const existing = await authRepo.findUserByEmail(input.email);
  if (existing) throw new AppError('Email already registered', 409);

  const passwordHash = await bcrypt.hash(input.password, 12);
  const verifyToken = uuidv4();

  const user = await authRepo.createUser({
    email: input.email,
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.role as Role,
    verifyToken,
  });

  if (user.role === 'THERAPIST') {
    await therapistRepo.createTherapistProfile(user.id);
  }

  await sendVerificationEmail(user.email, user.firstName, verifyToken).catch(console.error);

  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
  await authRepo.updateRefreshToken(user.id, refreshToken);

  return {
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, isVerified: user.isVerified },
    accessToken,
    refreshToken,
  };
}

export async function login(input: LoginInput) {
  const user = await authRepo.findUserByEmail(input.email);
  if (!user) throw new AppError('Invalid credentials', 401);
  if (!user.isActive) throw new AppError('Account suspended. Contact support.', 403);

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
  await authRepo.updateRefreshToken(user.id, refreshToken);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified,
      therapistProfile: user.therapistProfile,
    },
    accessToken,
    refreshToken,
  };
}

export async function logout(userId: string) {
  await authRepo.updateRefreshToken(userId, null);
}

export async function refreshTokens(token: string) {
  const user = await authRepo.findUserByRefreshToken(token);
  if (!user) throw new AppError('Invalid refresh token', 401);

  try {
    verifyRefreshToken(token);
  } catch {
    await authRepo.updateRefreshToken(user.id, null);
    throw new AppError('Refresh token expired. Please log in again.', 401);
  }

  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });
  await authRepo.updateRefreshToken(user.id, newRefreshToken);

  return { accessToken, refreshToken: newRefreshToken };
}

export async function verifyEmail(token: string) {
  const user = await authRepo.verifyUserEmail(token);
  if (!user) throw new AppError('Invalid or expired verification token', 400);
  return user;
}

export async function forgotPassword(email: string) {
  const user = await authRepo.findUserByEmail(email);
  if (!user) return; // Don't reveal if email exists

  const token = uuidv4();
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await authRepo.setResetToken(email, token, expiry);
  await sendPasswordResetEmail(email, user.firstName, token).catch(console.error);
}

export async function resetPassword(token: string, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const user = await authRepo.resetPassword(token, passwordHash);
  if (!user) throw new AppError('Invalid or expired reset token', 400);
  return user;
}

export async function getMe(userId: string) {
  const user = await authRepo.findUserById(userId);
  if (!user) throw new AppError('User not found', 404);
  const { passwordHash, refreshToken, resetToken, verifyToken, ...safe } = user;
  return safe;
}
