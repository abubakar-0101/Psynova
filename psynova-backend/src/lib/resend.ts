import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Psynova <noreply@psynova.com>';

export async function sendVerificationEmail(email: string, firstName: string, token: string) {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Verify your Psynova account',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #FAFAF9;">
        <h1 style="color: #1A1A2E; font-size: 28px; margin-bottom: 8px;">Welcome to Psynova, ${firstName}!</h1>
        <p style="color: #6B7280; font-size: 16px; line-height: 1.6;">Please verify your email address to get started on your wellness journey.</p>
        <a href="${verifyUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: #4A90D9; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">Verify Email</a>
        <p style="color: #6B7280; font-size: 14px;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(email: string, firstName: string, token: string) {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Reset your Psynova password',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #FAFAF9;">
        <h1 style="color: #1A1A2E; font-size: 28px; margin-bottom: 8px;">Password Reset</h1>
        <p style="color: #6B7280; font-size: 16px;">Hi ${firstName}, we received a request to reset your password.</p>
        <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: #4A90D9; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">Reset Password</a>
        <p style="color: #6B7280; font-size: 14px;">This link expires in 1 hour. If you didn't request a reset, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendBookingConfirmationEmail({
  email,
  firstName,
  therapistName,
  sessionDate,
  sessionTime,
  appointmentId,
}: {
  email: string;
  firstName: string;
  therapistName: string;
  sessionDate: string;
  sessionTime: string;
  appointmentId: string;
}) {
  const sessionUrl = `${process.env.CLIENT_URL}/session/${appointmentId}`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Booking Confirmed — ${sessionDate} with ${therapistName}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #FAFAF9;">
        <h1 style="color: #1A1A2E; font-size: 28px; margin-bottom: 8px;">Session Confirmed!</h1>
        <p style="color: #6B7280; font-size: 16px;">Hi ${firstName}, your session has been booked.</p>
        <div style="background: white; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #F1F0EE;">
          <p style="margin: 0 0 8px; color: #1A1A2E;"><strong>Therapist:</strong> ${therapistName}</p>
          <p style="margin: 0 0 8px; color: #1A1A2E;"><strong>Date:</strong> ${sessionDate}</p>
          <p style="margin: 0; color: #1A1A2E;"><strong>Time:</strong> ${sessionTime}</p>
        </div>
        <a href="${sessionUrl}" style="display: inline-block; margin: 8px 0; padding: 14px 28px; background: #4A90D9; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">Join Session</a>
        <p style="color: #6B7280; font-size: 14px; margin-top: 24px;">You'll receive a reminder 24 hours before your session.</p>
      </div>
    `,
  });
}

export async function sendSessionReminderEmail({
  email,
  firstName,
  therapistName,
  sessionDate,
  sessionTime,
  appointmentId,
}: {
  email: string;
  firstName: string;
  therapistName: string;
  sessionDate: string;
  sessionTime: string;
  appointmentId: string;
}) {
  const sessionUrl = `${process.env.CLIENT_URL}/session/${appointmentId}`;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Reminder: Session tomorrow with ${therapistName}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #FAFAF9;">
        <h1 style="color: #1A1A2E; font-size: 28px; margin-bottom: 8px;">Session Tomorrow</h1>
        <p style="color: #6B7280; font-size: 16px;">Hi ${firstName}, just a reminder about your upcoming session.</p>
        <div style="background: white; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #F1F0EE;">
          <p style="margin: 0 0 8px; color: #1A1A2E;"><strong>Therapist:</strong> ${therapistName}</p>
          <p style="margin: 0 0 8px; color: #1A1A2E;"><strong>Date:</strong> ${sessionDate}</p>
          <p style="margin: 0; color: #1A1A2E;"><strong>Time:</strong> ${sessionTime}</p>
        </div>
        <a href="${sessionUrl}" style="display: inline-block; margin: 8px 0; padding: 14px 28px; background: #4A90D9; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">Join Session</a>
      </div>
    `,
  });
}

export async function sendCancellationEmail({
  email,
  firstName,
  therapistName,
  sessionDate,
  reason,
}: {
  email: string;
  firstName: string;
  therapistName: string;
  sessionDate: string;
  reason?: string;
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: `Session Cancelled — ${sessionDate}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #FAFAF9;">
        <h1 style="color: #1A1A2E; font-size: 28px; margin-bottom: 8px;">Session Cancelled</h1>
        <p style="color: #6B7280; font-size: 16px;">Hi ${firstName}, your session with ${therapistName} on ${sessionDate} has been cancelled.</p>
        ${reason ? `<p style="color: #6B7280; font-size: 16px;"><strong>Reason:</strong> ${reason}</p>` : ''}
        <a href="${process.env.CLIENT_URL}/search" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: #4A90D9; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">Find Another Therapist</a>
      </div>
    `,
  });
}

export async function sendTherapistApprovalEmail(email: string, firstName: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Your Psynova therapist profile has been approved!',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #FAFAF9;">
        <h1 style="color: #1A1A2E; font-size: 28px; margin-bottom: 8px;">Congratulations, ${firstName}!</h1>
        <p style="color: #6B7280; font-size: 16px;">Your therapist profile on Psynova has been verified and approved. You can now start accepting clients.</p>
        <a href="${process.env.CLIENT_URL}/dashboard/therapist" style="display: inline-block; margin: 24px 0; padding: 14px 28px; background: #7BAE9E; color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
      </div>
    `,
  });
}
