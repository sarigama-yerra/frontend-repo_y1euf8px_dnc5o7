import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ProductCard({ product, onAddToCart, onToggleWishlist }) {
  return (
    <div className="group border rounded-lg p-3 bg-white hover:shadow-md transition">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden rounded-md bg-gray-50">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
          ) : (
            <div className="w-full h-full grid place-items-center text-sm text-gray-400">No image</div>
          )}
        </div>
        <div className="mt-3">
          <h3 className="font-medium line-clamp-1">{product.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-semibold">${product.price?.toFixed(2)}</span>
            <span className="text-xs text-gray-500">{product.category}</span>
          </div>
        </div>
      </Link>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => onAddToCart?.(product)} className="px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700">
          Add to cart
        </button>
        <button onClick={() => onToggleWishlist?.(product)} className="px-2 py-1.5 rounded-md border hover:bg-gray-50">
          <Heart size={16} />
        </button>
      </div>
    </div>
  )
}
