import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

function PaymentFailurePage() {
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

      let url = 'http://127.0.0.1:8000/api/payments/failure/'
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

      if (response.ok) {
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

  const handleRetry = () => {
    if (paymentData && paymentData.order_id) {
      navigate('/payment', { state: { orderId: paymentData.order_id } })
    } else {
      navigate('/cart')
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
            <div style={{ fontSize: '5rem', color: '#e74c3c', marginBottom: '20px' }}>
              <i className="fas fa-times-circle"></i>
            </div>
            <h1 style={{ color: '#e74c3c', marginBottom: '15px' }}>فشل الدفع</h1>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px', color: '#666' }}>
              {error || paymentData?.error || 'لم يتم إتمام عملية الدفع. يرجى المحاولة مرة أخرى.'}
            </p>

            {paymentData && (
              <div style={{
                background: '#fff5f5',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '30px',
                textAlign: 'right',
                border: '1px solid #fed7d7'
              }}>
                {paymentData.order_id && (
                  <div style={{ marginBottom: '15px' }}>
                    <strong>رقم الطلب:</strong> #{paymentData.order_id}
                  </div>
                )}
                <div>
                  <strong>حالة الدفع:</strong> 
                  <span style={{ color: '#e74c3c', marginRight: '10px' }}>✗ فاشل</span>
                </div>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '15px' }}>الأسباب المحتملة:</h3>
              <ul style={{ textAlign: 'right', listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '10px' }}>• رصيد غير كافي</li>
                <li style={{ marginBottom: '10px' }}>• بيانات الدفع غير صحيحة</li>
                <li style={{ marginBottom: '10px' }}>• انتهت صلاحية البطاقة</li>
                <li style={{ marginBottom: '10px' }}>• تم إلغاء العملية</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
              <button 
                className="btn-secondary" 
                onClick={() => navigate('/orders')}
                style={{ background: '#95a5a6', border: 'none' }}
              >
                <i className="fas fa-list"></i> عرض الطلبات
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default PaymentFailurePage

