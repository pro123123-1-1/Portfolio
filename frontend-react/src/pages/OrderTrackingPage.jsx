import { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

function OrderTrackingPage() {
    const { trackingNumber: urlTrackingNumber } = useParams()
    const [trackingNumber, setTrackingNumber] = useState(urlTrackingNumber || '')
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const statusSteps = [
        { id: 'pending', label: 'قيد الانتظار', icon: 'fas fa-clock' },
        { id: 'confirmed', label: 'تم التأكيد', icon: 'fas fa-check-circle' },
        { id: 'preparing', label: 'قيد التجهيز', icon: 'fas fa-box-open' },
        { id: 'ready', label: 'جاهز للتوصيل', icon: 'fas fa-truck-loading' },
        { id: 'completed', label: 'تم التوصيل', icon: 'fas fa-box' }
    ]

    const getCurrentStepIndex = (status) => {
        return statusSteps.findIndex(step => step.id === status)
    }

    const handleTrack = async (e) => {
        if (e) e.preventDefault()
        if (!trackingNumber) return

        setLoading(true)
        setError('')
        setOrder(null)

        try {
            // For simplicity, we search by tracking_number in the orders endpoint
            // A more robust backend would have a dedicated public tracking endpoint
            const response = await fetch(`http://127.0.0.1:8000/api/orders/?tracking_number=${trackingNumber}`)
            if (response.ok) {
                const data = await response.json()
                const foundOrder = data.results ? data.results[0] : data[0]

                if (foundOrder) {
                    setOrder(foundOrder)
                } else {
                    setError('عذراً، لم يتم العثور على طلب بهذا الرقم. يرجى التأكد من الرقم والمحاولة مرة أخرى.')
                }
            } else {
                setError('حدث خطأ أثناء البحث عن الطلب. يرجى المحاولة لاحقاً.')
            }
        } catch (err) {
            setError('فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (urlTrackingNumber) {
            handleTrack()
        }
    }, [urlTrackingNumber])

    return (
        <>
            <Header />
            <div style={{ marginTop: '100px', padding: '40px 0', minHeight: 'calc(100vh - 200px)' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <h2 className="section-title">تتبع طلبك</h2>

                    <div style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '15px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        marginBottom: '30px'
                    }}>
                        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="أدخل رقم التتبع (مثال: MK-12345678)"
                                style={{
                                    flex: 1,
                                    padding: '12px 20px',
                                    borderRadius: '8px',
                                    border: '2px solid #eee',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'border-color 0.3s'
                                }}
                            />
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                                style={{ padding: '12px 30px' }}
                            >
                                {loading ? 'جاري البحث...' : 'تتبع'}
                            </button>
                        </form>
                    </div>

                    {error && (
                        <div style={{
                            padding: '20px',
                            background: '#fed7d7',
                            color: '#c53030',
                            borderRadius: '10px',
                            textAlign: 'center',
                            marginBottom: '30px'
                        }}>
                            <i className="fas fa-exclamation-circle" style={{ marginLeft: '10px' }}></i>
                            {error}
                        </div>
                    )}

                    {order && (
                        <div style={{
                            background: 'white',
                            padding: '40px',
                            borderRadius: '15px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
                                <div>
                                    <h3 style={{ margin: 0, color: '#333' }}>طلب رقم: {order.tracking_number}</h3>
                                    <p style={{ color: '#666', marginTop: '5px' }}>تاريخ الطلب: {new Date(order.created_at).toLocaleDateString('ar-SA')}</p>
                                </div>
                                <div style={{
                                    background: '#e6fffa',
                                    color: '#2c7a7b',
                                    padding: '8px 15px',
                                    borderRadius: '20px',
                                    fontWeight: 'bold',
                                    fontSize: '14px'
                                }}>
                                    {statusSteps.find(s => s.id === order.status)?.label || order.status}
                                </div>
                            </div>

                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', marginBottom: '50px' }}>
                                {/* Progress Line */}
                                <div style={{
                                    position: 'absolute',
                                    top: '25px',
                                    left: '5%',
                                    right: '5%',
                                    height: '4px',
                                    background: '#edf2f7',
                                    zIndex: 1
                                }}></div>
                                <div style={{
                                    position: 'absolute',
                                    top: '25px',
                                    left: '5%',
                                    width: `${(getCurrentStepIndex(order.status) / (statusSteps.length - 1)) * 90}%`,
                                    height: '4px',
                                    background: '#38a169',
                                    zIndex: 2,
                                    transition: 'width 0.5s ease'
                                }}></div>

                                {statusSteps.map((step, index) => {
                                    const isCompleted = getCurrentStepIndex(order.status) >= index;
                                    const isActive = order.status === step.id;

                                    return (
                                        <div key={step.id} style={{ zIndex: 3, textAlign: 'center', width: '20%' }}>
                                            <div style={{
                                                width: '50px',
                                                height: '50px',
                                                borderRadius: '50%',
                                                background: isCompleted ? '#38a169' : '#fff',
                                                border: `4px solid ${isCompleted ? '#38a169' : '#edf2f7'}`,
                                                color: isCompleted ? '#white' : '#cbd5e0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 15px',
                                                transition: 'all 0.3s',
                                                fontSize: '20px'
                                            }}>
                                                <i className={step.icon} style={{ color: isCompleted ? 'white' : '#cbd5e0' }}></i>
                                            </div>
                                            <p style={{
                                                fontSize: '14px',
                                                fontWeight: isActive ? 'bold' : 'normal',
                                                color: isActive ? '#38a169' : '#718096'
                                            }}>{step.label}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '10px' }}>
                                <h4 style={{ marginBottom: '15px', color: '#333', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>تفاصيل التوصيل</h4>
                                <p><strong>الاسم:</strong> {order.delivery_name}</p>
                                <p><strong>العنوان:</strong> {order.delivery_address}, {order.delivery_city}</p>
                                <p><strong>الجوال:</strong> {order.delivery_phone}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    )
}

export default OrderTrackingPage
