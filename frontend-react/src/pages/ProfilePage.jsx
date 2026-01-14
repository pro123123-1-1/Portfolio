import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useNavigate } from 'react-router-dom'

function ProfilePage() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        role: ''
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('access_token')
            if (!token) {
                navigate('/login')
                return
            }

            const response = await fetch('http://127.0.0.1:8000/api/auth/profile/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setFormData({
                    username: data.username || '',
                    email: data.email || '',
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    phone_number: data.phone_number || '',
                    role: data.role || ''
                })
            } else {
                setError('فشل تحميل بيانات الملف الشخصي')
                if (response.status === 401) {
                    navigate('/login')
                }
            }
        } catch (err) {
            setError('حدث خطأ في الاتصال بالخادم')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
        setError('')
        setSuccess('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const token = localStorage.getItem('access_token')
            const response = await fetch('http://127.0.0.1:8000/api/auth/profile/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (response.ok) {
                setSuccess('تم تحديث البيانات بنجاح')
                setFormData(prev => ({ ...prev, ...data }))
            } else {
                // Handle validation errors from backend
                let errorMsg = 'فشل تحديث البيانات';
                if (data.detail) errorMsg = data.detail;
                if (data.email) errorMsg = `البريد الإلكتروني: ${data.email[0]}`;
                if (data.username) errorMsg = `اسم المستخدم: ${data.username[0]}`;

                setError(errorMsg)
            }
        } catch (err) {
            setError('حدث خطأ في الاتصال أثناء التحديث')
        } finally {
            setLoading(false)
        }
    }

    if (loading && !formData.username) return <div style={{ textAlign: 'center', marginTop: '100px' }}>جاري التحميل...</div>

    return (
        <>
            <Header />
            <div style={{ marginTop: '100px', minHeight: 'calc(100vh - 200px)' }}>
                <div className="auth-container" style={{ maxWidth: '600px', margin: '50px auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(45, 90, 39, 0.15)' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>الملف الشخصي</h2>

                    {error && (
                        <div style={{
                            color: '#c0392b',
                            backgroundColor: '#fadbd8',
                            padding: '12px',
                            borderRadius: '4px',
                            marginBottom: '15px',
                            borderRight: '4px solid #c0392b',
                            textAlign: 'right'
                        }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{
                            color: '#27ae60',
                            backgroundColor: '#d4efdf',
                            padding: '12px',
                            borderRadius: '4px',
                            marginBottom: '15px',
                            borderRight: '4px solid #27ae60',
                            textAlign: 'right'
                        }}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>نوع الحساب</label>
                            <input
                                type="text"
                                value={formData.role === 'farmer' ? 'مزارع (بائع)' : 'مشتري (مستهلك)'}
                                disabled
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: '#f8f9fa',
                                    color: '#666',
                                    cursor: 'not-allowed'
                                }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>الاسم الأول</label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>الاسم الأخير</label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px',
                                        boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>اسم المستخدم</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>البريد الإلكتروني</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>رقم الهاتف</label>
                            <input
                                type="tel"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                placeholder="05xxxxxxxx"
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button type="submit" className="btn-primary" style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '16px',
                            backgroundColor: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>
                            حفظ التغييرات
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    )
}

export default ProfilePage
