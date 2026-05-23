import { LegalLayout } from '../_components/LegalLayout';

export const metadata = {
  title: 'Terms of Service · Psynova',
  description: 'The terms that govern your use of the Psynova platform.',
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="May 2026"
      intro="These Terms govern your access to and use of Psynova. By creating an account or using the platform, you agree to be bound by them. Please read them carefully."
      sections={[
        {
          id: 'agreement',
          title: 'Agreement',
          body: (
            <>
              <p>
                These Terms of Service ("Terms") form a binding agreement between you and Psynova,
                Inc. ("Psynova," "we," "us"). They apply to your use of psynova.com, the Psynova web
                application, and any related services.
              </p>
              <p>
                If you don't agree with any part of these Terms, please don't use the platform.
              </p>
            </>
          ),
        },
        {
          id: 'what-we-are',
          title: 'What Psynova is — and is not',
          body: (
            <>
              <p>
                Psynova is a technology platform that connects clients with independent, licensed
                mental-health providers. We facilitate scheduling, secure messaging, video sessions,
                and payment processing.
              </p>
              <p className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900">
                <strong>Important:</strong> Psynova is <em>not</em> a healthcare provider. We do not
                practice medicine, provide therapy, or supervise clinical care. The providers on our
                platform are independent professionals responsible for their own clinical decisions.
              </p>
              <p>
                <strong className="text-[#1A1A2E]">If you are in crisis or experiencing a
                psychiatric emergency,</strong> do not use Psynova. Call 988 (US Suicide & Crisis
                Lifeline) or your local emergency line.
              </p>
            </>
          ),
        },
        {
          id: 'eligibility',
          title: 'Eligibility',
          body: (
            <>
              <p>You must:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Be at least 18 years old.</li>
                <li>Provide accurate and complete information.</li>
                <li>Have authority to enter into this agreement.</li>
                <li>Not be barred from using Psynova under any applicable law.</li>
              </ul>
              <p>
                Therapists must additionally hold a valid, unrestricted license in good standing in
                each jurisdiction where they intend to practice and may be subject to additional
                provider terms.
              </p>
            </>
          ),
        },
        {
          id: 'account',
          title: 'Your account',
          body: (
            <>
              <p>
                You're responsible for everything that happens under your account, including keeping
                your password confidential and notifying us immediately of unauthorized use.
              </p>
              <p>
                You may not share your account, impersonate someone else, or create accounts using
                automated means.
              </p>
            </>
          ),
        },
        {
          id: 'payments',
          title: 'Payments and refunds',
          body: (
            <>
              <p>
                All payments are processed via Stripe. By booking a session, you authorize Psynova to
                charge the payment method on file for the agreed session fee.
              </p>
              <p>
                <strong className="text-[#1A1A2E]">Cancellation policy:</strong> Cancellations more than
                24 hours before the scheduled session are refunded in full. Cancellations within 24
                hours are subject to a 50% cancellation fee. No-shows are charged the full session fee.
              </p>
              <p>
                Therapists may waive cancellation fees at their discretion. Disputed charges are
                reviewed by our support team within 48 hours.
              </p>
            </>
          ),
        },
        {
          id: 'platform-fees',
          title: 'Platform fees',
          body: (
            <p>
              Psynova retains a 10% platform fee on each completed session. Therapists are paid out
              the remaining 90% via Stripe on a weekly cycle, subject to Stripe's standard processing
              times.
            </p>
          ),
        },
        {
          id: 'conduct',
          title: 'Acceptable use',
          body: (
            <>
              <p>You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Harass, abuse, threaten, or harm any other user.</li>
                <li>Share illegal, defamatory, or sexually explicit content.</li>
                <li>Impersonate a therapist or otherwise misrepresent qualifications.</li>
                <li>Attempt to bypass the platform to avoid platform fees.</li>
                <li>Scrape, reverse-engineer, or interfere with platform infrastructure.</li>
                <li>Use the platform to violate any law or third-party right.</li>
              </ul>
              <p>
                Violations may result in account suspension or termination, and may be reported to
                appropriate authorities.
              </p>
            </>
          ),
        },
        {
          id: 'content',
          title: 'Your content',
          body: (
            <>
              <p>
                You retain ownership of content you create on Psynova (messages, journal entries,
                profile content). You grant Psynova a limited license to host, display, and process
                this content solely to operate the platform.
              </p>
              <p>
                We will not use your clinical content for marketing, advertising, or to train AI
                models.
              </p>
            </>
          ),
        },
        {
          id: 'no-medical-advice',
          title: 'No medical advice from Psynova',
          body: (
            <p>
              Information on the platform (educational articles, FAQs, blog content) is for general
              informational purposes only and is not medical advice. Always consult a licensed
              provider for medical or psychiatric guidance.
            </p>
          ),
        },
        {
          id: 'liability',
          title: 'Limitation of liability',
          body: (
            <>
              <p>
                To the maximum extent permitted by law, Psynova and its officers, directors,
                employees, and agents will not be liable for any indirect, incidental, special,
                consequential, or punitive damages arising from your use of the platform.
              </p>
              <p>
                Our total aggregate liability for any claim arising from the platform is limited to
                the greater of (a) $100 USD or (b) the total amount you paid Psynova in the 12 months
                preceding the claim.
              </p>
            </>
          ),
        },
        {
          id: 'termination',
          title: 'Termination',
          body: (
            <>
              <p>
                You may delete your account at any time from Settings → Danger Zone. We may suspend
                or terminate accounts that violate these Terms or that pose a risk to other users.
              </p>
              <p>
                Provisions that by their nature should survive termination (payment obligations,
                disclaimers, limitations of liability, dispute resolution) will survive.
              </p>
            </>
          ),
        },
        {
          id: 'governing-law',
          title: 'Governing law and disputes',
          body: (
            <>
              <p>
                These Terms are governed by the laws of the State of California, without regard to
                its conflict of laws principles. Any dispute will be resolved through binding
                arbitration in San Francisco, CA, except where prohibited by law.
              </p>
            </>
          ),
        },
        {
          id: 'changes',
          title: 'Changes to these terms',
          body: (
            <p>
              We may update these Terms from time to time. Material changes will be announced at
              least 30 days in advance via email and in-app notification. Continued use after the
              effective date constitutes acceptance.
            </p>
          ),
        },
        {
          id: 'contact',
          title: 'Contact',
          body: (
            <p>
              Questions about these Terms can go to{' '}
              <a href="mailto:legal@psynova.com" className="text-[#4A90D9] hover:underline">
                legal@psynova.com
              </a>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
