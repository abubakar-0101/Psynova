import Link from 'next/link';
import { Heart, Share2, MessageCircle, Globe } from 'lucide-react';

const links = {
  platform: [
    { label: 'Find Therapists', href: '/search' },
    { label: 'Get Matched', href: '/recommend' },
    { label: 'For Therapists', href: '/for-therapists' },
    { label: 'Pricing', href: '/#pricing' },
  ],
  support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact Us', href: '/contact' },
  ],
  specializations: [
    { label: 'Anxiety', href: '/search?specialization=Anxiety' },
    { label: 'Depression', href: '/search?specialization=Depression' },
    { label: 'Trauma', href: '/search?specialization=Trauma' },
    { label: 'Couples Therapy', href: '/search?specialization=Couples' },
  ],
};

export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--border-subtle)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-[0_4px_20px_-4px_rgba(99,102,241,0.5)]">
                <span className="text-white font-bold text-base">P</span>
              </div>
              <span className="font-display font-semibold text-xl text-[var(--fg)]">Psynova</span>
            </div>
            <p className="text-[var(--muted-fg)] text-sm leading-relaxed max-w-xs">
              Therapy that actually fits your life. Connect with licensed therapists who understand you.
            </p>
            <div className="mt-5 flex gap-3">
              <a
                href="https://www.linkedin.com/in/muhammadabubakarirshad/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-fg)] hover:text-blue-600 transition-colors"
                title="LinkedIn"
              >
                <Share2 className="h-4 w-4" />
                LinkedIn
              </a>
              <a
                href="https://www.instagram.com/abubakar._.62?igsh=cWw3a2ozYzhwMm9r"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-fg)] hover:text-pink-600 transition-colors"
                title="Instagram"
              >
                <Globe className="h-4 w-4" />
                Instagram
              </a>
              <a
                href="https://wa.me/+923047773289"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-fg)] hover:text-green-600 transition-colors"
                title="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Link columns */}
          {[
            { title: 'Platform', items: links.platform },
            { title: 'Support', items: links.support },
            { title: 'Specializations', items: links.specializations },
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--fg)] mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-[var(--muted-fg)] hover:text-[var(--fg)] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[var(--muted-fg)] text-xs">
            © {new Date().getFullYear()} Psynova. All rights reserved.
          </p>
          <p className="text-[var(--muted-fg)] text-xs flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-pink-500 fill-current" /> for mental wellness
          </p>
        </div>
      </div>
    </footer>
  );
}
