import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

function PaymentPage() {
  const [paymentUrl, setPaymentUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('creditcard')
  const [showMethodSelection, setShowMethodSelection] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Get order_id from location state or query params
    const orderIdFromState = location.state?.orderId
    const params = new URLSearchParams(location.search)
    const orderIdFromQuery = params.get('order_id')
    const orderIdToUse = orderIdFromState || orderIdFromQuery

    if (!orderIdToUse) {
      setError('لم يتم العثور على رقم الطلب')
      setLoading(false)
      return
    }

    setOrderId(orderIdToUse)
    // Don't auto-create payment, wait for user to select method
    setLoading(false)
  }, [location])

  const createPayment = async (orderId, method = 'creditcard') => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setError('يجب تسجيل الدخول لإتمام الدفع')
        setLoading(false)
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/payments/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          order_id: orderId,
          payment_method: method
        })
      })

      const data = await response.json()

      if (response.ok) {
        setPaymentUrl(data.payment_url)
        // Redirect to Moyasar payment page
        if (data.payment_url) {
          window.location.href = data.payment_url
        } else {
          setError('لم يتم إنشاء رابط الدفع')
          setLoading(false)
        }
      } else {
        setError(data.error || 'فشل في إنشاء الدفع')
        setLoading(false)
      }
    } catch (err) {
      setError('حدث خطأ في الاتصال: ' + err.message)
      setLoading(false)
    }
  }

  const handleMethodSelect = (method) => {
    setPaymentMethod(method)
    setShowMethodSelection(false)
    createPayment(orderId, method)
  }

  const handleRetry = () => {
    if (orderId) {
      setLoading(true)
      setError(null)
      createPayment(orderId)
    }
  }

  if (showMethodSelection && !loading && !error) {
    return (
      <>
        <Header />
        <div style={{ marginTop: '100px', padding: '40px 0', minHeight: 'calc(100vh - 200px)' }}>
          <div className="container" style={{ maxWidth: '800px' }}>
            <h2 className="section-title" style={{ marginBottom: '30px', textAlign: 'center' }}>
              اختر طريقة الدفع
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div
                onClick={() => handleMethodSelect('creditcard')}
                style={{
                  background: 'white',
                  padding: '30px',
                  borderRadius: '15px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: '2px solid #ddd',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3498db'
                  e.currentTarget.style.transform = 'translateY(-5px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#ddd'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px', color: '#3498db' }}>
                  <i className="fas fa-credit-card"></i>
                </div>
                <h3>بطاقة ائتمانية</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>Visa, Mastercard, Mada</p>
              </div>

              <div
                onClick={() => handleMethodSelect('stcpay')}
                style={{
                  background: 'white',
                  padding: '30px',
                  borderRadius: '15px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: '2px solid #ddd',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#00d4aa'
                  e.currentTarget.style.transform = 'translateY(-5px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#ddd'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px', color: '#00d4aa' }}>
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <h3>STC Pay</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>الدفع عبر STC Pay</p>
              </div>

              <div
                onClick={() => handleMethodSelect('applepay')}
                style={{
                  background: 'white',
                  padding: '30px',
                  borderRadius: '15px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: '2px solid #ddd',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#000'
                  e.currentTarget.style.transform = 'translateY(-5px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#ddd'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '15px', color: '#000' }}>
                  <i className="fab fa-apple"></i>
                </div>
                <h3>Apple Pay</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>الدفع عبر Apple Pay</p>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <button 
                className="btn-secondary" 
                onClick={() => navigate('/cart')}
                style={{ background: '#95a5a6', border: 'none' }}
              >
                <i className="fas fa-arrow-right"></i> العودة للسلة
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Header />
        <div style={{ marginTop: '100px', padding: '40px 0', minHeight: 'calc(100vh - 200px)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <h2>جاري تحضير صفحة الدفع...</h2>
            <p>يرجى الانتظار</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (error) {
    return (
      <>
        <Header />
        <div style={{ marginTop: '100px', padding: '40px 0', minHeight: 'calc(100vh - 200px)' }}>
          <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
            <div style={{ fontSize: '4rem', color: '#e74c3c', marginBottom: '20px' }}>
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>خطأ في الدفع</h2>
            <p style={{ marginBottom: '30px', fontSize: '1.1rem' }}>{error}</p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={handleRetry}>
                <i className="fas fa-redo"></i> إعادة المحاولة
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => navigate('/cart')}
                style={{ background: '#95a5a6', border: 'none' }}
              >
                <i className="fas fa-arrow-right"></i> العودة للسلة
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // If payment URL is set, we're redirecting (shown in loading state)
  return null
}

export default PaymentPage

