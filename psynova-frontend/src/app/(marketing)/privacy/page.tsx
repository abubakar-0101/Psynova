import { LegalLayout } from '../_components/LegalLayout';

export const metadata = {
  title: 'Privacy Policy · Psynova',
  description: 'How Psynova collects, uses, and protects your data.',
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="May 2026"
      intro="Your privacy matters — especially in mental health care. This policy explains what we collect, why we collect it, who we share it with, and the rights you have over your data."
      sections={[
        {
          id: 'overview',
          title: 'Overview',
          body: (
            <>
              <p>
                Psynova, Inc. ("Psynova," "we," "us," or "our") operates a marketplace connecting
                clients with licensed mental-health providers. This policy applies to everyone who
                visits psynova.com or uses the Psynova platform.
              </p>
              <p>
                We follow HIPAA-aligned practices for clinical information and align with applicable
                state and federal privacy laws including GDPR (for EU residents) and CCPA (for
                California residents).
              </p>
            </>
          ),
        },
        {
          id: 'what-we-collect',
          title: 'Information we collect',
          body: (
            <>
              <p><strong className="text-[#1A1A2E]">Account information</strong> — name, email, password (hashed with bcrypt), role (client / therapist / admin), and profile details.</p>
              <p><strong className="text-[#1A1A2E]">Health-related information</strong> — concerns you share when matching, mood entries, journal entries, and session notes. This is treated as Protected Health Information (PHI) where applicable.</p>
              <p><strong className="text-[#1A1A2E]">Payment information</strong> — handled exclusively by Stripe. We never see or store full card numbers.</p>
              <p><strong className="text-[#1A1A2E]">Messages and session content</strong> — chat messages, file attachments, and (where applicable) session join/leave timestamps.</p>
              <p><strong className="text-[#1A1A2E]">Technical information</strong> — IP address, browser, device type, and usage events, used for security and product analytics.</p>
            </>
          ),
        },
        {
          id: 'how-we-use',
          title: 'How we use your information',
          body: (
            <>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>To operate the platform — matching, booking, messaging, video sessions.</li>
                <li>To process payments and issue receipts via Stripe.</li>
                <li>To send transactional emails (booking confirmations, reminders, password resets).</li>
                <li>To detect fraud and protect users from abuse.</li>
                <li>To comply with legal obligations (subpoenas, reporting requirements).</li>
              </ul>
              <p>
                We do not sell your personal information to third parties. We do not use your
                clinical content (messages, journal entries, mood logs) to train AI models.
              </p>
            </>
          ),
        },
        {
          id: 'sharing',
          title: 'Who we share information with',
          body: (
            <>
              <p>We share data only with the following, and only as needed:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-[#1A1A2E]">Your therapist</strong> — sees what you share in your profile, messages, and sessions.</li>
                <li><strong className="text-[#1A1A2E]">Stripe</strong> — payment processing.</li>
                <li><strong className="text-[#1A1A2E]">Cloudinary</strong> — secure file and image hosting.</li>
                <li><strong className="text-[#1A1A2E]">Resend</strong> — transactional email delivery.</li>
                <li><strong className="text-[#1A1A2E]">Neon</strong> — managed PostgreSQL database hosting.</li>
                <li><strong className="text-[#1A1A2E]">Law enforcement</strong> — only when legally compelled (e.g., subpoena, court order).</li>
              </ul>
            </>
          ),
        },
        {
          id: 'security',
          title: 'How we protect your information',
          body: (
            <>
              <p>We use industry-standard safeguards including:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>TLS 1.3 encryption in transit, AES-256 at rest.</li>
                <li>bcrypt password hashing with 12 salt rounds.</li>
                <li>Short-lived JWT access tokens and httpOnly refresh cookies.</li>
                <li>Role-based access controls on every API endpoint.</li>
                <li>Rate limiting and intrusion monitoring.</li>
                <li>Regular third-party security reviews.</li>
              </ul>
              <p>
                No system is perfectly secure, but we treat your data with the same level of care we
                would expect for our own.
              </p>
            </>
          ),
        },
        {
          id: 'retention',
          title: 'How long we keep your information',
          body: (
            <>
              <p>We retain data only as long as needed:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-[#1A1A2E]">Active accounts</strong> — for as long as the account is active.</li>
                <li><strong className="text-[#1A1A2E]">Clinical records</strong> — 7 years after the last session, in accordance with state requirements.</li>
                <li><strong className="text-[#1A1A2E]">Payment records</strong> — 7 years for tax and accounting compliance.</li>
                <li><strong className="text-[#1A1A2E]">Deleted accounts</strong> — personal data removed within 30 days, except where retention is legally required.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'your-rights',
          title: 'Your rights',
          body: (
            <>
              <p>You can:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Access a copy of your personal data.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request deletion of your account and personal data.</li>
                <li>Object to certain processing, or restrict it.</li>
                <li>Export your data in a portable format.</li>
                <li>Withdraw consent for marketing communications.</li>
              </ul>
              <p>
                To exercise any of these rights, email us at{' '}
                <a href="mailto:privacy@psynova.com" className="text-[#4A90D9] hover:underline">
                  privacy@psynova.com
                </a>. We respond within 30 days.
              </p>
            </>
          ),
        },
        {
          id: 'cookies',
          title: 'Cookies & tracking',
          body: (
            <>
              <p>
                We use essential cookies for authentication (httpOnly refresh tokens) and a small set of
                analytics cookies to understand how the platform is used. You can disable
                non-essential cookies in your account settings.
              </p>
            </>
          ),
        },
        {
          id: 'children',
          title: "Children's privacy",
          body: (
            <p>
              Psynova is not intended for users under 18. We do not knowingly collect data from
              minors. If you believe a minor has signed up, contact us and we will delete the account.
            </p>
          ),
        },
        {
          id: 'changes',
          title: 'Changes to this policy',
          body: (
            <p>
              We update this policy when our practices change. Material changes will be announced via
              email and in-app notification at least 30 days before they take effect.
            </p>
          ),
        },
        {
          id: 'contact',
          title: 'Contact us',
          body: (
            <>
              <p>Privacy questions or requests can go to:</p>
              <p>
                <strong className="text-[#1A1A2E]">Email:</strong>{' '}
                <a href="mailto:privacy@psynova.com" className="text-[#4A90D9] hover:underline">
                  privacy@psynova.com
                </a>
                <br />
                <strong className="text-[#1A1A2E]">Mail:</strong> Psynova, Inc. — Privacy Officer, 548
                Market St #5210, San Francisco, CA 94104
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
