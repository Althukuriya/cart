import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Minus, Plus, Truck, RotateCcw, ShieldCheck, ChevronRight, Star } from 'lucide-react';
import { productsApi } from '../lib/api';
import type { Product, ProductReview } from '../types';
import { formatPrice, getDiscountPercent, PEXEL_IMAGES } from '../lib/utils';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useRecentlyViewed } from '../contexts/RecentlyViewedContext';
import StarRating from '../components/common/StarRating';
import ProductCard from '../components/common/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews] = useState<ProductReview[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, title: '', body: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const { addToCart } = useCart();
  const { toggle, isInWishlist } = useWishlist();
  const { addProduct } = useRecentlyViewed();

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;
      setLoading(true);
      try {
        const allProducts = await productsApi.getAll();
        const foundProduct = Array.isArray(allProducts)
          ? allProducts.find(p => p.slug === slug || p.id === slug)
          : null;

        if (foundProduct) {
          setProduct(foundProduct);
          addProduct(foundProduct);
          // Get related products from same category
          if (foundProduct.category) {
            const relatedData = await productsApi.getByCategory(foundProduct.category);
            setRelatedProducts(
              Array.isArray(relatedData)
                ? relatedData.filter(p => p.id !== foundProduct.id).slice(0, 4)
                : []
            );
          }
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-16 text-center"><p className="text-gray-500 text-lg">Product not found</p><Link to="/collection" className="text-emerald-600 font-medium mt-4 inline-block">Browse all products</Link></div>;

  const images = product.images?.length > 0 ? product.images : [PEXEL_IMAGES.placeholder];
  const discount = getDiscountPercent(product.price, product.comparePrice);
  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    setReviewForm({ name: '', rating: 5, title: '', body: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-emerald-600">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/collection" className="hover:text-emerald-600">Shop</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-50">
            <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-emerald-600' : 'border-gray-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          {discount > 0 && <span className="inline-block bg-rose-50 text-rose-600 text-xs font-bold px-2 py-1 rounded-full">{discount}% OFF</span>}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>

          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={avgRating} showValue={false} />
              <span className="text-sm text-gray-500">{avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {product.sku && <p className="text-sm text-gray-400">SKU: {product.sku}</p>}

          <div className="flex items-center gap-3">
            {product.stock > 0 ? (
              <>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-gray-500 hover:text-gray-700"><Minus className="h-4 w-4" /></button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-900 min-w-[40px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-2 text-gray-500 hover:text-gray-700"><Plus className="h-4 w-4" /></button>
                </div>
                <span className="text-sm text-emerald-600 font-medium">{product.stock} in stock</span>
              </>
            ) : (
              <span className="text-sm text-rose-600 font-medium">Out of stock</span>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleAddToCart} disabled={product.stock <= 0} className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all ${product.stock <= 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98]'}`}>
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </button>
            <button onClick={() => toggle(product)} className={`p-3 border rounded-lg transition-colors ${inWishlist ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-gray-200 text-gray-500 hover:text-rose-500 hover:border-rose-200'}`}>
              <Heart className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            {[
              { icon: Truck, label: 'Free Delivery' },
              { icon: RotateCcw, label: 'Easy Returns' },
              { icon: ShieldCheck, label: 'COD Available' },
            ].map((item, i) => (
              <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                <item.icon className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="p-4 border border-gray-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size={14} showValue={false} />
                      {review.title && <span className="font-medium text-gray-900 text-sm">{review.title}</span>}
                    </div>
                    <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">{review.body}</p>
                  <p className="text-xs text-gray-400 mt-2">by {review.reviewerName}</p>
                </div>
              ))
            )}
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
            {reviewSubmitted ? (
              <div className="text-center py-4">
                <p className="text-emerald-600 font-medium">Thank you for your review!</p>
                <button onClick={() => setReviewSubmitted(false)} className="mt-2 text-sm text-gray-500 hover:text-gray-700">Write another</button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <input required value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })} placeholder="Your name" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: i })} className="p-0.5">
                      <Star className={`h-5 w-5 ${i <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
                <input value={reviewForm.title} onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })} placeholder="Review title" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <textarea required value={reviewForm.body} onChange={e => setReviewForm({ ...reviewForm, body: e.target.value })} placeholder="Your review" rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                <button type="submit" className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">Submit Review</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
