import bcrypt from 'bcryptjs';
import prisma from '../lib/db';
import { AppError } from '../middleware/errorHandler';
import { UpdateAdminProfileInput } from '../schemas/admin.schema';

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isVerified: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) throw new AppError('User not found', 404);
  if (user.role !== 'ADMIN') throw new AppError('Not an admin account', 403);
  return user;
}

export async function updateMe(userId: string, input: UpdateAdminProfileInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);
  if (user.role !== 'ADMIN') throw new AppError('Not an admin account', 403);

  const data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    passwordHash?: string;
  } = {};

  if (input.firstName) data.firstName = input.firstName;
  if (input.lastName) data.lastName = input.lastName;

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

export async function getDashboardStats() {
  const now = new Date();
  const startOfToday = new Date(now.setHours(0, 0, 0, 0));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    totalTherapists,
    pendingTherapists,
    todaySessions,
    monthRevenue,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.therapist.count({ where: { isApproved: true } }),
    prisma.therapist.count({ where: { isApproved: false } }),
    prisma.appointment.count({
      where: { startTime: { gte: startOfToday }, status: 'CONFIRMED' },
    }),
    prisma.payment.aggregate({
      where: { createdAt: { gte: startOfMonth }, status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalUsers,
    totalTherapists,
    pendingTherapists,
    todaySessions,
    monthRevenue: Number(monthRevenue._sum.amount ?? 0),
    totalRevenue: Number(totalRevenue._sum.amount ?? 0),
  };
}

export async function getAllUsers(page: number, limit: number, search?: string) {
  const skip = (page - 1) * limit;
  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        therapistProfile: { select: { isApproved: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export async function toggleUserStatus(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'ADMIN') throw new AppError('Cannot suspend admin accounts', 403);

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });
}

export async function getRevenueByMonth() {
  // Aggregate in Postgres rather than streaming the full Payment table to Node.
  // Returns last 12 months including months with zero revenue (filled in below).
  const rows = await prisma.$queryRaw<Array<{ month: Date; revenue: number }>>`
    SELECT date_trunc('month', "createdAt") AS month,
           COALESCE(SUM("amount"), 0)::float AS revenue
    FROM "Payment"
    WHERE "status" = 'COMPLETED'
      AND "createdAt" >= (NOW() - INTERVAL '12 months')
    GROUP BY 1
    ORDER BY 1 ASC
  `;

  return rows.map((r) => ({
    month: `${r.month.getFullYear()}-${String(r.month.getMonth() + 1).padStart(2, '0')}`,
    revenue: Number(r.revenue),
  }));
}

export async function getReports(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      include: {
        reporter: { select: { firstName: true, lastName: true, email: true } },
        targetUser: { select: { firstName: true, lastName: true, email: true } },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.report.count(),
  ]);

  return { reports, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}
