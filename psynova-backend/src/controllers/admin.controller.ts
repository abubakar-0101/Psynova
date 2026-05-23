import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import * as adminService from '../services/admin.service';
import * as therapistService from '../services/therapist.service';
import * as appointmentRepo from '../repositories/appointment.repository';
import { AuthRequest, param } from '../types';

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await adminService.getMe(req.user!.userId);
  res.json({ success: true, data: profile });
});

export const updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await adminService.updateMe(req.user!.userId, req.body);
  res.json({ success: true, data: profile });
});

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await adminService.getDashboardStats();
  res.json({ success: true, data: stats });
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', search } = req.query as {
    page?: string;
    limit?: string;
    search?: string;
  };
  const result = await adminService.getAllUsers(parseInt(page), parseInt(limit), search);
  res.json({ success: true, data: result });
});

export const toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = await adminService.toggleUserStatus(param(req.params.userId));
  res.json({ success: true, data: user });
});

export const getPendingTherapists = asyncHandler(async (_req: Request, res: Response) => {
  const result = await therapistService.getAllTherapistsAdmin(1, 50, false);
  res.json({ success: true, data: result });
});

export const getAllTherapists = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '50' } = req.query as { page?: string; limit?: string };
  const result = await therapistService.getAllTherapistsAdmin(parseInt(page), parseInt(limit));
  res.json({ success: true, data: result });
});

export const approveTherapist = asyncHandler(async (req: Request, res: Response) => {
  const therapist = await therapistService.approveTherapist(param(req.params.therapistId));
  res.json({ success: true, data: therapist });
});

export const rejectTherapist = asyncHandler(async (req: Request, res: Response) => {
  const therapist = await therapistService.rejectTherapist(param(req.params.therapistId));
  res.json({ success: true, data: therapist });
});

export const getAllAppointments = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', status } = req.query as {
    page?: string;
    limit?: string;
    status?: any;
  };
  const result = await appointmentRepo.getAllAppointmentsAdmin(parseInt(page), parseInt(limit), status);
  res.json({ success: true, data: result });
});

export const getRevenue = asyncHandler(async (_req: Request, res: Response) => {
  const data = await adminService.getRevenueByMonth();
  res.json({ success: true, data });
});

export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20' } = req.query as { page?: string; limit?: string };
  const result = await adminService.getReports(parseInt(page), parseInt(limit));
  res.json({ success: true, data: result });
});
