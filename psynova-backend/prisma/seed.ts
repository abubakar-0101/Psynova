/* eslint-disable no-console */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = 'Demo1234!';

async function clear() {
  // Order matters — children first.
  await prisma.sessionLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.moodEntry.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.report.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.therapist.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  console.log('🌱 Seeding Psynova demo data...\n');
  console.log('  Clearing existing data...');
  await clear();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  // === Admin ===
  console.log('  Creating admin...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@psynova.com',
      passwordHash,
      role: 'ADMIN',
      firstName: 'Alex',
      lastName: 'Rivera',
      isVerified: true,
    },
  });

  // === Clients ===
  console.log('  Creating clients...');
  const [client1, client2] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'client@psynova.com',
        passwordHash,
        role: 'CLIENT',
        firstName: 'Emma',
        lastName: 'Johnson',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'client2@psynova.com',
        passwordHash,
        role: 'CLIENT',
        firstName: 'Liam',
        lastName: 'Patel',
        isVerified: true,
      },
    }),
  ]);

  // === Therapists ===
  console.log('  Creating therapists...');
  const therapistsData = [
    {
      email: 'therapist@psynova.com',
      firstName: 'Sarah',
      lastName: 'Andrews',
      bio: 'Licensed clinical psychologist with 12 years of experience helping adults manage anxiety, depression, and life transitions. I use a warm, evidence-based approach grounded in CBT and mindfulness.',
      licenseNumber: 'PSY-12345-CA',
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80&auto=format&fit=crop',
      specializations: ['Anxiety', 'Depression', 'Stress', 'CBT'],
      languages: ['English', 'Spanish'],
      sessionPrice: 120,
      yearsExperience: 12,
      gender: 'FEMALE',
      rating: 4.9,
      reviewCount: 0, // computed below
      education: [
        { institution: 'Stanford University', degree: 'PhD Clinical Psychology', year: 2012 },
        { institution: 'UC Berkeley', degree: 'BA Psychology', year: 2007 },
      ],
      certifications: [
        { name: 'CBT Certified', issuer: 'Beck Institute', year: 2014 },
        { name: 'Mindfulness-Based Stress Reduction', issuer: 'UMass Medical', year: 2016 },
      ],
    },
    {
      email: 'maya.chen@psynova.com',
      firstName: 'Maya',
      lastName: 'Chen',
      bio: 'LMFT specializing in trauma-informed care for survivors of abuse and PTSD. EMDR-certified. I create a safe, non-judgmental space for healing at your own pace.',
      licenseNumber: 'LMFT-98765-CA',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&auto=format&fit=crop',
      specializations: ['Trauma', 'PTSD', 'Grief'],
      languages: ['English', 'Mandarin'],
      sessionPrice: 140,
      yearsExperience: 9,
      gender: 'FEMALE',
      rating: 5.0,
      reviewCount: 0,
      education: [
        { institution: 'USC', degree: 'MA Marriage & Family Therapy', year: 2015 },
      ],
      certifications: [
        { name: 'EMDR Certified', issuer: 'EMDRIA', year: 2017 },
      ],
    },
    {
      email: 'james.okonkwo@psynova.com',
      firstName: 'James',
      lastName: 'Okonkwo',
      bio: 'Couples and family therapist with a focus on communication, conflict resolution, and rebuilding intimacy. Gottman Method trained.',
      licenseNumber: 'LCSW-55512-NY',
      photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop',
      specializations: ['Couples', 'Family Issues', 'Relationships', 'ADHD'],
      languages: ['English', 'French'],
      sessionPrice: 95,
      yearsExperience: 7,
      gender: 'MALE',
      rating: 4.7,
      reviewCount: 0,
      education: [
        { institution: 'Columbia University', degree: 'MSW', year: 2017 },
      ],
      certifications: [
        { name: 'Gottman Method Level 2', issuer: 'Gottman Institute', year: 2019 },
      ],
    },
  ];

  const therapistRecords = [];
  for (const t of therapistsData) {
    const user = await prisma.user.create({
      data: {
        email: t.email,
        passwordHash,
        role: 'THERAPIST',
        firstName: t.firstName,
        lastName: t.lastName,
        isVerified: true,
      },
    });

    const profile = await prisma.therapist.create({
      data: {
        userId: user.id,
        bio: t.bio,
        licenseNumber: t.licenseNumber,
        photoUrl: t.photoUrl,
        specializations: t.specializations,
        languages: t.languages,
        sessionPrice: t.sessionPrice,
        yearsExperience: t.yearsExperience,
        gender: t.gender,
        timezone: 'America/Los_Angeles',
        isApproved: true,
        isOnline: false,
        rating: t.rating,
        reviewCount: t.reviewCount,
        education: t.education,
        certifications: t.certifications,
        sessionTypes: ['ONLINE'],
      },
    });

    // Availability: weekdays 9-12 and 14-17 (six 1-hour slots per weekday)
    const slots: { dayOfWeek: number; startTime: string; endTime: string; isRecurring: boolean }[] = [];
    for (let day = 1; day <= 5; day++) {
      for (const start of [9, 10, 11, 14, 15, 16]) {
        slots.push({
          dayOfWeek: day,
          startTime: `${String(start).padStart(2, '0')}:00`,
          endTime: `${String(start + 1).padStart(2, '0')}:00`,
          isRecurring: true,
        });
      }
    }
    await prisma.availabilitySlot.createMany({
      data: slots.map((s) => ({ ...s, therapistId: profile.id })),
    });

    therapistRecords.push({ user, profile });
  }

  // === Appointments ===
  console.log('  Creating appointments...');
  const now = new Date();
  const at = (days: number, hour: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  // Upcoming: client1 → Sarah (in 2 days, 10:00) and client1 → Maya (in 5 days, 15:00)
  // Past completed: client1 → Sarah (-7 days) and client2 → James (-14 days)
  const appointmentSpecs = [
    {
      client: client1,
      therapist: therapistRecords[0],
      start: at(2, 10),
      status: 'CONFIRMED' as const,
      paid: true,
    },
    {
      client: client1,
      therapist: therapistRecords[1],
      start: at(5, 15),
      status: 'CONFIRMED' as const,
      paid: true,
    },
    {
      client: client1,
      therapist: therapistRecords[0],
      start: at(-7, 10),
      status: 'COMPLETED' as const,
      paid: true,
      review: { rating: 5, comment: 'Dr. Andrews is wonderful — really felt heard. Highly recommend.' },
    },
    {
      client: client2,
      therapist: therapistRecords[2],
      start: at(-14, 14),
      status: 'COMPLETED' as const,
      paid: true,
      review: { rating: 4, comment: 'Great couples session — practical exercises we use weekly now.' },
    },
    {
      client: client2,
      therapist: therapistRecords[1],
      start: at(-21, 11),
      status: 'COMPLETED' as const,
      paid: true,
      review: { rating: 5, comment: 'Maya created such a safe space for difficult conversations.' },
    },
  ];

  for (const spec of appointmentSpecs) {
    const end = new Date(spec.start);
    end.setMinutes(end.getMinutes() + 50);

    const appt = await prisma.appointment.create({
      data: {
        clientId: spec.client.id,
        therapistId: spec.therapist.user.id,
        therapistProfileId: spec.therapist.profile.id,
        startTime: spec.start,
        endTime: end,
        status: spec.status,
        meetingRoomId: `psynova-session-demo-${Math.random().toString(36).slice(2, 9)}`,
      },
    });

    if (spec.paid) {
      await prisma.payment.create({
        data: {
          appointmentId: appt.id,
          userId: spec.client.id,
          amount: Number(spec.therapist.profile.sessionPrice),
          currency: 'usd',
          status: 'COMPLETED',
          stripeSessionId: `cs_test_demo_${appt.id.slice(0, 12)}`,
        },
      });
    }

    if (spec.review) {
      await prisma.review.create({
        data: {
          appointmentId: appt.id,
          clientId: spec.client.id,
          therapistId: spec.therapist.user.id,
          therapistProfileId: spec.therapist.profile.id,
          rating: spec.review.rating,
          comment: spec.review.comment,
        },
      });
    }
  }

  // Recompute therapist ratings from real reviews
  for (const t of therapistRecords) {
    const agg = await prisma.review.aggregate({
      where: { therapistProfileId: t.profile.id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.therapist.update({
      where: { id: t.profile.id },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count.rating,
      },
    });
  }

  // === Conversations & messages ===
  // A conversation is unlocked once a paid appointment exists. Seed one between
  // client1 and Sarah with a few messages.
  console.log('  Creating conversations & messages...');
  const conv = await prisma.conversation.create({
    data: {
      clientId: client1.id,
      therapistId: therapistRecords[0].user.id,
      isUnlocked: true,
      lastMessageAt: new Date(now.getTime() - 1000 * 60 * 60 * 2), // 2h ago
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv.id,
        senderId: therapistRecords[0].user.id,
        content: "Hi Emma! Looking forward to our session on Wednesday. Anything in particular you'd like to focus on?",
        type: 'TEXT',
        isRead: true,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 26),
      },
      {
        conversationId: conv.id,
        senderId: client1.id,
        content: "Hi Dr. Andrews! Yes — I'd like to talk about the work stress I mentioned. It's been getting worse this week.",
        type: 'TEXT',
        isRead: true,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24),
      },
      {
        conversationId: conv.id,
        senderId: therapistRecords[0].user.id,
        content: "Got it. Take a look at the breathing exercise I sent over before we meet — we'll build on it.",
        type: 'TEXT',
        isRead: false,
        createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
      },
    ],
  });

  // === Notifications ===
  console.log('  Creating notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: client1.id,
        type: 'BOOKING_CONFIRMED',
        title: 'Session confirmed',
        body: 'Your session with Dr. Sarah Andrews is confirmed for Wednesday at 10:00 AM.',
        isRead: false,
      },
      {
        userId: client1.id,
        type: 'NEW_MESSAGE',
        title: 'New message from Dr. Andrews',
        body: 'Got it. Take a look at the breathing exercise...',
        isRead: false,
      },
      {
        userId: client1.id,
        type: 'SESSION_REMINDER',
        title: 'Session tomorrow',
        body: 'Reminder: your session with Dr. Maya Chen is tomorrow at 3:00 PM.',
        isRead: true,
      },
      {
        userId: therapistRecords[0].user.id,
        type: 'REVIEW_RECEIVED',
        title: 'New 5-star review',
        body: 'Emma Johnson left a 5-star review on your last session.',
        isRead: false,
      },
      {
        userId: therapistRecords[0].user.id,
        type: 'PAYMENT_RECEIVED',
        title: 'Payment received: $120',
        body: 'Payment for last week\'s session with Emma Johnson has been processed.',
        isRead: true,
      },
    ],
  });

  // === Mood entries (last 10 days) ===
  console.log('  Creating mood entries...');
  const moods = [6, 5, 7, 4, 6, 8, 7, 6, 8, 9];
  await prisma.moodEntry.createMany({
    data: moods.map((mood, i) => ({
      userId: client1.id,
      mood,
      note: i % 3 === 0 ? "Slept better last night — felt clearer at work." : undefined,
      tags: i % 2 === 0 ? ['work', 'sleep'] : ['social'],
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * (moods.length - i)),
    })),
  });

  // === Journal entries ===
  console.log('  Creating journal entries...');
  await prisma.journalEntry.createMany({
    data: [
      {
        userId: client1.id,
        title: 'Trying the breathing exercise',
        content: 'Spent 5 minutes on the 4-7-8 breathing pattern this morning. Felt my shoulders drop noticeably. Going to make it a morning ritual.',
        wordCount: 28,
        isPrivate: true,
      },
      {
        userId: client1.id,
        title: 'Hard day, but…',
        content: 'Work was rough but I noticed I didn\'t spiral as quickly as I used to. Small wins matter.',
        wordCount: 19,
        isPrivate: true,
      },
    ],
  });

  // === Final summary ===
  const counts = await Promise.all([
    prisma.user.count(),
    prisma.therapist.count(),
    prisma.appointment.count(),
    prisma.review.count(),
    prisma.payment.count(),
    prisma.message.count(),
    prisma.notification.count(),
    prisma.moodEntry.count(),
    prisma.journalEntry.count(),
    prisma.availabilitySlot.count(),
  ]);

  console.log('\n✅ Seed complete:');
  console.log(`   users:            ${counts[0]}`);
  console.log(`   therapists:       ${counts[1]}`);
  console.log(`   appointments:     ${counts[2]}`);
  console.log(`   reviews:          ${counts[3]}`);
  console.log(`   payments:         ${counts[4]}`);
  console.log(`   messages:         ${counts[5]}`);
  console.log(`   notifications:    ${counts[6]}`);
  console.log(`   mood entries:     ${counts[7]}`);
  console.log(`   journal entries:  ${counts[8]}`);
  console.log(`   availability:     ${counts[9]} slots`);
  console.log('\n🔑 Demo credentials (password for all: Demo1234!):');
  console.log('   admin@psynova.com      → ADMIN');
  console.log('   client@psynova.com     → CLIENT (Emma)');
  console.log('   client2@psynova.com    → CLIENT (Liam)');
  console.log('   therapist@psynova.com  → THERAPIST (Dr. Sarah Andrews)');
  console.log('   maya.chen@psynova.com  → THERAPIST (Dr. Maya Chen)');
  console.log('   james.okonkwo@psynova.com → THERAPIST (Dr. James Okonkwo)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
