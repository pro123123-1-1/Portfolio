import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useState, useEffect } from 'react'

function HomePage() {
  const [cart, setCart] = useState([])

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || []
    setCart(savedCart)
  }, [])

  const addToCart = (product, price) => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || []
    const existingItem = savedCart.find(item => item.product === product)
    
    if (existingItem) {
      existingItem.quantity += 1
    } else {
      savedCart.push({
        product: product,
        price: price,
        quantity: 1
      })
    }
    
    localStorage.setItem('cart', JSON.stringify(savedCart))
    setCart(savedCart)
    
    // Show notification
    alert(`${product} تمت الإضافة إلى السلة`)
  }

  const generateStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="fas fa-star"></i>)
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt"></i>)
    }
    
    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star"></i>)
    }
    
    return stars
  }

  const featuredProducts = [
    {
      id: 1,
      name: "تمر سكري",
      price: 45,
      farm: "مزرعة النخيل",
      image: "https://images.unsplash.com/photo-1594736797933-d0d69e1e5d3f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      rating: 4.5,
      reviews: 128
    },
    {
      id: 2,
      name: "فراولة طازجة",
      price: 40,
      farm: "مزرعة الفواكه",
      image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      rating: 4.2,
      reviews: 95
    },
    {
      id: 3,
      name: "طماطم عضوية",
      price: 15,
      farm: "مزارع المملكة",
      image: "https://images.unsplash.com/photo-1546470427-e212b7d310a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      rating: 4.8,
      reviews: 210
    },
    {
      id: 4,
      name: "حليب طازج",
      price: 12,
      farm: "مزرعة الألبان",
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      rating: 4.6,
      reviews: 167
    }
  ]

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
          <div className="products-grid">
            {featuredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image" style={{ backgroundImage: `url('${product.image}')` }}></div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <div className="product-price">{product.price} ريال / كجم</div>
                  <div className="product-farm">{product.farm}</div>
                  <div className="product-rating">
                    {generateStars(product.rating)}
                    <span>({product.reviews})</span>
                  </div>
                  <button 
                    className="btn-primary" 
                    onClick={() => addToCart(product.name, product.price)}
                  >
                    أضف إلى السلة
                  </button>
                </div>
              </div>
            ))}
          </div>
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

