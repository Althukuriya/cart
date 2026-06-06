import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { productsApi, categoriesApi } from '../lib/api';
import type { Product, Category } from '../types';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categoryFilter = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const priceRange = searchParams.get('price') || '';

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let productsData: Product[] = [];

        if (searchQuery) {
          productsData = await productsApi.search(searchQuery);
        } else if (categoryFilter) {
          productsData = await productsApi.getByCategory(categoryFilter);
        } else {
          productsData = await productsApi.getAll();
        }

        const catsData = await categoriesApi.getAll();
        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(catsData) ? catsData : []);
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [searchQuery, categoryFilter]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      result = result.filter(p => p.price >= min && (max ? p.price <= max : true));
    }

    switch (sortBy) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.name.localeCompare(b.name)); break;
    }

    return result;
  }, [products, sortBy, priceRange]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) { params.set(key, value); } else { params.delete(key); }
    setSearchParams(params);
  };


  const priceRanges = [
    { label: 'Under 500', value: '0-500' },
    { label: '500 - 1000', value: '500-1000' },
    { label: '1000 - 2000', value: '1000-2000' },
    { label: '2000 - 5000', value: '2000-5000' },
    { label: 'Above 5000', value: '5000-999999' },
  ];

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Categories</h3>
        <div className="space-y-1">
          <button onClick={() => updateFilter('category', '')} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categoryFilter ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>All Categories</button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => updateFilter('category', cat.slug || cat.id)} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryFilter === (cat.slug || cat.id) ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>{cat.name}</button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Price Range</h3>
        <div className="space-y-1">
          <button onClick={() => updateFilter('price', '')} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!priceRange ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>All Prices</button>
          {priceRanges.map(r => (
            <button key={r.value} onClick={() => updateFilter('price', r.value)} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${priceRange === r.value ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>{r.label}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {searchQuery ? `Search: "${searchQuery}"` : categoryFilter ? `${categoryFilter}` : 'All Products'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="flex items-center justify-between mb-6 gap-4">
        <button onClick={() => setMobileFiltersOpen(true)} className="md:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
        <div className="relative ml-auto">
          <select value={sortBy} onChange={e => updateFilter('sort', e.target.value)} className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex gap-8">
        <aside className="hidden md:block w-56 shrink-0">
          <FilterContent />
        </aside>

        <div className="flex-1">
          {loading ? (
            <LoadingSpinner />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-900">Filters</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-2 text-gray-500"><X className="h-5 w-5" /></button>
            </div>
            <FilterContent />
          </div>
        </div>
      )}
    </div>
  );
}
