import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProductCard from './components/ProductCard'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Home() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('newest')
  const [categories, setCategories] = useState([])

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('category', category)
    if (sort) params.set('sort', sort)
    const res = await fetch(`${API}/products?${params.toString()}`)
    const data = await res.json()
    setProducts(data.items || [])
    setCategories(data.categories || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [query, category, sort])

  const addToCart = async (p) => {
    const token = localStorage.getItem('token')
    if (!token) return alert('Please login first from Account page')
    await fetch(`${API}/me/cart`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ product_id: p.id, quantity: 1 }) })
    alert('Added to cart')
  }

  const toggleWishlist = async (p) => {
    const token = localStorage.getItem('token')
    if (!token) return alert('Please login first from Account page')
    await fetch(`${API}/me/wishlist`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ product_id: p.id }) })
    alert('Updated wishlist')
  }

  return (
    <div>
      <Navbar onSearch={setQuery} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-4 overflow-x-auto">
          <button onClick={() => setCategory('')} className={`px-3 py-1.5 rounded-full border ${category===''?'bg-black text-white':''}`}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full border ${category===c?'bg-black text-white':''}`}>{c}</button>
          ))}
          <select className="ml-auto border rounded-md px-2 py-1" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Rating: High to Low</option>
            <option value="rating_asc">Rating: Low to High</option>
          </select>
        </div>

        {loading ? (
          <div className="grid place-items-center py-20 text-gray-500">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={addToCart} onToggleWishlist={toggleWishlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Account() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name:'', email:'', password:'' })
  const [me, setMe] = useState(null)
  const token = localStorage.getItem('token')

  const fetchMe = async () => {
    if (!token) return setMe(null)
    const res = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` }})
    if (res.ok) setMe(await res.json())
  }
  useEffect(() => { fetchMe() }, [])

  const submit = async (e) => {
    e.preventDefault()
    const url = mode==='login'? '/auth/login':'/auth/register'
    const body = mode==='login'? { email: form.email, password: form.password }: { name: form.name, email: form.email, password: form.password }
    const res = await fetch(`${API}${url}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) })
    if (res.ok) {
      const data = await res.json()
      localStorage.setItem('token', data.access_token)
      await fetchMe()
      alert('Authenticated')
    } else {
      alert('Failed')
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-md mx-auto p-6">
        {me ? (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Signed in as</div>
            <div className="font-medium">{me.name}</div>
            <div className="text-sm">{me.email}</div>
            <button onClick={()=>{localStorage.removeItem('token'); window.location.reload()}} className="mt-4 px-3 py-2 rounded-md border">Sign out</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="flex gap-2 text-sm">
              <button type="button" onClick={()=>setMode('login')} className={`px-3 py-1.5 rounded-md border ${mode==='login'?'bg-black text-white':''}`}>Login</button>
              <button type="button" onClick={()=>setMode('register')} className={`px-3 py-1.5 rounded-md border ${mode==='register'?'bg-black text-white':''}`}>Register</button>
            </div>
            {mode==='register' && (
              <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Name" className="w-full border rounded-md px-3 py-2" />
            )}
            <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} placeholder="Email" type="email" className="w-full border rounded-md px-3 py-2" />
            <input value={form.password} onChange={e=>setForm({...form, password:e.target.value})} placeholder="Password" type="password" className="w-full border rounded-md px-3 py-2" />
            <button className="w-full px-3 py-2 rounded-md bg-blue-600 text-white">{mode==='login'? 'Login':'Create account'}</button>
          </form>
        )}
      </div>
    </div>
  )
}

function Cart() {
  const [items, setItems] = useState([])
  const token = localStorage.getItem('token')
  const load = async () => {
    if (!token) return
    const res = await fetch(`${API}/me/cart`, { headers: { Authorization: `Bearer ${token}` }})
    const data = await res.json()
    setItems(data)
  }
  useEffect(()=>{ load() },[])

  const checkout = async () => {
    const res = await fetch(`${API}/orders/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({}) })
    if (res.ok) {
      const data = await res.json()
      alert(`Order placed. Total: $${data.total}`)
      await load()
    }
  }

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
        {items.length===0 ? (
          <div className="text-gray-500">No items in cart.</div>
        ) : (
          <div className="space-y-3">
            {items.map((it, idx) => (
              <div key={idx} className="p-3 border rounded-md flex items-center justify-between">
                <div className="text-sm">{it.product_id}</div>
                <div className="text-sm">Qty: {it.quantity}</div>
                <div className="text-sm">${it.price_at_add?.toFixed(2)}</div>
              </div>
            ))}
            <button onClick={checkout} className="px-3 py-2 rounded-md bg-green-600 text-white">Checkout</button>
          </div>
        )}
      </div>
    </div>
  )
}

function Wishlist() {
  const [items, setItems] = useState([])
  const token = localStorage.getItem('token')
  const load = async () => {
    if (!token) return
    const res = await fetch(`${API}/me/wishlist`, { headers: { Authorization: `Bearer ${token}` }})
    const data = await res.json()
    setItems(data)
  }
  useEffect(()=>{ load() },[])

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Wishlist</h2>
        {items.length===0 ? (
          <div className="text-gray-500">No items.</div>
        ) : (
          <div className="space-y-3">
            {items.map((it, idx) => (
              <div key={idx} className="p-3 border rounded-md">{it.product_id}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ProductDetail() {
  const [data, setData] = useState(null)
  const id = location.pathname.split('/').pop()
  useEffect(()=>{
    (async()=>{
      const res = await fetch(`${API}/products/${id}`)
      const d = await res.json()
      setData(d)
    })()
  },[id])
  if (!data) return (
    <div>
      <Navbar />
      <div className="grid place-items-center py-20 text-gray-500">Loading...</div>
    </div>
  )
  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
        <div className="aspect-square bg-gray-50 rounded-md overflow-hidden">
          {data.images?.[0] && <img src={data.images[0]} alt={data.title} className="w-full h-full object-cover" />}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{data.title}</h1>
          <div className="text-gray-500 mt-2">{data.description}</div>
          <div className="text-2xl font-semibold mt-4">${data.price?.toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/account" element={<Account />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/product/:id" element={<ProductDetail />} />
    </Routes>
  )
}
