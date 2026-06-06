import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Search, Menu, X, Package } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

export default function Header() {
  const { totalItems, isStickyVisible } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collection?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <Package className="h-7 w-7 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">ShopCraft</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Home</Link>
              <Link to="/collection" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Shop</Link>
              <Link to="/track-order" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Track</Link>
            </nav>

            <div className="flex items-center gap-3">
              <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-gray-600 hover:text-emerald-600">
                <Search className="h-5 w-5" />
              </button>
              <Link to="/wishlist" className="p-2 text-gray-600 hover:text-emerald-600 relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{wishlistCount}</span>}
              </Link>
              <Link to="/cart" className="p-2 text-gray-600 hover:text-emerald-600 relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">{totalItems}</span>}
              </Link>
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-gray-600">
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {searchOpen && (
            <div className="border-t border-gray-100 bg-white px-4 py-3">
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Search</button>
              </form>
            </div>
          )}
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-72 bg-white shadow-xl p-6">
            <div className="flex items-center justify-between mb-8">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                <Package className="h-6 w-6 text-emerald-600" />
                <span className="text-lg font-bold text-gray-900">ShopCraft</span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium">Home</Link>
              <Link to="/collection" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium">Shop</Link>
              <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium">Wishlist</Link>
              <Link to="/track-order" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium">Track</Link>
              <Link to="/cart" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2.5 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg font-medium">Cart ({totalItems})</Link>
            </nav>
          </div>
        </div>
      )}

      {isStickyVisible && totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-emerald-600 text-white p-3 md:hidden animate-slide-up">
          <Link to="/cart" className="flex items-center justify-between">
            <span className="font-medium">{totalItems} item{totalItems > 1 ? 's' : ''} in cart</span>
            <ShoppingCart className="h-4 w-4" />
          </Link>
        </div>
      )}
    </>
  );
}
