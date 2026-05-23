export type Role = 'CLIENT' | 'THERAPIST' | 'ADMIN';
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'REFUNDED' | 'FAILED';
export type NotificationType =
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_CANCELLED'
  | 'NEW_MESSAGE'
  | 'SESSION_REMINDER'
  | 'REVIEW_RECEIVED'
  | 'PAYMENT_RECEIVED'
  | 'ACCOUNT_APPROVED'
  | 'ACCOUNT_SUSPENDED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  therapistProfile?: TherapistProfile | null;
}

export interface TherapistProfile {
  id: string;
  userId: string;
  bio?: string;
  licenseNumber?: string;
  specializations: string[];
  languages: string[];
  sessionPrice: number;
  yearsExperience: number;
  gender?: string;
  timezone: string;
  isApproved: boolean;
  isOnline: boolean;
  rating: number;
  reviewCount: number;
  photoUrl?: string;
  sessionTypes: string[];
  education?: EducationEntry[];
  certifications?: CertificationEntry[];
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  availabilitySlots?: AvailabilitySlot[];
  reviews?: Review[];
}

export interface AvailabilitySlot {
  id: string;
  therapistId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  clientId: string;
  therapistId: string;
  therapistProfileId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  meetingRoomId?: string;
  notes?: string;
  cancellationReason?: string;
  createdAt: string;
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  therapistUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  therapistProfile: {
    id: string;
    photoUrl?: string;
    sessionPrice: number;
  };
  review?: Review;
  payment?: Payment;
}

export interface Conversation {
  id: string;
  clientId: string;
  therapistId: string;
  isUnlocked: boolean;
  lastMessageAt?: string;
  client: { id: string; firstName: string; lastName: string };
  therapist: { id: string; firstName: string; lastName: string };
  messages: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content?: string;
  type: 'TEXT' | 'FILE' | 'VOICE' | 'IMAGE';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; firstName: string; lastName: string };
}

export interface Review {
  id: string;
  appointmentId: string;
  clientId: string;
  therapistId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  client: { firstName: string; lastName: string };
}

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  receiptUrl?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface MoodEntry {
  id: string;
  mood: number;
  note?: string;
  tags: string[];
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  isPrivate: boolean;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  year: number;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  year: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: PaginationMeta;
}
