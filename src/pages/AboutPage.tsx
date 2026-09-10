import { Link } from '@/lib/router';
import { Target, Eye, Heart, TrendingUp, Shield, Zap, Users, Award, ArrowRight } from 'lucide-react';

export function AboutPage() {
  const values = [
    { icon: Shield, title: 'Unbiased Reviews', desc: 'We never accept payment for positive coverage. Our recommendations are based on real specs and user feedback.' },
    { icon: Zap, title: 'Smart Matching', desc: 'Our quiz engine analyzes your needs and budget to surface gadgets that truly fit your lifestyle.' },
    { icon: TrendingUp, title: 'Always Current', desc: 'We constantly update our catalog with the latest gadgets and refresh specs as they evolve.' },
    { icon: Heart, title: 'User First', desc: 'Every feature — from comparison to reviews — is designed around making your decision easier.' },
  ];

  const stats = [
    { icon: Users, label: 'Happy Users', value: '50K+' },
    { icon: Award, label: 'Gadgets Reviewed', value: '28+' },
    { icon: TrendingUp, label: 'Categories', value: '7' },
    { icon: Zap, label: 'Recommendations Made', value: '1,200+' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 py-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-20 top-20 h-96 w-96 rounded-full bg-sky-500 blur-3xl" />
          <div className="absolute right-0 -top-10 h-72 w-72 rounded-full bg-blue-600 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            About GearGenius
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
            We are on a mission to cut through the noise of the gadget world. With hundreds of new
            devices launching every year, finding the right one can feel overwhelming. That is where
            we come in — combining expert analysis with smart technology to match you with the
            perfect gear.
          </p>
        </div>
      </section>

      {/* Mission / Vision / Values */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
              <Target className="h-6 w-6 text-sky-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Our Mission</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              To empower every consumer with the knowledge and tools to make confident gadget
              purchases — no marketing fluff, no biased reviews, just honest analysis.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Our Vision</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              A world where finding the right technology is effortless and intuitive — where
              everyone can discover gadgets that genuinely enhance their daily lives.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50">
              <Heart className="h-6 w-6 text-sky-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Our Promise</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              Every recommendation is backed by real specifications, user reviews, and thorough
              analysis. We work for you, not the brands.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <stat.icon className="mx-auto h-8 w-8 text-sky-600" />
                <p className="mt-3 text-3xl font-extrabold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900">What We Stand For</h2>
          <p className="mt-2 text-slate-500">The principles that guide every recommendation we make.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {values.map((val) => (
            <div key={val.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-50">
                <val.icon className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{val.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{val.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 to-blue-800 px-8 py-14 text-center sm:px-16">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to find your next gadget?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-sky-100">
              Take our quiz for personalized recommendations, or browse our full catalog to explore.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/quiz"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-sky-700 shadow-lg transition-all hover:bg-sky-50"
              >
                Take the Quiz <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-400/50 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition-all hover:bg-white/20"
              >
                Browse Gadgets
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
