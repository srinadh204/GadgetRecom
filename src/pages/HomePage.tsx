import { useEffect, useState } from 'react';
import { Link } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { GadgetCard } from '@/components/GadgetCard';
import { CategoryIcon } from '@/lib/icons';
import { ArrowRight, Sparkles, TrendingUp, Award, Zap } from 'lucide-react';
import type { Category, Gadget } from '@/types';

export function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [catRes, gadRes] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('gadgets').select('*').eq('featured', true).order('rating', { ascending: false }),
      ]);
      setCategories(catRes.data ?? []);
      setFeatured(gadRes.data ?? []);
      setLoading(false);
    })();
  }, []);

  const stats = [
    { icon: Sparkles, label: 'Gadgets Reviewed', value: '28+' },
    { icon: TrendingUp, label: 'Categories', value: '7' },
    { icon: Award, label: 'Avg Rating', value: '4.6' },
    { icon: Zap, label: 'Recommendations', value: '1,200+' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-sky-500 blur-3xl" />
          <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-blue-600 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1.5 text-sm font-medium text-sky-300">
              <Sparkles className="h-4 w-4" />
              Smart Gadget Recommendations
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find the perfect gadget
              <span className="block bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
                for your lifestyle
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
              Compare specs, read expert reviews, and get personalized recommendations.
              We help you cut through the noise and find technology that truly fits.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/quiz"
                className="group inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition-all hover:bg-sky-500 hover:shadow-sky-500/50"
              >
                <Sparkles className="h-5 w-5" />
                Take the Quiz
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-white/5 px-6 py-3.5 text-base font-semibold text-white backdrop-blur transition-all hover:bg-white/10"
              >
                Browse Gadgets
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur"
              >
                <stat.icon className="mx-auto h-6 w-6 text-sky-400" />
                <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Browse by Category</h2>
            <p className="mt-2 text-slate-500">Explore our curated gadget collections</p>
          </div>
          <Link to="/browse" className="hidden items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700 sm:flex">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/browse/${cat.slug}`}
              className="group flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center transition-all hover:border-sky-300 hover:shadow-lg hover:shadow-sky-100/50"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-600 group-hover:text-white">
                <CategoryIcon name={cat.icon} className="h-7 w-7" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Gadgets */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Featured Gadgets</h2>
              <p className="mt-2 text-slate-500">Top-rated picks our experts love right now</p>
            </div>
            <Link to="/browse" className="hidden items-center gap-1 text-sm font-medium text-sky-600 hover:text-sky-700 sm:flex">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="shimmer h-80 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((gadget) => (
                <GadgetCard key={gadget.id} gadget={gadget} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 to-blue-800 px-8 py-14 text-center sm:px-16">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Not sure where to start?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-sky-100">
              Take our 60-second quiz and get personalized gadget recommendations based on your needs and budget.
            </p>
            <Link
              to="/quiz"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-sky-700 shadow-lg transition-all hover:bg-sky-50"
            >
              <Sparkles className="h-5 w-5" />
              Start the Quiz
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
