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
        stock_quantity: '',
        unit: 'kg',
        is_available: true,
        image: null
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
            const formData = new FormData()
            formData.append('name', farmData.name)
            formData.append('type', farmData.type)
            formData.append('location', farmData.location)
            formData.append('description', farmData.description)
            if (farmData.image) {
                formData.append('image', farmData.image)
            }

            const response = await fetch('http://127.0.0.1:8000/api/farms/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
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


    // Editing state
    const [editingProduct, setEditingProduct] = useState(null)

    const handleEditClick = (product) => {
        setEditingProduct(product)
        setProductData({
            name: product.name,
            price: product.price,
            stock_quantity: product.stock_quantity,
            unit: product.unit,
            is_available: product.is_available,
            image: null // Start with null, user only uploads if changing
        })
        setShowProductForm(true)
    }

    const resetForm = () => {
        setEditingProduct(null)
        setProductData({ name: '', price: '', stock_quantity: '', unit: 'kg', is_available: true, image: null })
        setShowProductForm(false)
    }

    const handleAddProduct = async (e) => {
        e.preventDefault()
        if (!farm) return

        try {
            const token = getToken()
            const formData = new FormData()

            // Only append farm ID if creating new product, though backend might ignore it on update
            if (!editingProduct) {
                formData.append('farm', farm.id)
            }

            formData.append('name', productData.name)
            formData.append('price', productData.price)
            formData.append('stock_quantity', productData.stock_quantity)
            formData.append('unit', productData.unit)

            if (productData.image) {
                formData.append('image', productData.image)
            }

            const url = editingProduct
                ? `http://127.0.0.1:8000/api/products/${editingProduct.id}/`
                : 'http://127.0.0.1:8000/api/products/'

            const method = editingProduct ? 'PATCH' : 'POST'

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (response.ok) {
                const savedProduct = await response.json()

                if (editingProduct) {
                    // Update existing product in list
                    setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p))
                    alert('تم تحديث المنتج بنجاح!')
                } else {
                    // Add new product
                    setProducts([savedProduct, ...products])
                    alert('تم إضافة المنتج بنجاح!')
                }

                resetForm()
            } else {
                const errorData = await response.json()
                alert(`فشل ${editingProduct ? 'تحديث' : 'إضافة'} المنتج: ` + JSON.stringify(errorData))
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
            <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: '60px' }}>
                {/* Dashboard Hero */}
                <div style={{
                    background: 'linear-gradient(135deg, #2d5a27 0%, #1a3c17 100%)',
                    padding: '120px 0 60px',
                    color: 'white',
                    marginBottom: '40px'
                }}>
                    <div className="container">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '10px' }}>لوحة تحكم المزارع</h1>
                                <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>إدارة منتجاتك ومبيعاتك من مكان واحد</p>
                            </div>
                            {farm && (
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '15px 25px',
                                    borderRadius: '12px',
                                    backdropFilter: 'blur(10px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px'
                                }}>
                                    <div style={{
                                        width: '50px', height: '50px', borderRadius: '50%',
                                        background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#2d5a27', fontSize: '1.5rem'
                                    }}>
                                        <i className="fas fa-tractor"></i>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>مزرعتك</div>
                                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{farm.name}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="container">
                    {error && (
                        <div style={{
                            background: '#fff5f5', color: '#c53030', padding: '15px', borderRadius: '8px',
                            textAlign: 'center', marginBottom: '30px', border: '1px solid #feb2b2'
                        }}>
                            {error}
                        </div>
                    )}

                    {!farm && showFarmForm && (
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{
                                background: 'white',
                                borderRadius: '20px',
                                padding: '40px',
                                boxShadow: '0 10px 40px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                                    <div style={{
                                        width: '80px', height: '80px', background: '#f0fff4', color: '#2d5a27',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '2.5rem', margin: '0 auto 20px'
                                    }}>
                                        <i className="fas fa-leaf"></i>
                                    </div>
                                    <h2 style={{ fontSize: '1.8rem', color: '#2d3748' }}>ابدأ رحلتك كمزارع</h2>
                                    <p style={{ color: '#718096' }}>أضف تفاصيل مزرعتك لتتمكن من عرض منتجاتك للآلاف من العملاء</p>
                                </div>

                                <form onSubmit={handleCreateFarm}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568' }}>اسم المزرعة</label>
                                            <input
                                                type="text"
                                                required
                                                value={farmData.name}
                                                onChange={e => setFarmData({ ...farmData, name: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                                                placeholder="مثال: مزارع القصيم للتمور"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568' }}>نوع المنتجات الرئيسي</label>
                                            <select
                                                value={farmData.type}
                                                onChange={e => setFarmData({ ...farmData, type: e.target.value })}
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                                            >
                                                <option value="تمور">تمور</option>
                                                <option value="ألبان">ألبان</option>
                                                <option value="خضروات">خضروات</option>
                                                <option value="فواكه">فواكه</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568' }}>الموقع (رابط خرائط جوجل)</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="url"
                                                required
                                                value={farmData.location}
                                                onChange={e => setFarmData({ ...farmData, location: e.target.value })}
                                                style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                                                placeholder="https://maps.google.com/..."
                                            />
                                            <i className="fas fa-map-marker-alt" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e0' }}></i>
                                        </div>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568' }}>وصف المزرعة</label>
                                        <textarea
                                            value={farmData.description}
                                            onChange={e => setFarmData({ ...farmData, description: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', minHeight: '120px' }}
                                            placeholder="اكتب نبذة مختصرة عن مزرعتك ومنتجاتك..."
                                        ></textarea>
                                    </div>

                                    <div className="form-group" style={{ marginBottom: '30px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568' }}>صورة المزرعة</label>
                                        <div style={{
                                            border: '2px dashed #cbd5e0', padding: '30px', borderRadius: '15px', textAlign: 'center', cursor: 'pointer',
                                            background: '#f8fafc', transition: 'all 0.3s'
                                        }}
                                            onClick={() => document.getElementById('farm-image-upload').click()}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = '#2d5a27'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = '#cbd5e0'}
                                        >
                                            <input
                                                id="farm-image-upload"
                                                type="file"
                                                onChange={e => setFarmData({ ...farmData, image: e.target.files[0] })}
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                            />
                                            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: '#a0aec0', marginBottom: '10px' }}></i>
                                            <p style={{ color: '#718096', margin: 0 }}>
                                                {farmData.image ? farmData.image.name : 'اسحب الصورة هنا أو اضغط للرفع'}
                                            </p>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px', fontSize: '1.1rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)' }}>
                                        إنشاء المزرعة
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}


                    {farm && (
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '30px',
                                background: 'white',
                                padding: '20px',
                                borderRadius: '15px',
                                boxShadow: '0 5px 20px rgba(0,0,0,0.03)'
                            }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#2d3748' }}>المنتجات</h3>
                                    <p style={{ margin: '5px 0 0', color: '#a0aec0', fontSize: '0.9rem' }}>لديك {products.length} من المنتجات المعروضة للبيع</p>
                                </div>

                                <button
                                    className="btn-primary"
                                    onClick={() => { resetForm(); setShowProductForm(true); }}
                                    style={{
                                        borderRadius: '10px',
                                        padding: '12px 25px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)'
                                    }}
                                >
                                    <i className="fas fa-plus"></i> إضافة منتج جديد
                                </button>
                            </div>

                            {showProductForm && (
                                <div style={{
                                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    padding: '20px'
                                }} onClick={(e) => { if (e.target === e.currentTarget) resetForm() }}>

                                    <div className="auth-container" style={{
                                        width: '100%', maxWidth: '600px', margin: 0,
                                        maxHeight: '90vh', overflowY: 'auto'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                            <h4 style={{ margin: 0, fontSize: '1.5rem' }}>
                                                {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                                            </h4>
                                            <button onClick={resetForm} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#a0aec0' }}>&times;</button>
                                        </div>

                                        <form onSubmit={handleAddProduct}>
                                            <div className="form-group">
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568' }}>اسم المنتج</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={productData.name}
                                                    onChange={e => setProductData({ ...productData, name: e.target.value })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                                                    placeholder="مثال: خلاص فاخر"
                                                />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div className="form-group">
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568' }}>السعر (ريال)</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        value={productData.price}
                                                        onChange={e => setProductData({ ...productData, price: e.target.value })}
                                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568' }}>الكمية المتوفرة</label>
                                                    <input
                                                        type="number"
                                                        required
                                                        value={productData.stock_quantity}
                                                        onChange={e => setProductData({ ...productData, stock_quantity: e.target.value })}
                                                        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568' }}>وصف حجم الوحدة</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={productData.unit}
                                                    onChange={e => setProductData({ ...productData, unit: e.target.value })}
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                                                    placeholder="مثال: كرتون 3 كيلو"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#4a5568' }}>صورة المنتج</label>
                                                <div style={{
                                                    border: '2px dashed #cbd5e0', padding: '20px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
                                                    background: '#f8fafc', transition: 'all 0.3s'
                                                }}
                                                    onClick={() => document.getElementById('product-image-upload').click()}
                                                >
                                                    <input
                                                        id="product-image-upload"
                                                        type="file"
                                                        onChange={e => setProductData({ ...productData, image: e.target.files[0] })}
                                                        accept="image/*"
                                                        style={{ display: 'none' }}
                                                    />
                                                    <i className="fas fa-image" style={{ fontSize: '1.5rem', color: '#a0aec0', marginBottom: '8px' }}></i>
                                                    <p style={{ color: '#718096', margin: 0, fontSize: '0.9rem' }}>
                                                        {productData.image ? productData.image.name : 'اضغط لرفع صورة المنتج'}
                                                    </p>
                                                    {editingProduct && !productData.image && (
                                                        <p style={{ fontSize: '0.8rem', color: '#a0aec0', marginTop: '5px' }}>اتركها فارغة للاحتفاظ بالصورة الحالية</p>
                                                    )}
                                                </div>
                                            </div>
                                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '15px', marginTop: '10px', borderRadius: '10px' }}>
                                                {editingProduct ? 'تحديث المنتج' : 'حفظ المنتج'}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                                {products.length === 0 ? (
                                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '15px', color: '#a0aec0' }}>
                                        <i className="fas fa-box-open" style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}></i>
                                        <h3>لا توجد منتجات مضافة بعد</h3>
                                        <p>أضف منتجك الأول لتبدأ في استقبال الطلبات</p>
                                        <button
                                            onClick={() => setShowProductForm(true)}
                                            style={{ marginTop: '20px', color: '#2d5a27', background: 'none', border: '2px solid #2d5a27', padding: '10px 25px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            إضافة منتج الآن
                                        </button>
                                    </div>
                                ) : products.map(p => (
                                    <div key={p.id} style={{
                                        background: 'white',
                                        borderRadius: '15px',
                                        overflow: 'hidden',
                                        boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                                        transition: 'transform 0.3s ease',
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            height: '200px',
                                            backgroundImage: `url(${p.image || p.image_url || 'https://via.placeholder.com/300?text=No+Image'})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}>
                                            <div style={{
                                                position: 'absolute', top: '15px', right: '15px',
                                                background: 'rgba(255,255,255,0.9)', padding: '5px 10px',
                                                borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', color: '#2d3748'
                                            }}>
                                                {p.unit}
                                            </div>
                                        </div>
                                        <div style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#2d3748' }}>{p.name}</h4>
                                                <span style={{ color: '#2d5a27', fontWeight: 'bold', fontSize: '1.1rem' }}>{p.price} ريال</span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '0.9rem', color: '#718096' }}>
                                                <i className="fas fa-cubes"></i>
                                                <span>المتوفر: {p.stock_quantity}</span>
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => handleDeleteProduct(p.id)}
                                                    style={{
                                                        flex: 1,
                                                        background: '#fff5f5',
                                                        color: '#c53030',
                                                        border: 'none',
                                                        padding: '10px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        transition: 'background 0.2s',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                                    }}
                                                >
                                                    <i className="fas fa-trash-alt"></i> حذف
                                                </button>
                                                {/* Edit button placeholder for future functionality */}
                                                <button
                                                    style={{
                                                        flex: 1,
                                                        background: '#edf2f7',
                                                        color: '#4a5568',
                                                        border: 'none',
                                                        padding: '10px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                                    }}
                                                    onClick={() => handleEditClick(p)}
                                                >
                                                    <i className="fas fa-edit"></i> تعديل
                                                </button>
                                            </div>
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
