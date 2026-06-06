import { Link } from 'react-router-dom';
import { Package, Mail, Phone } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export default function Footer() {
  const { settings } = useSettings();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Package className="h-6 w-6 text-emerald-400" />
              <span className="text-lg font-bold text-white">{settings.storeName}</span>
            </Link>
            <p className="text-sm text-gray-400">{settings.storeTagline}</p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-emerald-400">Home</Link></li>
              <li><Link to="/collection" className="hover:text-emerald-400">Shop</Link></li>
              <li><Link to="/track-order" className="hover:text-emerald-400">Track</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Info</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-emerald-400 cursor-default">Shipping Policy</span></li>
              <li><span className="hover:text-emerald-400 cursor-default">Returns</span></li>
              <li><span className="hover:text-emerald-400 cursor-default">FAQ</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-emerald-400" /> {settings.supportEmail}</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-emerald-400" /> {settings.supportPhone}</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex items-center justify-between text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {settings.storeName}. {settings.footerText}</p>
          <Link to="/admin" className="text-gray-600 hover:text-gray-400 transition-colors text-xs">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
