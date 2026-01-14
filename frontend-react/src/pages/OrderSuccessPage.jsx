import { useLocation, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

function OrderSuccessPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const order = location.state?.order

    // If no order data, redirect to home
    if (!order) {
        return (
            <>
                <Header />
                <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                    <h2>No Order Found</h2>
                    <button className="btn-primary" onClick={() => navigate('/')}>Return Home</button>
                </div>
                <Footer />
            </>
        )
    }

    const isConfigured = !!localStorage.getItem('access_token')

    return (
        <>
            <Header />
            <div style={{ marginTop: '100px', padding: '60px 20px', minHeight: '60vh', background: '#f9f9f9' }}>
                <div className="container" style={{ maxWidth: '600px', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', textAlign: 'center' }}>

                    <div style={{ width: '80px', height: '80px', background: '#e8f5e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <i className="fas fa-check" style={{ fontSize: '40px', color: '#2ecc71' }}></i>
                    </div>

                    <h2 style={{ color: '#2ecc71', marginBottom: '10px' }}>تم استلام طلبك بنجاح!</h2>
                    <p style={{ color: '#666', marginBottom: '30px' }}>شكراً لتسوقك معنا. رقم الطلب الخاص بك هو:</p>

                    <div style={{ background: '#fdfdfd', border: '1px dashed #ddd', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
                        <h3 style={{ margin: 0, fontSize: '24px', color: '#333' }}>#{order.id}</h3>
                        <div style={{ marginTop: '15px' }}>
                            <span style={{
                                background: order.status === 'pending' ? '#f39c12' : '#2ecc71',
                                color: 'white',
                                padding: '5px 15px',
                                borderRadius: '20px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
                            }}>
                                الحالة: {order.status === 'pending' ? 'قيد الانتظار (Pending)' : order.status}
                            </span>
                        </div>
                    </div>

                    <p style={{ lineHeight: '1.6', color: '#555', marginBottom: '30px' }}>
                        سنقوم بمعالجة طلبك قريباً.
                        {order.delivery_city ? ` سيتم التوصيل إلى ${order.delivery_city}.` : ''}
                    </p>

                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={() => navigate('/products')}>
                            متابعة التسوق
                        </button>

                        {isConfigured && (
                            <button className="btn-secondary" onClick={() => navigate('/orders')}>
                                تتبع طلباتي
                            </button>
                        )}
                    </div>

                </div>
            </div>
            <Footer />
        </>
    )
}

export default OrderSuccessPage
