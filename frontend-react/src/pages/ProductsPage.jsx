import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'

import API_BASE_URL from '../apiConfig'

function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')


  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/`)
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
    // Search Filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Note: Category filter is temporarily disabled as backend Product model doesn't have category field yet
    // if (categoryFilter !== 'all' && product.category !== categoryFilter) return false

    if (priceFilter !== 'all') {
      const [min, max] = priceFilter.split('-').map(Number)
      if (parseFloat(product.price) < min || parseFloat(product.price) > max) return false
    }

    return true
  }).sort((a, b) => {
    if (sortBy === 'low-high') {
      return parseFloat(a.price) - parseFloat(b.price)
    } else if (sortBy === 'high-low') {
      return parseFloat(b.price) - parseFloat(a.price)
    }
    return 0 // Default (usually creation order if API sends it that way)
  })

  if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>جاري التحميل...</div>

  return (
    <>
      <Header />
      <Header />
      <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
        {/* Modern Hero Section */}
        <div style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #2d5a27 0%, #1a3c17 100%)',
          padding: '140px 0 60px',
          color: 'white',
          textAlign: 'center',
          marginBottom: '50px',
          overflow: 'hidden'
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>
          <div style={{ position: 'absolute', bottom: '-30px', right: '10%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }}></div>

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '15px', fontWeight: 'bold' }}>منتجاتنا الطازجة</h1>
            <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 30px' }}>
              تصفح مجموعتنا المختارة من أجود المحاصيل الزراعية، مباشرة من المزرعة إليك
            </p>

            <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px 50px 15px 25px',
                  borderRadius: '30px',
                  border: 'none',
                  fontSize: '1.1rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}
              />
              <i className="fas fa-search" style={{
                position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
                color: '#2d5a27', fontSize: '1.2rem'
              }}></i>
            </div>
          </div>
        </div>

        <div className="container" style={{ paddingBottom: '80px' }}>
          {error && (
            <div className="error-msg" style={{
              background: '#fff5f5',
              color: '#c53030',
              padding: '15px',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '30px',
              border: '1px solid #feb2b2'
            }}>
              {error}
            </div>
          )}

          {/* New Filter Section - Desktop */}
          <div style={{
            background: 'white',
            padding: '25px',
            borderRadius: '15px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.03)',
            marginBottom: '40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 'bold', color: '#2d3748', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-filter" style={{ color: '#2d5a27' }}></i>
                تصفية حسب الأسعار:
              </span>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {[
                  { value: 'all', label: 'الكل' },
                  { value: '0-20', label: 'أقل من 20 ريال' },
                  { value: '20-40', label: '20 - 40 ريال' },
                  { value: '40-60', label: '40 - 60 ريال' },
                  { value: '60-100', label: 'أكثر من 60 ريال' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPriceFilter(option.value)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '25px',
                      border: priceFilter === option.value ? 'none' : '1px solid #e2e8f0',
                      background: priceFilter === option.value ? '#2d5a27' : 'white',
                      color: priceFilter === option.value ? 'white' : '#718096',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      fontSize: '0.9rem',
                      fontWeight: priceFilter === option.value ? 'bold' : 'normal',
                      boxShadow: priceFilter === option.value ? '0 4px 6px rgba(45, 90, 39, 0.2)' : 'none'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 'bold', color: '#2d3748', fontSize: '0.9rem' }}>ترتيب حسب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 15px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#4a5568',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="newest">الأحدث</option>
                <option value="low-high">السعر: الأقل إلى الأعلى</option>
                <option value="high-low">السعر: الأعلى إلى الأقل</option>
              </select>
            </div>

          </div>

          <div style={{ color: '#718096', fontSize: '0.9rem' }}>
            عُرض {filteredProducts.length} منتج
          </div>

          <div className="products-grid">
            {filteredProducts.length === 0 ? (
              <div style={{
                textAlign: 'center',
                gridColumn: '1/-1',
                padding: '60px',
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.03)'
              }}>
                <i className="fas fa-search" style={{ fontSize: '3rem', color: '#cbd5e0', marginBottom: '20px' }}></i>
                <h3 style={{ color: '#4a5568', marginBottom: '10px' }}>لا توجد منتجات</h3>
                <p style={{ color: '#718096' }}>جرب تغيير خيارات البحث للعثور على ما تبحث عنه</p>
              </div>
            ) : (
              filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="reveal active"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))
            )}
          </div>
        </div>
      </div >
      <Footer />
    </>
  )
}

export default ProductsPage
