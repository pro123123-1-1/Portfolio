import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Notification from '../components/Notification'
import API_BASE_URL from '../apiConfig'

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState({ isVisible: false, message: '', type: 'info', title: 'تنبيه' })
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search)
    if (queryParams.get('payment') === 'success') {
      setNotification({
        isVisible: true,
        message: 'تمت عملية الدفع بنجاح! شكراً لطلبك من مزارع المملكة.',
        type: 'success',
        title: 'تم الدفع'
      })
      // Clear cart
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('storage'))

      // Clean up URL
      navigate('/', { replace: true })
    }
  }, [location])

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active')
        }
      })
    }, { threshold: 0.1, rootMargin: '0px' })

    const elements = document.querySelectorAll('.reveal')
    elements.forEach(el => observer.observe(el))

    return () => {
      elements.forEach(el => observer.unobserve(el))
      observer.disconnect()
    }
  }, [featuredProducts, loading])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/`)
      if (response.ok) {
        const data = await response.json()
        const products = data.results || data
        // Just show the first 4 products as featured
        setFeaturedProducts(products.slice(0, 4))
      }
    } catch (err) {
      console.error('Failed to fetch home products:', err)
    } finally {
      setLoading(false)
    }
  }


  return (
    <>
      <Header />
      <div className="notification-container">
        <Notification
          isVisible={notification.isVisible}
          message={notification.message}
          type={notification.type}
          title={notification.title}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      </div>
      <section className="hero">
        <div className="hero-icons">
          <i className="fas fa-seedling hero-icon"></i>
          <i className="fas fa-leaf hero-icon"></i>
          <i className="fas fa-apple-alt hero-icon"></i>
          <i className="fas fa-wheat-awn hero-icon"></i>
        </div>
        <div className="wave"></div>
        <div className="container">
          <div className="hero-content">
            <h1>من تراب وطننا...<br />حيث تُزرع الجودة، وتُحصد الثقة</h1>
            <p>نقدم لكم أفضل المنتجات الزراعية الطازجة مباشرة من مزارعنا إلى منزلكم</p>
            <div className="hero-buttons">
              <Link to="/products" className="btn-primary">استكشف منتجاتنا</Link>
              <Link to="/signup?role=farmer" className="btn-secondary">انضم كمزارع</Link>
            </div>
          </div>
        </div>
      </section>


      <section className="categories reveal">
        <div className="container">
          <h2 className="section-title">تسوق حسب التصنيف</h2>
          <div className="categories-grid">
            <div className="category-card" onClick={() => window.location.href = '/products?category=dates'}>
              <div className="category-icon">🍇</div>
              <h3>تمور</h3>
              <p>أجود أنواع التمور السعودية</p>
            </div>
            <div className="category-card" onClick={() => window.location.href = '/products?category=fruits'}>
              <div className="category-icon">🍓</div>
              <h3>فواكه</h3>
              <p>فواكه طازجة وموسمية</p>
            </div>
            <div className="category-card" onClick={() => window.location.href = '/products?category=vegetables'}>
              <div className="category-icon">🥦</div>
              <h3>خضروات</h3>
              <p>خضروات عضوية طازجة</p>
            </div>
            <div className="category-card" onClick={() => window.location.href = '/products?category=dairy'}>
              <div className="category-icon">🥛</div>
              <h3>ألبان</h3>
              <p>منتجات ألبان طازجة</p>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-products reveal">
        <div className="container">
          <h2 className="section-title">منتجاتنا المميزة</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>جاري التحميل...</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.length > 0 ? (
                featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>لا توجد منتجات مميزة حالياً</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="featured-farmers reveal">
        <div className="container">
          <h2 className="section-title">مزارعون متميزون</h2>
          <div className="farmers-grid">
            <div className="farmer-card">
              <div className="farmer-image" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1471194402529-8e0f5a675de6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')` }}></div>
              <div className="farmer-info">
                <h3>مزارع المملكة</h3>
                <p className="farmer-location"><i className="fas fa-map-marker-alt"></i> القصيم</p>
                <p className="farmer-desc">نوفر أفضل أنواع الخضروات والفواكه الطازجة</p>
                <div className="farmer-stats">
                  <span>منتجات: 25</span>
                  <span>تقييم: 4.8</span>
                </div>
                <a href="#farmer-profile" className="btn-outline">عرض الملف</a>
              </div>
            </div>

            <div className="farmer-card">
              <div className="farmer-image" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80')` }}></div>
              <div className="farmer-info">
                <h3>مزرعة النخيل</h3>
                <p className="farmer-location"><i className="fas fa-map-marker-alt"></i> المدينة المنورة</p>
                <p className="farmer-desc">تنتج أجود أنواع التمور السعودي</p>
                <div className="farmer-stats">
                  <span>منتجات: 18</span>
                  <span>تقييم: 4.9</span>
                </div>
                <a href="#farmer-profile" className="btn-outline">عرض الملف</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default HomePage
