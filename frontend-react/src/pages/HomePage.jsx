import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import { useState, useEffect } from 'react'

function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/products/')
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

  // Order Status Logic
  const [latestOrder, setLatestOrder] = useState(null)
  const [activeStep, setActiveStep] = useState(0) // 0: None, 1: Pending, 2: In Progress, 3: Completed

  useEffect(() => {
    const fetchLatestOrder = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) return null

      try {
        const response = await fetch('http://127.0.0.1:8000/api/orders/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          const orders = data.results || data
          if (orders.length > 0) {
            return orders[0]
          }
        }
      } catch (err) {
        console.error('Failed to fetch latest order:', err)
      }
      return null
    }

    const checkStatus = async () => {
      const savedCart = JSON.parse(localStorage.getItem('cart')) || []
      const order = await fetchLatestOrder()

      setLatestOrder(order)

      let step = 0
      if (savedCart.length > 0) step = 1

      if (order) {
        const s = order.status
        if (s === 'pending' || s === 'confirmed') step = 1
        else if (s === 'preparing' || s === 'ready') step = 2
        else if (s === 'completed') step = 3
      }

      setActiveStep(step)
    }

    checkStatus()
    window.addEventListener('storage', checkStatus)
    return () => window.removeEventListener('storage', checkStatus)
  }, [])

  return (
    <>
      <Header />
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

      {/* Order Status Section */}
      <section id="order-status" className="order-status" style={{ padding: '100px 0', background: '#f8fafc' }}>
        <div className="container">
          <h2 className="section-title">نظام تتبع وحالة الطلب</h2>
          <div className="tracking-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {latestOrder && (
              <div className="order-meta-info">
                <div className="meta-item">
                  <span className="meta-label">رقم الطلب</span>
                  <span className="meta-value">#{latestOrder.tracking_number || latestOrder.id}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">تاريخ الطلب</span>
                  <span className="meta-value">{new Date(latestOrder.created_at).toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="meta-item" style={{ textAlign: 'left' }}>
                  <span className="meta-label">إجمالي المبلغ</span>
                  <span className="meta-value">{latestOrder.total_amount} ر.س</span>
                </div>
              </div>
            )}

            <div style={{ position: 'relative', marginTop: latestOrder ? '0' : '20px' }}>
              {/* Progress Line Background */}
              <div style={{
                position: 'absolute',
                top: '25px',
                left: '60px',
                right: '60px',
                height: '4px',
                background: '#f1f5f9',
                zIndex: 0,
                borderRadius: '2px'
              }}>
                {/* Active Progress Line */}
                <div style={{
                  height: '100%',
                  width: activeStep === 0 ? '0%' : activeStep === 1 ? '0%' : activeStep === 2 ? '50%' : '100%',
                  background: '#2d5a27',
                  transition: 'width 0.8s cubic-bezier(0.65, 0, 0.35, 1)',
                  borderRadius: '2px'
                }}></div>
              </div>

              {/* Steps Layout */}
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                {/* Step 1: Pending */}
                <div style={{ textAlign: 'center', width: '120px' }} className={activeStep >= 1 ? 'step-completed' : ''}>
                  <div className={`step-icon-animated ${activeStep === 1 ? 'stepper-active-pulse' : ''}`} style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: activeStep >= 1 ? '#2d5a27' : 'white',
                    color: activeStep >= 1 ? 'white' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    border: `2px solid ${activeStep >= 1 ? '#2d5a27' : '#e2e8f0'}`,
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                  }}>
                    <i className="fas fa-shopping-basket"></i>
                  </div>
                  <div className="status-label">قيد الانتظار</div>
                  <div className="status-desc">{activeStep >= 1 ? 'تم استلام الطلب' : 'بانتظار التأكيد'}</div>
                </div>

                {/* Step 2: Processing */}
                <div style={{ textAlign: 'center', width: '120px' }} className={activeStep >= 2 ? 'step-completed' : ''}>
                  <div className={`step-icon-animated ${activeStep === 2 ? 'stepper-active-pulse' : ''}`} style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: activeStep >= 2 ? '#2d5a27' : 'white',
                    color: activeStep >= 2 ? 'white' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    border: `2px solid ${activeStep >= 2 ? '#2d5a27' : '#e2e8f0'}`,
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                  }}>
                    <i className="fas fa-box-open"></i>
                  </div>
                  <div className="status-label">جاري التجهيز</div>
                  <div className="status-desc">{activeStep >= 2 ? 'يتم تحضير المنتجات' : 'في انتظار التجهيز'}</div>
                </div>

                {/* Step 3: Completed */}
                <div style={{ textAlign: 'center', width: '120px' }} className={activeStep >= 3 ? 'step-completed' : ''}>
                  <div className={`step-icon-animated ${activeStep === 3 ? 'stepper-active-pulse' : ''}`} style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: activeStep >= 3 ? '#2d5a27' : 'white',
                    color: activeStep >= 3 ? 'white' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    border: `2px solid ${activeStep >= 3 ? '#2d5a27' : '#e2e8f0'}`,
                    fontSize: '1.2rem',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                  }}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <div className="status-label">تم التوصيل</div>
                  <div className="status-desc">{activeStep >= 3 ? 'وصل طلبك بنجاح' : 'بانتظار وصول الطلب'}</div>
                </div>
              </div>

              {/* Status Desc */}
              {/* Footer Status Context */}
              <div style={{
                marginTop: '40px',
                paddingTop: '25px',
                borderTop: '1px solid #f1f5f9',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>
                  {activeStep === 0 && "مرحباً بك! يمكنك البدء بإضافة المنتجات الطازجة لسلتك لتتبع حالتها هنا."}
                  {activeStep === 1 && "نعمل حالياً على مراجعة طلبك لضمان جودة المنتجات قبل البدء في التجهيز."}
                  {activeStep === 2 && "رائع! منتجاتك الآن يتم قطفها وتحضيرها بعناية فائقة لتصلك طازجة."}
                  {activeStep === 3 && "سعدنا بخدمتكم! نأمل أن تنال منتجاتنا رضاكم، ونتطلع لخدمتكم مرة أخرى."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="categories">
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

      <section className="featured-products">
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

      <section className="featured-farmers">
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
