import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Link } from '@/lib/router';
import { GadgetCard } from '@/components/GadgetCard';
import { useCompare } from '@/lib/compare';
import { Sparkles, ArrowRight, ArrowLeft, RotateCcw, Check } from 'lucide-react';
import type { Gadget } from '@/types';

interface QuizOption {
  label: string;
  value: string;
  emoji: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  subtitle: string;
  options: QuizOption[];
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'category',
    question: 'What type of gadget are you looking for?',
    subtitle: 'Pick the category that interests you most.',
    options: [
      { label: 'Smartwatch', value: 'smartwatches', emoji: '⌚' },
      { label: 'Smartphone', value: 'smartphones', emoji: '📱' },
      { label: 'Wireless Earbuds', value: 'wireless-earbuds', emoji: '🎧' },
      { label: 'Smart Home', value: 'smart-home', emoji: '🏠' },
      { label: 'Laptop', value: 'laptops', emoji: '💻' },
      { label: 'Tablet', value: 'tablets', emoji: '📋' },
      { label: 'Drone', value: 'drones', emoji: '🚁' },
    ],
  },
  {
    id: 'useCase',
    question: 'What is your primary use case?',
    subtitle: 'We will match gadgets optimized for your needs.',
    options: [
      { label: 'Fitness & Health', value: 'Fitness', emoji: '🏃' },
      { label: 'Photography', value: 'Photography', emoji: '📸' },
      { label: 'Productivity', value: 'Productivity', emoji: '💼' },
      { label: 'Gaming', value: 'Gaming', emoji: '🎮' },
      { label: 'Travel', value: 'Travel', emoji: '✈️' },
      { label: 'Creative Work', value: 'Creative Work', emoji: '🎨' },
      { label: 'Everyday Use', value: 'Everyday', emoji: '☕' },
      { label: 'Outdoor Adventure', value: 'Outdoor Adventure', emoji: '🏔️' },
    ],
  },
  {
    id: 'budget',
    question: 'What is your budget range?',
    subtitle: 'Be honest — we will find the best value within your range.',
    options: [
      { label: 'Under $250', value: '0-250', emoji: '💵' },
      { label: '$250 - $500', value: '250-500', emoji: '💴' },
      { label: '$500 - $1,000', value: '500-1000', emoji: '💶' },
      { label: '$1,000 - $2,000', value: '1000-2000', emoji: '💷' },
      { label: 'No limit', value: '0-5000', emoji: '💎' },
    ],
  },
  {
    id: 'priority',
    question: 'What matters most to you?',
    subtitle: 'Choose your top priority when picking a gadget.',
    options: [
      { label: 'Best Performance', value: 'performance', emoji: '⚡' },
      { label: 'Battery Life', value: 'battery', emoji: '🔋' },
      { label: 'Camera Quality', value: 'camera', emoji: '📷' },
      { label: 'Value for Money', value: 'value', emoji: '💰' },
      { label: 'Premium Design', value: 'premium', emoji: '✨' },
    ],
  },
];

export function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toggleCompare, isInCompare, isFull } = useCompare();

  const handleAnswer = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    if (step < quizQuestions.length - 1) {
      setTimeout(() => setStep(step + 1), 200);
    } else {
      runQuiz(newAnswers);
    }
  };

  const runQuiz = async (allAnswers: Record<string, string>) => {
    setLoading(true);
    setShowResults(true);

    let query = supabase.from('gadgets').select('*');

    // Filter by category
    if (allAnswers.category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', allAnswers.category)
        .maybeSingle();
      if (cat) query = query.eq('category_id', cat.id);
    }

    const { data: allGadgets } = await query.order('rating', { ascending: false });
    let candidates = (allGadgets as Gadget[]) ?? [];

    // Filter by budget
    const [min, max] = (allAnswers.budget || '0-5000').split('-').map(Number);
    candidates = candidates.filter((g) => Number(g.price) >= min && Number(g.price) <= max);

    // Score by use case
    if (allAnswers.useCase) {
      candidates = candidates.map((g) => ({
        ...g,
        best_for: g.best_for || [],
      }));
      candidates.sort((a, b) => {
        const aMatch = a.best_for?.some((b) => b.toLowerCase().includes(allAnswers.useCase.toLowerCase())) ? 1 : 0;
        const bMatch = b.best_for?.some((b) => b.toLowerCase().includes(allAnswers.useCase.toLowerCase())) ? 1 : 0;
        return bMatch - aMatch || Number(b.rating) - Number(a.rating);
      });
    }

    // Adjust by priority
    if (allAnswers.priority === 'value') {
      candidates.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (allAnswers.priority === 'premium') {
      candidates.sort((a, b) => Number(b.price) - Number(a.price));
    }

    setResults(candidates.slice(0, 6));
    setLoading(false);
  };

  const restart = () => {
    setStep(0);
    setAnswers({});
    setResults([]);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-lg shadow-sky-200">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Your Recommendations</h1>
          <p className="mt-2 text-slate-500">
            Based on your answers, here are the gadgets we think you will love.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer h-80 rounded-2xl" />
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="mb-6 flex justify-center">
              <button
                onClick={restart}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" /> Retake Quiz
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((gadget, idx) => (
                <div key={gadget.id} className="relative">
                  {idx === 0 && (
                    <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-md">
                      Best Match
                    </span>
                  )}
                  <GadgetCard
                    gadget={gadget}
                    inCompare={isInCompare(gadget.id)}
                    onToggleCompare={toggleCompare}
                    compareDisabled={isFull && !isInCompare(gadget.id)}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center">
            <p className="text-lg font-medium text-slate-600">No gadgets match your criteria</p>
            <p className="mt-1 text-sm text-slate-400">Try widening your budget or choosing a different use case.</p>
            <button
              onClick={restart}
              className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              Retake Quiz
            </button>
          </div>
        )}
      </div>
    );
  }

  const current = quizQuestions[step];
  const progress = ((step + 1) / quizQuestions.length) * 100;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
          <span>Question {step + 1} of {quizQuestions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div key={step} className="animate-fade-in-up">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">{current.question}</h2>
        <p className="mt-2 text-center text-slate-500">{current.subtitle}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {current.options.map((opt) => {
            const selected = answers[current.id] === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleAnswer(current.id, opt.value)}
                className={`group flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all ${
                  selected
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 bg-white hover:border-sky-300 hover:shadow-md'
                }`}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <span className={`flex-1 font-semibold ${selected ? 'text-sky-700' : 'text-slate-700'}`}>
                  {opt.label}
                </span>
                {selected && <Check className="h-5 w-5 text-sky-600" />}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" /> Home
            </Link>
          )}
          {step < quizQuestions.length - 1 && answers[current.id] && (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 text-sm font-medium text-sky-600 hover:text-sky-700"
            >
              Next <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
