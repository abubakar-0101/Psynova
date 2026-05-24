'use client';
import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { TherapistCard } from '@/components/therapist/TherapistCard';
import { TherapistCardSkeleton } from '@/components/shared/SkeletonCard';
import { Button } from '@/components/ui/button';
import { useTherapists } from '@/hooks/useTherapists';
import { TherapistProfile } from '@/types';

const SPECIALIZATIONS = [
  'Anxiety', 'Depression', 'Trauma & PTSD', 'Couples Therapy',
  'Family Issues', 'ADHD', 'Grief', 'Stress', 'Addiction', 'Eating Disorders', 'OCD',
];

const LANGUAGES = ['English', 'Spanish', 'French', 'Arabic', 'Mandarin', 'Hindi', 'Portuguese'];

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [debouncedQuery] = useDebounce(query, 300);
  const [filterOpen, setFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    specialization: searchParams.get('specialization') || '',
    language: searchParams.get('language') || '',
    gender: searchParams.get('gender') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    rating: searchParams.get('rating') || '',
    page: 1,
  });

  const { data, isLoading } = useTherapists({
    q: debouncedQuery,
    ...filters,
    limit: 12,
  });

  const therapists: TherapistProfile[] = data?.therapists || [];
  const total: number = data?.meta?.total || 0;

  const updateFilter = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ specialization: '', language: '', gender: '', minPrice: '', maxPrice: '', rating: '', page: 1 });
    setQuery('');
  };

  const hasFilters = filters.specialization || filters.language || filters.gender || filters.minPrice || filters.maxPrice || filters.rating || query;

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <Navbar />
      <div className="pt-20 pb-10">
        {/* Search header */}
        <div className="bg-white border-b border-[#F1F0EE] py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, concern, or specialization..."
                  className="h-12 w-full rounded-xl border border-[#F1F0EE] bg-white pl-10 pr-4 text-sm text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#4A90D9]"
                />
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasFilters && <span className="h-2 w-2 rounded-full bg-[#4A90D9]" />}
              </Button>
              {hasFilters && (
                <Button variant="ghost" onClick={clearFilters} className="gap-1">
                  <X className="h-4 w-4" /> Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <div className="flex gap-6">
            {/* Sidebar Filters Backdrop for mobile */}
            {filterOpen && (
              <div
                className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
                onClick={() => setFilterOpen(false)}
              />
            )}
            {/* Sidebar Filters */}
            <aside
              className={`flex-shrink-0 lg:w-64 lg:static lg:z-auto transition-all duration-300
                ${filterOpen
                  ? 'fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-[#F1F0EE] p-5 pb-16 shadow-2xl overflow-y-auto lg:p-0 lg:shadow-none lg:border-0 lg:bg-transparent lg:block'
                  : 'hidden lg:block'
                }`}
            >
              <div className="flex items-center justify-between lg:hidden mb-4 border-b border-[#F1F0EE] pb-3">
                <h3 className="font-semibold text-[#1A1A2E]">Filters</h3>
                <button onClick={() => setFilterOpen(false)} className="p-1 hover:bg-[#F1F0EE] rounded-lg">
                  <X className="h-5 w-5 text-[#6B7280]" />
                </button>
              </div>
              <div className="space-y-6 border-0 bg-transparent p-0 static lg:border lg:border-[#F1F0EE] lg:bg-white lg:rounded-2xl lg:p-5 lg:pb-12 lg:sticky lg:top-24">
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">Specialization</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {SPECIALIZATIONS.map((spec) => (
                      <label key={spec} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.specialization === spec}
                          onChange={(e) => updateFilter('specialization', e.target.checked ? spec : '')}
                          className="rounded border-[#F1F0EE] text-[#4A90D9]"
                        />
                        <span className="text-sm text-[#6B7280]">{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">Language</h3>
                  <div className="space-y-2">
                    {LANGUAGES.map((lang) => (
                      <label key={lang} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.language === lang}
                          onChange={(e) => updateFilter('language', e.target.checked ? lang : '')}
                          className="rounded border-[#F1F0EE] text-[#4A90D9]"
                        />
                        <span className="text-sm text-[#6B7280]">{lang}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">Gender</h3>
                  <div className="space-y-2">
                    {['MALE', 'FEMALE', 'NON_BINARY'].map((g) => (
                      <label key={g} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          checked={filters.gender === g}
                          onChange={() => updateFilter('gender', g)}
                          className="text-[#4A90D9]"
                        />
                        <span className="text-sm text-[#6B7280]">
                          {g === 'MALE' ? 'Male' : g === 'FEMALE' ? 'Female' : 'Non-binary'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">Price Range</h3>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => updateFilter('minPrice', e.target.value)}
                      className="h-9 w-full rounded-lg border border-[#F1F0EE] px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#4A90D9]"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => updateFilter('maxPrice', e.target.value)}
                      className="h-9 w-full rounded-lg border border-[#F1F0EE] px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#4A90D9]"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">Minimum Rating</h3>
                  <div className="flex gap-2 flex-wrap">
                    {['3', '4', '4.5'].map((r) => (
                      <button
                        key={r}
                        onClick={() => updateFilter('rating', filters.rating === r ? '' : r)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          filters.rating === r
                            ? 'bg-[#4A90D9] text-white'
                            : 'bg-[#F1F0EE] text-[#6B7280] hover:bg-[#4A90D9]/10'
                        }`}
                      >
                        {r}★+
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1">
              <p className="text-sm text-[#6B7280] mb-5">
                {isLoading ? 'Searching...' : `${total} therapist${total !== 1 ? 's' : ''} found`}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => <TherapistCardSkeleton key={i} />)
                  : therapists.length > 0
                  ? therapists.map((t) => <TherapistCard key={t.id} therapist={t} />)
                  : (
                    <div className="col-span-2 text-center py-16 text-[#6B7280]">
                      <p className="text-lg font-medium mb-2">No therapists found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  )}
              </div>

              {/* Pagination */}
              {data?.meta?.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: data.meta.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
                      className={`h-9 w-9 rounded-xl text-sm font-medium transition-colors ${
                        filters.page === i + 1
                          ? 'bg-[#4A90D9] text-white'
                          : 'bg-white border border-[#F1F0EE] text-[#6B7280] hover:bg-[#F1F0EE]'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageInner />
    </Suspense>
  );
}
