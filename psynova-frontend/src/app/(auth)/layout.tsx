import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--brand)]/5 via-[var(--bg)] to-[var(--brand-accent)]/5 flex flex-col transition-colors duration-300">
      {/* Logo */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="h-8 w-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-[0_4px_14px_-4px_rgba(99,102,241,0.5)]">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-bold text-xl text-[var(--fg)]">Psynova</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">{children}</main>
    </div>
  );
}
