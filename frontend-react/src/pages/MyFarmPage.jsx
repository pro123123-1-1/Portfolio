import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

function MyFarmPage() {
    const navigate = useNavigate()
    const [farm, setFarm] = useState(null)
    const [products, setProducts] = useState([])

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Forms state
    const [showFarmForm, setShowFarmForm] = useState(false)
    const [showProductForm, setShowProductForm] = useState(false)

    const [farmData, setFarmData] = useState({
        name: '',
        description: '',
        location: '',
        type: 'تمور',
        daily_capacity: 10
    })

    const [productData, setProductData] = useState({
        name: '',
        price: '',
        stock_quantity: '',
        unit: 'kg',
        is_available: true
    })

    useEffect(() => {
        fetchMyFarm()
    }, [])

    const getToken = () => localStorage.getItem('access_token')

    const fetchMyFarm = async () => {
        try {
            const token = getToken()
            if (!token) {
                navigate('/login')
                return
            }

            // 1. Get User ID first or filter by owner directly if backend supports "my_farm" endpoint
            // Assuming backend allows filtering farms by owner=<current_user> or returns only user's farms
            // Based on views.py: FarmViewSet allows filtering by owner via query params, but better if we can just get "my" farm.
            // Let's try getting all farms for the user via a filtered request if possible, or just all and filter in JS (inefficient but works for MVP)
            // Actually, ideally the backend should have an endpoint for "my farm".
            // Let's try to fetch user info first to get ID, then fetch farms? 
            // Or simply: FarmViewSet has perform_create using request.user.
            // Let's use the list endpoint and filter by owned logic if possible, 
            // BUT standard way: GET /api/farms/?owner=<my_id>

            // First get profile to know ID
            const profileRes = await fetch('http://127.0.0.1:8000/api/auth/profile/', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (!profileRes.ok) throw new Error('Failed to get profile')
            const profile = await profileRes.json()

            if (profile.role !== 'farmer' && !profile.is_farmer) {
                setError('هذه الصفحة مخصصة للمزارعين فقط')
                setLoading(false)
                return
            }

            // Now fetch farms filtered by owner ID
            const farmsRes = await fetch(`http://127.0.0.1:8000/api/farms/?owner=${profile.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (farmsRes.ok) {
                const farmsData = await farmsRes.json()
                const myFarms = farmsData.results ? farmsData.results : farmsData

                if (myFarms.length > 0) {
                    setFarm(myFarms[0])
                    // Fetch products for this farm
                    fetchProducts(myFarms[0].id)

                } else {
                    setShowFarmForm(true) // No farm, show form to create one
                }
            }

        } catch (err) {
            console.error(err)
            setError('حدث خطأ في تحميل بيانات المزرعة')
        } finally {
            setLoading(false)
        }
    }

    const fetchProducts = async (farmId) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/products/?farm=${farmId}`)
            const data = await res.json()
            if (data.results) {
                setProducts(data.results)
            } else {
                setProducts(data)
            }
        } catch (e) {
            console.error("Failed to load products", e)
        }
    }





    const handleCreateFarm = async (e) => {
        e.preventDefault()
        try {
            const token = getToken()
            const response = await fetch('http://127.0.0.1:8000/api/farms/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(farmData)
            })

            if (response.ok) {
                const newFarm = await response.json()
                setFarm(newFarm)
                setShowFarmForm(false)
                alert('تم إنشاء المزرعة بنجاح!')
            } else {
                const errorData = await response.json()
                alert('فشل إنشاء المزرعة: ' + JSON.stringify(errorData))
            }
        } catch (err) {
            alert('حدث خطأ أثناء الاتصال')
        }
    }

    const handleAddProduct = async (e) => {
        e.preventDefault()
        if (!farm) return

        try {
            const token = getToken()
            const payload = {
                ...productData,
                farm: farm.id
            }

            const response = await fetch('http://127.0.0.1:8000/api/products/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                const newProduct = await response.json()
                setProducts([newProduct, ...products])
                setShowProductForm(false)
                setProductData({ name: '', price: '', stock_quantity: '', unit: 'kg', is_available: true }) // Reset
                alert('تم إضافة المنتج بنجاح!')
            } else {
                const errorData = await response.json()
                alert('فشل إضافة المنتج: ' + JSON.stringify(errorData))
            }
        } catch (err) {
            alert('حدث خطأ أثناء الاتصال')
        }
    }

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) return

        try {
            const token = getToken()
            const response = await fetch(`http://127.0.0.1:8000/api/products/${productId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                setProducts(products.filter(p => p.id !== productId))
            } else {
                alert('فشل حذف المنتج')
            }
        } catch (e) {
            alert('error deleting')
        }
    }

    if (loading) return <div style={{ textAlign: 'center', marginTop: '100px' }}>جاري التحميل...</div>

    return (
        <>
            <Header />
            <div style={{ marginTop: '100px', padding: '20px', minHeight: 'calc(100vh - 200px)' }}>
                <div className="container">
                    <h2 className="section-title">لوحة تحكم المزارع</h2>

                    {error && <div className="error-msg">{error}</div>}

                    {!farm && showFarmForm && (
                        <div className="auth-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                            <h3>أضف مزرعتك لبدء البيع</h3>
                            <form onSubmit={handleCreateFarm}>
                                <div className="form-group">
                                    <label>اسم المزرعة</label>
                                    <input type="text" required value={farmData.name} onChange={e => setFarmData({ ...farmData, name: e.target.value })} style={{ width: '100%', padding: '8px' }} />
                                </div>
                                <div className="form-group">
                                    <label>نوع المنتجات</label>
                                    <select value={farmData.type} onChange={e => setFarmData({ ...farmData, type: e.target.value })} style={{ width: '100%', padding: '8px' }}>
                                        <option value="تمور">تمور</option>
                                        <option value="ألبان">ألبان</option>
                                        <option value="خضروات">خضروات</option>
                                        <option value="فواكه">فواكه</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>الموقع (رابط خرائط جوجل)</label>
                                    <input type="url" required value={farmData.location} onChange={e => setFarmData({ ...farmData, location: e.target.value })} style={{ width: '100%', padding: '8px' }} />
                                </div>
                                <div className="form-group">
                                    <label>وصف المزرعة</label>
                                    <textarea value={farmData.description} onChange={e => setFarmData({ ...farmData, description: e.target.value })} style={{ width: '100%', padding: '8px' }}></textarea>
                                </div>
                                <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>إنشاء المزرعة</button>
                            </form>
                        </div>
                    )}

                    {farm && (
                        <div>


                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3>منتجاتي</h3>
                                <button className="btn-primary" onClick={() => setShowProductForm(!showProductForm)}>
                                    {showProductForm ? 'إلغاء' : '+ إضافة منتج جديد'}
                                </button>
                            </div>

                            {showProductForm && (
                                <div className="auth-container" style={{ maxWidth: '500px', margin: '0 auto 30px', border: '2px solid #27ae60' }}>
                                    <h4 style={{ textAlign: 'center' }}>إضافة منتج جديد</h4>
                                    <form onSubmit={handleAddProduct}>
                                        <div className="form-group">
                                            <label>اسم المنتج</label>
                                            <input type="text" required value={productData.name} onChange={e => setProductData({ ...productData, name: e.target.value })} style={{ width: '100%', padding: '8px' }} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <div className="form-group">
                                                <label>السعر (ريال)</label>
                                                <input type="number" required value={productData.price} onChange={e => setProductData({ ...productData, price: e.target.value })} style={{ width: '100%', padding: '8px' }} />
                                            </div>
                                            <div className="form-group">
                                                <label>الكمية المتوفرة</label>
                                                <input type="number" required value={productData.stock_quantity} onChange={e => setProductData({ ...productData, stock_quantity: e.target.value })} style={{ width: '100%', padding: '8px' }} />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>الوحدة (كيلو، كرتون...)</label>
                                            <input type="text" required value={productData.unit} onChange={e => setProductData({ ...productData, unit: e.target.value })} style={{ width: '100%', padding: '8px' }} />
                                        </div>
                                        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>حفظ المنتج</button>
                                    </form>
                                </div>
                            )}

                            <div className="products-grid">
                                {products.length === 0 ? <p>لا توجد منتجات مضافة بعد.</p> : products.map(p => (
                                    <div key={p.id} className="product-card">
                                        <div className="product-image" style={{ backgroundImage: `url(${p.image || p.image_url || 'https://via.placeholder.com/150'})` }}></div>
                                        <div className="product-info">
                                            <h4>{p.name}</h4>
                                            <p>{p.price} ريال / {p.unit}</p>
                                            <p>الكمية: {p.stock_quantity}</p>
                                            <button onClick={() => handleDeleteProduct(p.id)} style={{ background: '#c0392b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginTop: '5px' }}>حذف</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    )
}

export default MyFarmPage
