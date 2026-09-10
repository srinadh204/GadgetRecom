import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { GadgetCard } from '@/components/GadgetCard';
import { CategoryIcon } from '@/lib/icons';
import { useCompare } from '@/lib/compare';
import { useRouter } from '@/lib/router';
import { Search, SlidersHorizontal, X, Check } from 'lucide-react';
import type { Category, Gadget } from '@/types';

type SortKey = 'rating' | 'price-low' | 'price-high' | 'name';

export function BrowsePage() {
  const { params, navigate } = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [gadgets, setGadgets] = useState<Gadget[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('rating');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 4000]);
  const [showFilters, setShowFilters] = useState(false);

  const activeCategory = params.category || '';

  const { toggleCompare, isInCompare, isFull } = useCompare();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const catRes = await supabase.from('categories').select('*').order('name');
      setCategories(catRes.data ?? []);

      let query = supabase.from('gadgets').select('*');
      if (activeCategory) {
        const cat = catRes.data?.find((c) => c.slug === activeCategory);
        if (cat) query = query.eq('category_id', cat.id);
      }
      const gadRes = await query.order('rating', { ascending: false });
      setGadgets(gadRes.data ?? []);
      setLoading(false);
    })();
  }, [activeCategory]);

  const allBrands = useMemo(() => {
    const brands = new Set(gadgets.map((g) => g.brand));
    return Array.from(brands).sort();
  }, [gadgets]);

  const filtered = useMemo(() => {
    let result = gadgets;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.brand.toLowerCase().includes(q) ||
          g.tagline.toLowerCase().includes(q) ||
          g.best_for?.some((b) => b.toLowerCase().includes(q))
      );
    }

    if (selectedBrands.length > 0) {
      result = result.filter((g) => selectedBrands.includes(g.brand));
    }

    result = result.filter((g) => Number(g.price) >= priceRange[0] && Number(g.price) <= priceRange[1]);

    switch (sort) {
      case 'price-low':
        result = [...result].sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-high':
        result = [...result].sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result = [...result].sort((a, b) => Number(b.rating) - Number(a.rating));
    }

    return result;
  }, [gadgets, search, selectedBrands, priceRange, sort]);

  const activeCategoryName = categories.find((c) => c.slug === activeCategory);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange([0, 4000]);
    setSearch('');
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Categories</h3>
        <div className="space-y-1">
          <button
            onClick={() => navigate('/browse')}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              !activeCategory ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/browse/${cat.slug}`)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat.slug ? 'bg-sky-50 text-sky-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CategoryIcon name={cat.icon} className="h-4 w-4" />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Brand</h3>
        <div className="space-y-1.5">
          {allBrands.map((brand) => (
            <label
              key={brand}
              className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              <button
                onClick={() => toggleBrand(brand)}
                className={`flex h-4 w-4 items-center justify-center rounded border transition-colors ${
                  selectedBrands.includes(brand)
                    ? 'border-sky-600 bg-sky-600 text-white'
                    : 'border-slate-300'
                }`}
              >
                {selectedBrands.includes(brand) && <Check className="h-3 w-3" />}
              </button>
              {brand}
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Price Range</h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-sky-400 focus:outline-none"
            placeholder="Min"
          />
          <span className="text-slate-400">-</span>
          <input
            type="number"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-sky-400 focus:outline-none"
            placeholder="Max"
          />
        </div>
      </div>

      {(selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 4000) && (
        <button
          onClick={clearFilters}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <X className="h-4 w-4" /> Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          {activeCategoryName ? activeCategoryName.name : 'Browse Gadgets'}
        </h1>
        <p className="mt-2 text-slate-500">
          {activeCategoryName
            ? activeCategoryName.description
            : 'Discover and compare the best smart gadgets across all categories.'}
        </p>
      </div>

      {/* Search & Sort bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gadgets, brands, use cases..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 focus:border-sky-400 focus:outline-none"
          >
            <option value="rating">Top Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5">
            <FilterContent />
          </div>
        </aside>

        {/* Mobile filter drawer */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setShowFilters(false)}>
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <div
              className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-5 shadow-xl animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="rounded-lg p-1 hover:bg-slate-100">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>
              <FilterContent />
            </div>
          </div>
        )}

        {/* Main grid */}
        <div className="flex-1">
          <p className="mb-4 text-sm text-slate-500">
            {loading ? 'Loading...' : `${filtered.length} gadget${filtered.length !== 1 ? 's' : ''} found`}
          </p>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="shimmer h-80 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-20 text-center">
              <Search className="h-10 w-10 text-slate-300" />
              <p className="mt-4 text-lg font-medium text-slate-600">No gadgets found</p>
              <p className="mt-1 text-sm text-slate-400">Try adjusting your filters or search terms</p>
              <button
                onClick={clearFilters}
                className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((gadget) => (
                <GadgetCard
                  key={gadget.id}
                  gadget={gadget}
                  categoryName={categories.find((c) => c.id === gadget.category_id)?.name}
                  inCompare={isInCompare(gadget.id)}
                  onToggleCompare={toggleCompare}
                  compareDisabled={isFull && !isInCompare(gadget.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
