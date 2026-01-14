import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

function FarmersPage() {
    const [farms, setFarms] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchFarms()
    }, [])

    const fetchFarms = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/farms/')
            if (!response.ok) {
                throw new Error('Failed to fetch farms')
            }
            const data = await response.json()
            // Handle pagination (DRF returns { count, next, previous, results })
            if (data.results) {
                setFarms(data.results)
            } else {
                setFarms(data)
            }
        } catch (err) {
            console.error(err)
            setError('حدث خطأ في تحميل بيانات المزارعين')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>جاري التحميل...</div>

    return (
        <>
            <Header />
            <div style={{ marginTop: '100px', padding: '40px 0', minHeight: 'calc(100vh - 200px)' }}>
                <div className="container">
                    <h2 className="section-title">مزارعنا</h2>

                    {error && <div className="error-msg" style={{ display: 'block', textAlign: 'center' }}>{error}</div>}

                    <div className="products-grid">
                        {farms.length === 0 && !loading ? (
                            <p style={{ textAlign: 'center', gridColumn: '1/-1' }}>لا توجد مزارع مسجلة حالياً</p>
                        ) : (
                            farms.map(farm => (
                                <div key={farm.id} className="product-card">
                                    <div className="product-image" style={{ backgroundImage: `url('${farm.image || farm.image_url || 'https://via.placeholder.com/300'}')` }}></div>
                                    <div className="product-info">
                                        <h3>{farm.name}</h3>
                                        <div className="product-farm"><i className="fas fa-map-marker-alt"></i> {farm.administrative_region || 'غير محدد'}</div>
                                        <p style={{ fontSize: '0.9em', color: '#666', margin: '10px 0' }}>
                                            {farm.description ? farm.description.substring(0, 100) + '...' : 'لا يوجد وصف'}
                                        </p>
                                        {farm.type && <span style={{ background: '#e8f8f5', color: '#27ae60', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8em' }}>{farm.type}</span>}

                                        {/* Future enhancement: Link to Farm Details Page */}
                                        {/* <Link to={`/farms/${farm.id}`} className="btn-secondary" style={{display: 'block', textAlign: 'center', marginTop: '10px'}}>زيارة المزرعة</Link> */}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default FarmersPage
