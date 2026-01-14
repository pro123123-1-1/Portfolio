import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Notification from '../components/Notification'

function CartPage() {
  const [cart, setCart] = useState([])
  const [notification, setNotification] = useState({ isVisible: false, message: '', type: 'info', persist: false })
  const navigate = useNavigate()

  const showNotification = (message, type = 'warning', persist = false) => {
    setNotification({ isVisible: true, message, type, persist })
  }

  useEffect(() => {
    // Load cart and attempt to repair missing IDs by fetching from backend
    const initializeCart = async () => {
      let savedCart = JSON.parse(localStorage.getItem('cart')) || []

      try {
        // Fetch valid products to reconcile IDs
        const response = await fetch('http://127.0.0.1:8000/api/products/')
        if (response.ok) {
          const data = await response.json()
          const products = data.results || data // Handle pagination if present

          // Create lookup map: Name -> ID
          const productMap = {}
          products.forEach(p => {
            productMap[p.name] = p.id
            // Also map by "english/arabic" variations if known, but for now exact name
          })

          savedCart = savedCart.map(item => {
            let newItem = { ...item }

            // 1. Fix object structure
            if (typeof item.product === 'object' && item.product !== null) {
              newItem.product_id = item.product.id
              newItem.product = item.product.name
            }

            // 2. Fix missing ID by looking up name
            if (!newItem.product_id && productMap[newItem.product]) {
              newItem.product_id = productMap[newItem.product]
              console.log(`Repaired product ID for ${newItem.product} -> ${newItem.product_id}`)
            }

            // 3. Normalized numeric values
            newItem.price = parseFloat(item.price) || 0
            newItem.quantity = parseInt(item.quantity) || 1

            return newItem
          }).filter(item => item.product_id) // Remove items we couldn't repair (prevents 404s/500s)
        }
      } catch (e) {
        console.error("Failed to fetch products for cart repair", e)
      }

      setCart(savedCart)
      localStorage.setItem('cart', JSON.stringify(savedCart))
    }

    initializeCart()
  }, [])

  // Combined effect to handle persistent warnings based on cart state
  useEffect(() => {
    const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0)
    if (totalQuantity > 10) {
      if (!notification.isVisible || notification.message !== 'عذراً، نود تنبيهك بأن طلبك يحتوي الآن على أكثر من 10 منتجات. يرجى مراجعة الكميات المختارة لضمان دقة الطلب وتفادي أي تأخير.') {
        showNotification('عذراً، نود تنبيهك بأن طلبك يحتوي الآن على أكثر من 10 منتجات. يرجى مراجعة الكميات المختارة لضمان دقة الطلب وتفادي أي تأخير.', 'warning', true)
      }
    } else if (notification.persist && notification.type === 'warning') {
      setNotification(prev => ({ ...prev, isVisible: false }))
    }
  }, [cart])

  const updateQuantity = (product, newQuantity) => {
    const updatedCart = cart.map(item =>
      item.product === product ? { ...item, quantity: newQuantity } : item
    )

    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    // Notify Header
    window.dispatchEvent(new Event('storage'))
  }

  const removeItem = (product) => {
    const updatedCart = cart.filter(item => item.product !== product)
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    // Notify Header
    window.dispatchEvent(new Event('storage'))
  }

  const itemsCount = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  const shipping = 15
  const total = subtotal + shipping

  return (
    <>
      <Header />
      <div className="notification-container">
        <Notification
          isVisible={notification.isVisible}
          message={notification.message}
          type={notification.type}
          persist={notification.persist}
          onClose={() => setNotification({ ...notification, isVisible: false })}
        />
      </div>
      <div style={{ marginTop: '100px', padding: '40px 0', minHeight: 'calc(100vh - 200px)' }}>
        <div className="container">
          <h2 className="section-title">عربة التسوق</h2>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <i className="fas fa-shopping-cart" style={{ fontSize: '4rem', color: '#ddd', marginBottom: '20px' }}></i>
              <h3>عربة التسوق فارغة</h3>
              <p style={{ marginBottom: '20px' }}>لم تقم بإضافة أي منتجات إلى عربة التسوق بعد</p>
              <button className="btn-primary" onClick={() => navigate('/products')}>
                ابدأ التسوق
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
              <div>
                {cart.map(item => (
                  <div key={item.product} className="cart-item" style={{
                    display: 'flex',
                    gap: '20px',
                    padding: '20px',
                    background: 'white',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`,
                      backgroundSize: 'cover',
                      borderRadius: '8px'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <h3>{item.product}</h3>
                      <div style={{ color: '#666', marginBottom: '10px' }}>{item.price} ر.س / كجم</div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.product, Math.max(1, item.quantity - 1))}
                          style={{ padding: '5px 10px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product, Math.max(1, parseInt(e.target.value) || 1))}
                          min="1"
                          style={{ width: '60px', padding: '5px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px' }}
                        />
                        <button
                          className="quantity-btn"
                          onClick={() => updateQuantity(item.product, item.quantity + 1)}
                          style={{ padding: '5px 10px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                    <button
                      className="remove-item"
                      onClick={() => removeItem(item.product)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#c0392b',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                      }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>

              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '10px',
                height: 'fit-content',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ marginBottom: '20px' }}>ملخص الطلب</h3>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>عدد العناصر:</span>
                    <span>{itemsCount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>المجموع الفرعي:</span>
                    <span>{subtotal.toFixed(2)} ر.س</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span>رسوم الشحن:</span>
                    <span>{shipping} ر.س</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '15px', borderTop: '1px solid #ddd', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <span>الإجمالي:</span>
                    <span>{total.toFixed(2)} ر.س</span>
                  </div>
                </div>
                <button
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    opacity: itemsCount > 10 ? 0.6 : 1,
                    cursor: itemsCount > 10 ? 'not-allowed' : 'pointer',
                    background: itemsCount > 10 ? '#94a3b8' : undefined
                  }}
                  disabled={itemsCount > 10}
                  onClick={async () => {
                    if (itemsCount > 10) return;

                    const token = localStorage.getItem('access_token')
                    if (!token) {
                      alert('يجب تسجيل الدخول لإتمام الطلب')
                      navigate('/login')
                      return
                    }

                    if (cart.length === 0) {
                      alert('السلة فارغة')
                      return
                    }

                    try {
                      // First, create the order
                      const orderResponse = await fetch('http://127.0.0.1:8000/api/orders/', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          items: cart.map(item => ({
                            product: item.product_id,
                            quantity: item.quantity,
                            price: item.price
                          }))
                        })
                      })

                      if (orderResponse.ok) {
                        const orderData = await orderResponse.json()
                        const orderId = orderData.id

                        // Redirect to payment page
                        navigate('/payment', { state: { orderId } })
                      } else if (orderResponse.status === 401) {
                        localStorage.removeItem('access_token')
                        localStorage.removeItem('refresh_token')
                        alert('جلسة العمل انتهت، يرجى تسجيل الدخول مرة أخرى')
                        navigate('/login')
                      } else {
                        const errorData = await orderResponse.json()
                        console.error('Order Error:', errorData)
                        alert('فشل إرسال الطلب: ' + (errorData.error || JSON.stringify(errorData)))
                      }
                    } catch (e) {
                      console.error(e)
                      alert('حدث خطأ في الاتصال: ' + e.message)
                    }
                  }}
                >
                  <i className="fas fa-credit-card"></i> إتمام الشراء والدفع
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default CartPage

