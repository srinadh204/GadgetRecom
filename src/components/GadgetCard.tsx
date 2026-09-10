import { Link } from '@/lib/router';
import { StarRating } from './StarRating';
import { Check, Plus } from 'lucide-react';
import type { Gadget } from '@/types';

interface GadgetCardProps {
  gadget: Gadget;
  categoryName?: string;
  inCompare?: boolean;
  onToggleCompare?: (gadget: Gadget) => void;
  compareDisabled?: boolean;
}

export function GadgetCard({ gadget, categoryName, inCompare, onToggleCompare, compareDisabled }: GadgetCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-100/50">
      <Link to={`/gadgets/${gadget.slug}`} className="block overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {gadget.image_url ? (
            <img
              src={gadget.image_url}
              alt={gadget.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
              No image
            </div>
          )}
          {gadget.featured && (
            <span className="absolute left-3 top-3 rounded-full bg-sky-600 px-2.5 py-1 text-xs font-semibold text-white shadow-md">
              Featured
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-sky-600">{gadget.brand}</span>
          {categoryName && (
            <span className="text-xs text-slate-400">{categoryName}</span>
          )}
        </div>

        <Link to={`/gadgets/${gadget.slug}`}>
          <h3 className="mb-1 text-base font-semibold leading-snug text-slate-900 transition-colors group-hover:text-sky-700">
            {gadget.name}
          </h3>
        </Link>

        <p className="mb-3 line-clamp-2 text-sm text-slate-500">{gadget.tagline}</p>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <StarRating rating={gadget.rating} size="sm" showNumber reviewCount={gadget.review_count} />
          </div>
          <span className="text-lg font-bold text-slate-900">
            ${Number(gadget.price).toLocaleString()}
          </span>
        </div>

        {onToggleCompare && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleCompare(gadget);
            }}
            disabled={!inCompare && compareDisabled}
            className={`mt-3 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              inCompare
                ? 'bg-sky-600 text-white hover:bg-sky-700'
                : compareDisabled
                ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                : 'border border-slate-200 text-slate-600 hover:border-sky-400 hover:text-sky-600'
            }`}
          >
            {inCompare ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {inCompare ? 'In Compare' : 'Compare'}
          </button>
        )}
      </div>
    </div>
  );
}
