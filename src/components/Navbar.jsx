import { ShoppingCart, Heart, User, Menu, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Navbar({ onSearch }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <button className="p-2 rounded-md md:hidden hover:bg-gray-100">
          <Menu size={20} />
        </button>
        <Link to="/" className="font-semibold text-lg">ShopLite</Link>

        <div className="hidden md:flex items-center gap-2 ml-4 flex-1 max-w-xl">
          <div className="relative w-full">
            <input
              onChange={(e) => onSearch?.(e.target.value)}
              placeholder="Search products..."
              className="w-full border rounded-md px-3 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <nav className="ml-auto flex items-center gap-2">
          <Link to="/wishlist" className="p-2 rounded-md hover:bg-gray-100"><Heart size={20} /></Link>
          <Link to="/cart" className="p-2 rounded-md hover:bg-gray-100"><ShoppingCart size={20} /></Link>
          <Link to="/account" className="p-2 rounded-md hover:bg-gray-100"><User size={20} /></Link>
        </nav>
      </div>
    </header>
  )
}
