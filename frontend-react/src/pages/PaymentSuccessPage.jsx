import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

function PaymentSuccessPage() {
  const [paymentData, setPaymentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const paymentId = searchParams.get('id')
    const orderId = searchParams.get('order_id')

    if (!paymentId && !orderId) {
      setError('لم يتم العثور على معلومات الدفع')
      setLoading(false)
      return
    }

    verifyPayment(paymentId, orderId)
  }, [searchParams])

  const verifyPayment = async (paymentId, orderId) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setError('يجب تسجيل الدخول')
        setLoading(false)
        return
      }

      let url = 'http://127.0.0.1:8001/api/payments/success/'
      if (paymentId) {
        url += `?id=${paymentId}`
      } else if (orderId) {
        url += `?order_id=${orderId}`
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setPaymentData(data)
      } else {
        setError(data.error || 'فشل في التحقق من الدفع')
      }
      setLoading(false)
    } catch (err) {
      setError('حدث خطأ في الاتصال: ' + err.message)
      setLoading(false)
    }
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
            <h2>جاري التحقق من الدفع...</h2>
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
            <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>خطأ</h2>
            <p style={{ marginBottom: '30px', fontSize: '1.1rem' }}>{error}</p>
            <button className="btn-primary" onClick={() => navigate('/orders')}>
              <i className="fas fa-list"></i> عرض الطلبات
            </button>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div style={{ marginTop: '100px', padding: '40px 0', minHeight: 'calc(100vh - 200px)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '600px' }}>
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '15px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '5rem', color: '#27ae60', marginBottom: '20px' }}>
              <i className="fas fa-check-circle"></i>
            </div>
            <h1 style={{ color: '#27ae60', marginBottom: '15px' }}>تم الدفع بنجاح! 🎉</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px', color: '#666' }}>
              شكراً لك! تم استلام طلبك بنجاح
            </p>

            {paymentData && (
              <div style={{
                background: '#f8f9fa',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '30px',
                textAlign: 'right'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <strong>رقم الطلب:</strong> #{paymentData.order_id}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>المبلغ المدفوع:</strong> {paymentData.amount} ر.س
                </div>
                <div>
                  <strong>حالة الدفع:</strong> 
                  <span style={{ color: '#27ae60', marginRight: '10px' }}>✓ مدفوع</span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={() => navigate('/orders')}>
                <i className="fas fa-list"></i> عرض طلباتي
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => navigate('/products')}
                style={{ background: '#95a5a6', border: 'none' }}
              >
                <i className="fas fa-shopping-bag"></i> مواصلة التسوق
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default PaymentSuccessPage

