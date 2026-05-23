'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

const stats = [
  { value: 10000, suffix: '+', label: 'Clients helped', prefix: '' },
  { value: 500, suffix: '+', label: 'Licensed therapists', prefix: '' },
  { value: 4.9, suffix: '★', label: 'Average rating', prefix: '' },
  { value: 30, suffix: '+', label: 'Specializations', prefix: '' },
];

function AnimatedNumber({ value, suffix, prefix }: { value: number; suffix: string; prefix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, value);
      setCount(current);
      if (current >= value) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  const display = value % 1 !== 0 ? count.toFixed(1) : Math.floor(count).toLocaleString();

  return (
    <span ref={ref}>
      {prefix}{display}{suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Gradient border container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl ring-gradient bg-[var(--surface)] p-10 sm:p-12 overflow-hidden">
          {/* Mesh overlay */}
          <div className="absolute inset-0 -z-10 bg-brand-mesh opacity-40" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-8 relative">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center sm:text-left relative">
                {i > 0 && (
                  <div className="hidden md:block absolute -left-4 top-0 bottom-0 w-px bg-[var(--border-subtle)]" />
                )}
                <div className="font-display text-4xl sm:text-5xl font-light tracking-tight text-brand-gradient mb-1.5">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                </div>
                <div className="text-sm text-[var(--muted-fg)]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
