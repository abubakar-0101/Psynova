import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

interface LegalLayoutProps {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalLayout({ title, intro, lastUpdated, sections }: LegalLayoutProps) {
  return (
    <>
      <section className="pt-32 pb-10 bg-gradient-to-b from-[#4A90D9]/5 to-transparent">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#4A90D9] mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1A1A2E] mb-3">{title}</h1>
          <p className="text-xs uppercase tracking-wide text-[#6B7280] mb-5">
            Last updated · {lastUpdated}
          </p>
          <p className="text-[#6B7280] leading-relaxed max-w-2xl">{intro}</p>
        </div>
      </section>

      <section className="pb-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_3fr] gap-10">
            {/* TOC */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-2xl border border-[#F1F0EE] bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280] mb-3">
                  Contents
                </p>
                <ul className="space-y-2">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="text-sm text-[#6B7280] hover:text-[#4A90D9] transition-colors block leading-snug"
                      >
                        {i + 1}. {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Content */}
            <article className="prose-content">
              {sections.map((s, i) => (
                <section key={s.id} id={s.id} className="mb-10 scroll-mt-24">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A2E] mb-3">
                    {i + 1}. {s.title}
                  </h2>
                  <div className="text-[#6B7280] leading-relaxed space-y-3 text-sm sm:text-[15px]">
                    {s.body}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </div>
      </section>
    </>
  );
}
