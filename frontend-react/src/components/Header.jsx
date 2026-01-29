import { Link } from 'react-router-dom'
import { useNotification } from '../context/NotificationContext'
import API_BASE_URL from '../apiConfig'
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
      const fetchProfile = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/profile/`, { headers: { 'Authorization': `Bearer ${token}` } })
          if (response.ok) {
            const data = await response.json()
            if (data.role === 'farmer' || data.is_farmer) setIsFarmer(true)
          }
        } catch (error) {
          console.error("Failed to fetch profile:", error)
        }
      }
      fetchProfile()
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
    localStorage.removeItem('cart')
    window.dispatchEvent(new Event('storage'))
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
                <Link to="/orders" style={{ color: '#2d5a27', textDecoration: 'none', fontWeight: 'bold' }}>
                  <i className="fas fa-list-ul"></i> طلباتي
                </Link>
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

