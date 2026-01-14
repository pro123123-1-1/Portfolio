import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isFarmer, setIsFarmer] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    setIsLoggedIn(!!token)

    if (token) {
      fetch('http://127.0.0.1:8000/api/auth/profile/', { headers: { 'Authorization': `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          if (data.role === 'farmer' || data.is_farmer) setIsFarmer(true)
        })
        .catch(() => { })
    }

    // Function to update cart count from localStorage
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart')) || []
      const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
      setCartCount(totalItems)
    }

    // Listen for storage changes (for real-time updates across pages)
    window.addEventListener('storage', updateCartCount)
    updateCartCount() // Initial load

    return () => {
      window.removeEventListener('storage', updateCartCount)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setIsLoggedIn(false)
    window.location.href = '/'
  }

  return (
    <header>
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🌴</span>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              مزارع المملكة
            </Link>
          </div>
          <nav>
            <ul>
              <li><Link to="/">الرئيسية</Link></li>
              <li><Link to="/products">منتجاتنا</Link></li>
              <li><a href="/#order-status">حالة الطلب</a></li>
              <li><Link to="/farmers">المزارعين</Link></li>
              <li><Link to="/about">من نحن</Link></li>
              <li><Link to="/contact">اتصل بنا</Link></li>
            </ul>
          </nav>
          <div className="header-actions">
            <Link to="/cart" className="cart-icon">
              <i className="fas fa-shopping-cart"></i>
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </Link>
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="btn-primary">تسجيل الدخول</Link>
                <Link to="/signup" className="btn-secondary" style={{ marginRight: '5px' }}>
                  حساب جديد
                </Link>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isFarmer && (
                  <Link to="/my-farm" className="btn-secondary" style={{ background: '#e67e22', color: 'white', border: 'none' }}>
                    <i className="fas fa-tractor"></i> لوحة المزارع
                  </Link>
                )}
                <Link to="/profile" style={{ color: '#27ae60', textDecoration: 'none', fontWeight: 'bold' }}>
                  <i className="fas fa-user-circle"></i> ملفي الشخصي
                </Link>
                <button onClick={handleLogout} className="btn-primary" style={{ background: '#c0392b' }}>
                  خروج
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

