import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/products/')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      const data = await response.json()
      // Handle pagination (DRF returns { count, next, previous, results })
      if (data.results) {
        setProducts(data.results)
      } else {
        setProducts(data)
      }
    } catch (err) {
      console.error(err)
      setError('حدث خطأ في تحميل المنتجات')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    // Note: Category filter is temporarily disabled as backend Product model doesn't have category field yet
    // if (categoryFilter !== 'all' && product.category !== categoryFilter) return false

    if (priceFilter !== 'all') {
      const [min, max] = priceFilter.split('-').map(Number)
      if (parseFloat(product.price) < min || parseFloat(product.price) > max) return false
    }
    return true
  })

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>جاري التحميل...</div>

  return (
    <>
      <Header />
      <div style={{ marginTop: '100px', padding: '40px 0', minHeight: 'calc(100vh - 200px)' }}>
        <div className="container">
          <h2 className="section-title">جميع المنتجات</h2>

          {error && <div className="error-msg" style={{ display: 'block', textAlign: 'center' }}>{error}</div>}

          <div style={{ marginBottom: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <select
              id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', opacity: 0.6, cursor: 'not-allowed' }}
              disabled
              title="فلترة التصنيف غير متاحة حالياً"
            >
              <option value="all">جميع التصنيفات</option>
              <option value="dates">تمور</option>
              <option value="fruits">فواكه</option>
              <option value="vegetables">خضروات</option>
              <option value="dairy">ألبان</option>
            </select>

            <select
              id="priceFilter"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            >
              <option value="all">جميع الأسعار</option>
              <option value="0-20">أقل من 20 ريال</option>
              <option value="20-40">20 - 40 ريال</option>
              <option value="40-60">40 - 60 ريال</option>
              <option value="60-100">أكثر من 60 ريال</option>
            </select>
          </div>

          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>لا توجد منتجات تطابق معايير البحث</p>
            ) : (
              filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default ProductsPage
