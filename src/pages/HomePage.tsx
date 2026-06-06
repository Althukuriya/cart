import { useState, useEffect } from 'react';
import { productsApi, categoriesApi } from '../lib/api';
import type { Product, Category } from '../types';
import { HeroSection, CategorySection, FeaturedProducts, CollectionBanner, ShippingInfo, FAQSection } from '../components/home/HeroSection';
import { useRecentlyViewed } from '../contexts/RecentlyViewedContext';
import ProductCard from '../components/common/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { products: recentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productsApi.getAll(),
          categoriesApi.getAll(),
        ]);
        setProducts(Array.isArray(productsRes) ? productsRes : []);
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const featuredProducts = products.filter(p => p.featured);
  const newProducts = products.slice(0, 8);

  return (
    <div>
      <HeroSection />
      <CategorySection categories={categories} loading={loading} />
      <FeaturedProducts products={featuredProducts} loading={loading} title="Featured Products" />
      <CollectionBanner />
      <FeaturedProducts products={newProducts} loading={loading} title="New Arrivals" />
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Recently Viewed</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {recentlyViewed.slice(0, 4).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
      <ShippingInfo />
      <FAQSection />
    </div>
  );
}
