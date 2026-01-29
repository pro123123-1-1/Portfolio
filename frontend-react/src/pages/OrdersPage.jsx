import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'
import API_BASE_URL from '../apiConfig'

function OrdersPage() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [activeTab, setActiveTab] = useState('purchases') // 'purchases' or 'sales'
    const [updatingStatus, setUpdatingStatus] = useState(null)

    const statusMap = {
        'pending': { label: 'قيد الانتظار', color: '#f39c12' },
        'confirmed': { label: 'تم التأكيد', color: '#27ae60' },
        'preparing': { label: 'قيد التجهيز', color: '#2ecc71' },
        'ready': { label: 'جاهز للتوصيل', color: '#3498db' },
        'completed': { label: 'تم التوصيل', color: '#2c3e50' },
        'cancelled': { label: 'ملغي', color: '#e74c3c' }
    }

    const statusSteps = [
        { id: 'pending', label: 'قيد الانتظار', icon: 'fas fa-clock', color: '#f39c12' },
        { id: 'confirmed', label: 'تم التأكيد', icon: 'fas fa-check-circle', color: '#27ae60' },
        { id: 'preparing', label: 'قيد التجهيز', icon: 'fas fa-box-open', color: '#2ecc71' },
        { id: 'ready', label: 'جاهز للتوصيل', icon: 'fas fa-truck-loading', color: '#3498db' },
        { id: 'completed', label: 'تم التوصيل', icon: 'fas fa-box', color: '#2c3e50' }
    ]

    const getCurrentStepIndex = (status) => {
        return statusSteps.findIndex(step => step.id === status)
    }

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access_token')
            if (!token) {
                navigate('/login')
                return
            }

            try {
                // 1. Fetch Profile to distinguish orders
                const profileRes = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const profileData = await profileRes.json()
                setProfile(profileData)

                // 2. Fetch Orders
                const response = await fetch(`${API_BASE_URL}/api/orders/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })

                if (response.ok) {
                    const data = await response.json()
                    setOrders(data.results || data)
                } else {
                    setError('فشل في تحميل الطلبات')
                }
            } catch (err) {
                setError('حدث خطأ في الاتصال بالسيرفر')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [navigate])

    const handleUpdateStatus = async (orderId, newStatus) => {
        setUpdatingStatus(orderId)
        try {
            const token = localStorage.getItem('access_token')
            const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (response.ok) {
                const updatedOrder = await response.json()
                setOrders(orders.map(o => o.id === orderId ? updatedOrder : o))
            } else {
                alert('فشل في تحديث الحالة')
            }
        } catch (err) {
            alert('خطأ في الاتصال')
        } finally {
            setUpdatingStatus(null)
        }
    }

    const myPurchases = orders.filter(o => o.consumer === profile?.id)
    const mySales = orders.filter(o => o.consumer !== profile?.id)

    const displayedOrders = activeTab === 'purchases' ? myPurchases : mySales

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8f9fa' }}>
            <div style={{ textAlign: 'center' }}>
                <i className="fas fa-spinner fa-spin fa-3x" style={{ color: '#2d5a27', marginBottom: '20px' }}></i>
                <h3>جاري تحميل طلباتك...</h3>
            </div>
        </div>
    )

    return (
        <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
            <Header />
            <div style={{ padding: '120px 0 60px' }}>
                <div className="container" style={{ maxWidth: '1000px' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '40px', color: '#2d5a27', fontWeight: 'bold', fontSize: '2.5rem' }}>
                        {profile?.is_farmer ? 'إدارة الطلبات' : 'مشترياتي'}
                    </h2>

                    {profile?.is_farmer && (
                        <div style={{
                            display: 'flex',
                            background: 'white',
                            padding: '10px',
                            borderRadius: '15px',
                            marginBottom: '40px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                        }}>
                            <button
                                onClick={() => setActiveTab('purchases')}
                                style={{
                                    flex: 1,
                                    padding: '15px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: activeTab === 'purchases' ? '#2d5a27' : 'transparent',
                                    color: activeTab === 'purchases' ? 'white' : '#718096',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <i className="fas fa-shopping-bag" style={{ marginLeft: '8px' }}></i>
                                مشترياتي ({myPurchases.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('sales')}
                                style={{
                                    flex: 1,
                                    padding: '15px',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: activeTab === 'sales' ? '#2d5a27' : 'transparent',
                                    color: activeTab === 'sales' ? 'white' : '#718096',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <i className="fas fa-store" style={{ marginLeft: '8px' }}></i>
                                طلبات الزبائن ({mySales.length})
                            </button>
                        </div>
                    )}

                    {error && <div style={{ padding: '20px', background: '#fff5f5', color: '#c53030', borderRadius: '15px', textAlign: 'center', marginBottom: '30px' }}>{error}</div>}

                    {displayedOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontSize: '4rem', color: '#edf2f7', marginBottom: '20px' }}>
                                <i className="fas fa-receipt"></i>
                            </div>
                            <h3 style={{ color: '#a0aec0' }}>لا يوجد طلبات في هذا القسم حالياً</h3>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '25px' }}>
                            {displayedOrders.map(order => (
                                <div key={order.id} style={{
                                    background: 'white',
                                    padding: '30px',
                                    borderRadius: '25px',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                                    border: '1px solid #edf2f7',
                                    transition: 'transform 0.3s',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                                <h4 style={{ margin: 0, fontSize: '1.4rem', color: '#2d3748' }}>رقم الطلب: {order.tracking_number}</h4>
                                                <span style={{
                                                    background: statusMap[order.status]?.color + '15',
                                                    color: statusMap[order.status]?.color,
                                                    padding: '5px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {statusMap[order.status]?.label}
                                                </span>
                                            </div>
                                            <p style={{ color: '#718096', margin: 0, fontSize: '0.9rem' }}>
                                                <i className="far fa-calendar-alt" style={{ marginLeft: '5px' }}></i>
                                                {new Date(order.created_at).toLocaleDateString('en-GB')}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'left' }}>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(order.tracking_number)
                                                    alert('تم نسخ رقم الطلب!')
                                                }}
                                                title="نسخ رقم الطلب"
                                                className="btn-text"
                                                style={{
                                                    background: 'none',
                                                    border: '1px solid #e2e8f0',
                                                    padding: '5px 10px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    color: '#718096',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                <i className="far fa-copy" style={{ marginLeft: '5px' }}></i>
                                                نسخ الرقم
                                            </button>
                                        </div>
                                    </div>

                                    {/* Premium Stepper Integration */}
                                    {activeTab === 'purchases' && !order.status.includes('cancelled') && (
                                        <div style={{
                                            margin: '40px 0',
                                            padding: '20px 0',
                                            borderTop: '1px dashed #e2e8f0',
                                            borderBottom: '1px dashed #e2e8f0'
                                        }}>
                                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '0 10px' }}>
                                                {/* Background Line */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '25px',
                                                    left: '30px',
                                                    right: '30px',
                                                    height: '4px',
                                                    background: '#edf2f7',
                                                    borderRadius: '2px',
                                                    zIndex: 0
                                                }}></div>

                                                {/* Active Progress Line */}
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '25px',
                                                    right: '30px',
                                                    width: `calc(${Math.max(0, getCurrentStepIndex(order.status)) / (statusSteps.length - 1) * 100}% - 30px)`,
                                                    height: '4px',
                                                    background: '#2d5a27',
                                                    borderRadius: '2px',
                                                    zIndex: 1,
                                                    transition: 'width 0.8s ease'
                                                }}></div>

                                                {/* Steps */}
                                                {statusSteps.map((step, index) => {
                                                    const isCompleted = getCurrentStepIndex(order.status) >= index;
                                                    const isActive = order.status === step.id;

                                                    return (
                                                        <div key={step.id} style={{ zIndex: 2, textAlign: 'center', width: '60px' }}>
                                                            <div style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '50%',
                                                                background: isCompleted ? '#2d5a27' : 'white',
                                                                border: `3px solid ${isCompleted ? '#2d5a27' : '#edf2f7'}`,
                                                                color: isCompleted ? 'white' : '#cbd5e0',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                margin: '0 auto 10px',
                                                                fontSize: '14px',
                                                                boxShadow: isActive ? '0 0 0 5px rgba(45, 90, 39, 0.1)' : 'none',
                                                                transition: 'all 0.3s ease'
                                                            }}>
                                                                <i className={step.icon}></i>
                                                            </div>
                                                            <p style={{
                                                                fontSize: '11px',
                                                                fontWeight: isActive ? 'bold' : '500',
                                                                color: isCompleted ? '#2d5a27' : '#a0aec0',
                                                                whiteSpace: 'nowrap',
                                                                margin: 0
                                                            }}>
                                                                {step.label}
                                                            </p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                        gap: '20px',
                                        background: '#f8fafc',
                                        padding: '20px',
                                        borderRadius: '15px',
                                        marginBottom: '20px'
                                    }}>
                                        <div>
                                            <p style={{ margin: '0 0 5px 0', color: '#a0aec0', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                {activeTab === 'purchases' ? 'المزرعة' : 'الزبون'}
                                            </p>
                                            <p style={{ margin: 0, fontWeight: 'bold', color: '#2d3748' }}>
                                                {activeTab === 'purchases' ? order.farm_name : order.delivery_name}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ margin: '0 0 5px 0', color: '#a0aec0', fontSize: '0.8rem', fontWeight: 'bold' }}>المجموع الإجمالي</p>
                                            <p style={{ margin: 0, fontWeight: 'bold', color: '#2d5a27', fontSize: '1.1rem' }}>{order.total_amount} ريال</p>
                                        </div>
                                        {activeTab === 'sales' && (
                                            <div>
                                                <p style={{ margin: '0 0 5px 0', color: '#a0aec0', fontSize: '0.8rem', fontWeight: 'bold' }}>العنوان</p>
                                                <p style={{ margin: 0, fontSize: '0.9rem' }}>{order.delivery_city} - {order.delivery_address}</p>
                                            </div>
                                        )}
                                    </div>

                                    {activeTab === 'sales' && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                            <label style={{ fontSize: '0.9rem', color: '#718096' }}>تحديث الحالة:</label>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                disabled={updatingStatus === order.id}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '10px',
                                                    border: '1px solid #edf2f7',
                                                    outline: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {Object.entries(statusMap).map(([key, val]) => (
                                                    <option key={key} value={key}>{val.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default OrdersPage
