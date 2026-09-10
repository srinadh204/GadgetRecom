import { Link } from '@/lib/router';
import { useCompare } from '@/lib/compare';
import { StarRating } from '@/components/StarRating';
import { GitCompare, X, Trash2, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Category } from '@/types';

export function ComparePage() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data ?? []));
  }, []);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? '';

  if (compareList.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
          <GitCompare className="h-10 w-10 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">No gadgets to compare yet</h1>
        <p className="mx-auto mt-2 max-w-md text-slate-500">
          Browse our catalog and add gadgets to compare side-by-side. You can compare up to 4 at a time.
        </p>
        <Link
          to="/browse"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sky-700"
        >
          Browse Gadgets <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Collect all unique spec keys
  const allSpecKeys = Array.from(
    new Set(compareList.flatMap((g) => Object.keys(g.specs || {})))
  );

  const allBestFor = Array.from(
    new Set(compareList.flatMap((g) => g.best_for || []))
  );

  // Find best value per spec row
  const getBestPrice = () => {
    const min = Math.min(...compareList.map((g) => Number(g.price)));
    return compareList.findIndex((g) => Number(g.price) === min);
  };

  const getBestRating = () => {
    const max = Math.max(...compareList.map((g) => Number(g.rating)));
    return compareList.findIndex((g) => Number(g.rating) === max);
  };

  const bestPriceIdx = getBestPrice();
  const bestRatingIdx = getBestRating();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Compare Gadgets</h1>
          <p className="mt-2 text-slate-500">
            Side-by-side comparison of {compareList.length} gadget{compareList.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={clearCompare}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:border-rose-300 hover:text-rose-600"
        >
          <Trash2 className="h-4 w-4" /> Clear All
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Gadget header row */}
          <div className="grid" style={{ gridTemplateColumns: `180px repeat(${compareList.length}, minmax(240px, 1fr))` }}>
            <div className="border-b border-slate-200 p-4">
              <span className="text-sm font-semibold text-slate-400">Gadget</span>
            </div>
            {compareList.map((g, i) => (
              <div key={g.id} className="relative border-b border-l border-slate-200 p-4">
                <button
                  onClick={() => removeFromCompare(g.id)}
                  className="absolute right-2 top-2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
                <Link to={`/gadgets/${g.slug}`} className="block">
                  <div className="mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                    <img src={g.image_url} alt={g.name} className="h-full w-full object-cover" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wide text-sky-600">{g.brand}</p>
                  <h3 className="mt-1 font-bold text-slate-900 hover:text-sky-700">{g.name}</h3>
                  <p className="mt-1 text-xs text-slate-400">{catName(g.category_id)}</p>
                </Link>
              </div>
            ))}
          </div>

          {/* Price row */}
          <div className="grid" style={{ gridTemplateColumns: `180px repeat(${compareList.length}, minmax(240px, 1fr))` }}>
            <div className="border-b border-slate-200 bg-slate-50 p-4">
              <span className="text-sm font-semibold text-slate-700">Price</span>
            </div>
            {compareList.map((g, i) => (
              <div key={g.id} className={`border-b border-l border-slate-200 p-4 ${i === bestPriceIdx ? 'bg-emerald-50' : ''}`}>
                <span className="text-lg font-bold text-slate-900">${Number(g.price).toLocaleString()}</span>
                {i === bestPriceIdx && <span className="ml-2 text-xs font-medium text-emerald-600">Best Value</span>}
              </div>
            ))}
          </div>

          {/* Rating row */}
          <div className="grid" style={{ gridTemplateColumns: `180px repeat(${compareList.length}, minmax(240px, 1fr))` }}>
            <div className="border-b border-slate-200 bg-slate-50 p-4">
              <span className="text-sm font-semibold text-slate-700">Rating</span>
            </div>
            {compareList.map((g, i) => (
              <div key={g.id} className={`border-b border-l border-slate-200 p-4 ${i === bestRatingIdx ? 'bg-emerald-50' : ''}`}>
                <StarRating rating={g.rating} size="sm" showNumber reviewCount={g.review_count} />
                {i === bestRatingIdx && <p className="mt-1 text-xs font-medium text-emerald-600">Top Rated</p>}
              </div>
            ))}
          </div>

          {/* Tagline row */}
          <div className="grid" style={{ gridTemplateColumns: `180px repeat(${compareList.length}, minmax(240px, 1fr))` }}>
            <div className="border-b border-slate-200 bg-slate-50 p-4">
              <span className="text-sm font-semibold text-slate-700">Tagline</span>
            </div>
            {compareList.map((g) => (
              <div key={g.id} className="border-b border-l border-slate-200 p-4">
                <p className="text-sm text-slate-600">{g.tagline}</p>
              </div>
            ))}
          </div>

          {/* Best For row */}
          <div className="grid" style={{ gridTemplateColumns: `180px repeat(${compareList.length}, minmax(240px, 1fr))` }}>
            <div className="border-b border-slate-200 bg-slate-50 p-4">
              <span className="text-sm font-semibold text-slate-700">Best For</span>
            </div>
            {compareList.map((g) => (
              <div key={g.id} className="border-b border-l border-slate-200 p-4">
                <div className="flex flex-wrap gap-1.5">
                  {(g.best_for || []).map((tag) => (
                    <span key={tag} className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Spec rows */}
          {allSpecKeys.map((specKey, rowIdx) => (
            <div key={specKey} className="grid" style={{ gridTemplateColumns: `180px repeat(${compareList.length}, minmax(240px, 1fr))` }}>
              <div className={`border-b border-slate-200 p-4 ${rowIdx % 2 === 0 ? 'bg-slate-50' : ''}`}>
                <span className="text-sm font-semibold text-slate-700">{specKey}</span>
              </div>
              {compareList.map((g) => (
                <div key={g.id} className={`border-b border-l border-slate-200 p-4 ${rowIdx % 2 === 0 ? 'bg-slate-50/50' : ''}`}>
                  <span className="text-sm text-slate-600">{g.specs?.[specKey] ?? '—'}</span>
                </div>
              ))}
            </div>
          ))}

          {/* Pros row */}
          <div className="grid" style={{ gridTemplateColumns: `180px repeat(${compareList.length}, minmax(240px, 1fr))` }}>
            <div className="border-b border-slate-200 bg-emerald-50 p-4">
              <span className="text-sm font-semibold text-emerald-800">Pros</span>
            </div>
            {compareList.map((g) => (
              <div key={g.id} className="border-b border-l border-slate-200 bg-emerald-50/30 p-4">
                <ul className="space-y-1.5">
                  {(g.pros || []).map((pro, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-emerald-700">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Cons row */}
          <div className="grid" style={{ gridTemplateColumns: `180px repeat(${compareList.length}, minmax(240px, 1fr))` }}>
            <div className="p-4 bg-rose-50">
              <span className="text-sm font-semibold text-rose-800">Cons</span>
            </div>
            {compareList.map((g) => (
              <div key={g.id} className="border-l border-slate-200 bg-rose-50/30 p-4">
                <ul className="space-y-1.5">
                  {(g.cons || []).map((con, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-rose-700">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-rose-500" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* View details row */}
          <div className="grid" style={{ gridTemplateColumns: `180px repeat(${compareList.length}, minmax(240px, 1fr))` }}>
            <div className="p-4">
              <span className="text-sm font-semibold text-slate-400">Details</span>
            </div>
            {compareList.map((g) => (
              <div key={g.id} className="border-l border-slate-200 p-4">
                <Link
                  to={`/gadgets/${g.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700"
                >
                  View Full Details <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
