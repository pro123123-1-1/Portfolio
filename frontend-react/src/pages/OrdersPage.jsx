import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

function OrdersPage() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('access_token')
            if (!token) {
                navigate('/login')
                return
            }

            try {
                const response = await fetch('http://127.0.0.1:8000/api/orders/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    // DRF ViewSet returns pages, or list. Handle both.
                    const results = data.results || data
                    setOrders(results)
                } else {
                    throw new Error('Failed to fetch orders')
                }
            } catch (err) {
                console.error(err)
                setError('حدث خطأ في تحميل الطلبات')
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [navigate])

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#f39c12', text: 'قيد الانتظار' },
            confirmed: { bg: '#3498db', text: 'تم التأكيد' },
            delivered: { bg: '#2ecc71', text: 'تم التوصيل' },
            cancelled: { bg: '#e74c3c', text: 'ملغي' }
        }
        const style = styles[status] || { bg: '#95a5a6', text: status }

        return (
            <span style={{
                background: style.bg,
                color: 'white',
                padding: '5px 10px',
                borderRadius: '15px',
                fontSize: '12px'
            }}>
                {style.text}
            </span>
        )
    }

    return (
        <>
            <Header />
            <div style={{ marginTop: '100px', padding: '40px 0', minHeight: 'calc(100vh - 200px)' }}>
                <div className="container">
                    <h2 className="section-title">طلباتي (My Orders)</h2>

                    {loading ? (
                        <p style={{ textAlign: 'center' }}>جاري التحميل...</p>
                    ) : error ? (
                        <div className="error-msg">{error}</div>
                    ) : orders.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '40px' }}>ليس لديك طلبات سابقة.</p>
                    ) : (
                        <div className="orders-list" style={{ display: 'grid', gap: '20px' }}>
                            {orders.map(order => (
                                <div key={order.id} style={{
                                    background: 'white',
                                    padding: '20px',
                                    borderRadius: '10px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                    border: '1px solid #eee'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '18px' }}>طلب #{order.id}</h3>
                                            <span style={{ fontSize: '12px', color: '#888' }}>{new Date(order.created_at).toLocaleDateString('ar-SA')}</span>
                                        </div>
                                        {getStatusBadge(order.status)}
                                    </div>

                                    <div style={{ marginBottom: '15px' }}>
                                        <p><strong>المزرعة:</strong> {order.farm_name}</p>
                                        <p><strong>عدد العناصر:</strong> {order.items ? order.items.length : 0}</p>
                                        <p><strong>الإجمالي:</strong> {order.total_amount} ر.س</p>
                                    </div>

                                    {order.items && (
                                        <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '5px' }}>
                                            {order.items.map(item => (
                                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
                                                    <span>{item.product_name} (x{item.quantity})</span>
                                                    <span>{item.price} ر.س</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    )
}

export default OrdersPage
