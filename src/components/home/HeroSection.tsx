import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RotateCcw, Headphones, ChevronDown } from 'lucide-react';
import type { Product } from '../../types';
import ProductCard from '../common/ProductCard';
import { useSettings } from '../../contexts/SettingsContext';
import { useState } from 'react';

export function HeroSection() {
  const { settings } = useSettings();

  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            {settings.heroBadge && (
              <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full">
                {settings.heroBadge}
              </span>
            )}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {settings.heroTitle?.split(' ').slice(0, -1).join(' ')}<br />
              <span className="text-emerald-600">{settings.heroTitle?.split(' ').slice(-1)}</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed">{settings.heroSubtitle}</p>
            <div className="flex gap-3">
              <Link to="/collection" className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/collection" className="inline-flex items-center gap-2 border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:border-emerald-600 hover:text-emerald-600 transition-colors">
                Browse All
              </Link>
            </div>
          </div>
          <div className="hidden md:block relative rounded-2xl overflow-hidden aspect-square">
            <img src={settings.heroImage} alt="Shop" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
      </div>

      {settings.announcements && (
        <div className="bg-emerald-600 text-white text-center py-2.5 text-sm font-medium">
          {settings.announcements}
        </div>
      )}

      <div className="border-t border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Delivery', desc: 'On all orders' },
              { icon: Shield, title: 'COD Payment', desc: 'Pay on delivery' },
              { icon: RotateCcw, title: 'Easy Returns', desc: settings.returnPolicy || '7-day returns' },
              { icon: Headphones, title: '24/7 Support', desc: 'Always here' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-lg">
                  <item.icon className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategorySection({ categories, loading }: { categories: any[]; loading: boolean }) {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
        <Link to="/collection" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View All</Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? null : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.slice(0, 5).map((cat: any) => (
            <Link key={cat.id} to={`/collection?category=${cat.slug || cat.id}`} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <h3 className="absolute bottom-0 left-0 right-0 p-4 text-white font-semibold text-sm md:text-base">{cat.name}</h3>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export function FeaturedProducts({ products, loading, title }: { products: Product[]; loading: boolean; title: string }) {
  if (loading || !products.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Link to="/collection" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">View All</Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.slice(0, 8).map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export function ShippingInfo() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Why Shop With Us</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: Truck, title: 'Free Shipping', desc: 'Free delivery on all orders within India. No minimum order required.' },
          { icon: RotateCcw, title: 'Easy Returns', desc: '7-day hassle-free returns. If you are not satisfied, simply return.' },
          { icon: Shield, title: 'Cash on Delivery', desc: 'Pay when you receive your order. No online payment required.' },
        ].map(item => (
          <div key={item.title} className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="inline-flex p-3 bg-emerald-100 rounded-xl mb-4">
              <item.icon className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const FAQ_ITEMS = [
  { q: 'How do I place an order?', a: 'Browse products, add to cart, fill in your delivery details, and place your order with Cash on Delivery. No online payment needed.' },
  { q: 'What is Cash on Delivery (COD)?', a: 'COD means you pay when your order is delivered to your doorstep. You can pay in cash or via UPI at the time of delivery.' },
  { q: 'How long will delivery take?', a: 'Orders are typically delivered within 5-7 business days across India.' },
  { q: 'What is the return policy?', a: 'We offer a 7-day easy return policy. Products must be in original condition with tags intact.' },
  { q: 'How can I track my order?', a: 'Use the Track Order page with your Order ID to check your order status in real time.' },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
      <div className="space-y-2">
        {FAQ_ITEMS.map((item, i) => (
          <div key={i} className="border border-gray-100 rounded-lg">
            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
              <span className="font-medium text-gray-900 text-sm">{item.q}</span>
              <ChevronDown className={`h-4 w-4 text-gray-500 shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 text-sm text-gray-500 leading-relaxed animate-fade-in">{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function CollectionBanner() {
  const { settings } = useSettings();

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <Link to="/collection" className="relative rounded-2xl overflow-hidden h-64 md:h-80 flex items-center block group">
        <img src={settings.collectionBannerImage} alt={settings.collectionBannerTitle} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-emerald-900/40" />
        <div className="relative px-8 md:px-16 text-white max-w-md">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">{settings.collectionBannerTitle}</h2>
          <p className="text-emerald-100 mb-6">{settings.collectionBannerSubtitle}</p>
          <span className="inline-flex items-center gap-2 bg-white text-emerald-700 px-5 py-2.5 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
            {settings.collectionBannerCta} <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </section>
  );
}
