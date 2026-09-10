import { useEffect, useState } from 'react';
import { Link, useRouter } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { StarRating } from '@/components/StarRating';
import { useCompare } from '@/lib/compare';
import {
  ArrowLeft, Check, Plus, ThumbsUp, ThumbsDown,
  Tag, ShoppingCart, ChevronRight, MessageSquare,
} from 'lucide-react';
import type { Gadget, Category, Review } from '@/types';

export function GadgetDetailPage() {
  const { params } = useRouter();
  const { toggleCompare, isInCompare, isFull } = useCompare();
  const [gadget, setGadget] = useState<Gadget | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [related, setRelated] = useState<Gadget[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ author_name: '', rating: 5, title: '', comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: gad } = await supabase
        .from('gadgets')
        .select('*')
        .eq('slug', params.slug)
        .maybeSingle();

      if (gad) {
        setGadget(gad as Gadget);
        const [catRes, relRes, revRes] = await Promise.all([
          supabase.from('categories').select('*').eq('id', gad.category_id).maybeSingle(),
          supabase.from('gadgets').select('*').eq('category_id', gad.category_id).neq('id', gad.id).limit(4),
          supabase.from('reviews').select('*').eq('gadget_id', gad.id).order('created_at', { ascending: false }),
        ]);
        setCategory(catRes.data as Category | null);
        setRelated((relRes.data as Gadget[]) ?? []);
        setReviews((revRes.data as Review[]) ?? []);
      }
      setLoading(false);
    })();
  }, [params.slug]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gadget) return;
    setSubmitting(true);
    setSubmitMsg(null);
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        gadget_id: gadget.id,
        author_name: reviewForm.author_name || 'Anonymous',
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      })
      .select('*')
      .single();

    if (error) {
      setSubmitMsg({ type: 'error', text: 'Failed to submit review. Please try again.' });
    } else {
      setReviews((prev) => [data as Review, ...prev]);
      setReviewForm({ author_name: '', rating: 5, title: '', comment: '' });
      setSubmitMsg({ type: 'success', text: 'Review submitted successfully!' });
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="shimmer mb-6 h-8 w-48 rounded-lg" />
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="shimmer h-96 rounded-2xl" />
          <div className="space-y-4">
            <div className="shimmer h-8 w-3/4 rounded-lg" />
            <div className="shimmer h-6 w-1/2 rounded-lg" />
            <div className="shimmer h-32 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!gadget) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">Gadget not found</h1>
        <p className="mt-2 text-slate-500">The gadget you're looking for doesn't exist.</p>
        <Link to="/browse" className="mt-4 inline-flex items-center gap-2 text-sky-600 hover:text-sky-700">
          <ArrowLeft className="h-4 w-4" /> Back to Browse
        </Link>
      </div>
    );
  }

  const inCompare = isInCompare(gadget.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/" className="hover:text-sky-600">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/browse" className="hover:text-sky-600">Browse</Link>
        {category && (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to={`/browse/${category.slug}`} className="hover:text-sky-600">{category.name}</Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-slate-900">{gadget.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {gadget.image_url ? (
            <img src={gadget.image_url} alt={gadget.name} className="aspect-[4/3] w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-slate-400">
              No image
            </div>
          )}
          {gadget.featured && (
            <span className="absolute left-4 top-4 rounded-full bg-sky-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
              Featured
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="text-sm font-medium uppercase tracking-wide text-sky-600">{gadget.brand}</span>
            {category && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                {category.name}
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{gadget.name}</h1>
          <p className="mt-2 text-lg text-slate-500">{gadget.tagline}</p>

          <div className="mt-4 flex items-center gap-4">
            <StarRating rating={gadget.rating} size="lg" showNumber reviewCount={gadget.review_count} />
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900">
              ${Number(gadget.price).toLocaleString()}
            </span>
            <span className="text-sm text-slate-400">MSRP</span>
          </div>

          {/* Best For tags */}
          {gadget.best_for && gadget.best_for.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700">
                <Tag className="h-4 w-4" /> Best For
              </p>
              <div className="flex flex-wrap gap-2">
                {gadget.best_for.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => toggleCompare(gadget)}
              disabled={!inCompare && isFull}
              className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all ${
                inCompare
                  ? 'bg-sky-600 text-white hover:bg-sky-700'
                  : isFull
                  ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                  : 'border border-slate-200 text-slate-700 hover:border-sky-400 hover:text-sky-600'
              }`}
            >
              {inCompare ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {inCompare ? 'Added to Compare' : 'Add to Compare'}
            </button>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <ShoppingCart className="h-4 w-4" /> Find Deals
            </a>
          </div>

          {/* Description */}
          <div className="mt-6 border-t border-slate-200 pt-6">
            <p className="leading-relaxed text-slate-600">{gadget.description}</p>
          </div>

          {/* Pros & Cons */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-800">
                <ThumbsUp className="h-4 w-4" /> Pros
              </h3>
              <ul className="space-y-2">
                {gadget.pros?.map((pro, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-emerald-700">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-rose-800">
                <ThumbsDown className="h-4 w-4" /> Cons
              </h3>
              <ul className="space-y-2">
                {gadget.cons?.map((con, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-rose-700">
                    <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-rose-500" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Specs table */}
      <div className="mt-12">
        <h2 className="mb-4 text-2xl font-bold text-slate-900">Specifications</h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full">
            <tbody>
              {Object.entries(gadget.specs || {}).map(([key, value], i) => (
                <tr
                  key={key}
                  className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}
                >
                  <td className="w-1/3 px-5 py-3.5 text-sm font-semibold text-slate-700">{key}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-slate-900">
          <MessageSquare className="h-6 w-6 text-sky-600" />
          Reviews ({reviews.length})
        </h2>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Review form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-4 text-lg font-bold text-slate-900">Write a Review</h3>
              {submitMsg && (
                <div
                  className={`mb-3 rounded-lg px-3 py-2 text-sm ${
                    submitMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {submitMsg.text}
                </div>
              )}
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={reviewForm.author_name}
                  onChange={(e) => setReviewForm({ ...reviewForm, author_name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-600">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: r })}
                        className={`text-2xl transition-transform hover:scale-110 ${
                          r <= reviewForm.rating ? 'text-amber-400' : 'text-slate-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Review title"
                  required
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
                />
                <textarea
                  placeholder="Share your thoughts..."
                  required
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>

          {/* Review list */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-slate-400">
                No reviews yet. Be the first to share your thoughts!
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                        {review.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{review.author_name}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(review.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <h4 className="mt-3 font-semibold text-slate-800">{review.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">Related Gadgets</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((g) => (
              <Link key={g.id} to={`/gadgets/${g.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={g.image_url} alt={g.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-sky-600">{g.brand}</p>
                  <h3 className="text-sm font-semibold text-slate-900">{g.name}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-900">${Number(g.price).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
