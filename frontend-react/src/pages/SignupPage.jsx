import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

function SignupPage() {
  const [searchParams] = useSearchParams()
  const roleFromUrl = searchParams.get('role')

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    role: roleFromUrl === 'farmer' ? 'farmer' : 'consumer'
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Update role if it changes in URL
    if (roleFromUrl === 'farmer') {
      setFormData(prev => ({ ...prev, role: 'farmer' }))
    }
  }, [roleFromUrl])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const is_farmer = formData.role === 'farmer'
    const is_consumer = formData.role === 'consumer'

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'ar'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password2: formData.password2,
          is_farmer,
          is_consumer
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.')
        navigate('/login')
      } else {
        if (data.password) {
          const passwordError = Array.isArray(data.password) ? data.password[0] : data.password;
          if (passwordError.includes('too short')) {
            setError('كلمة المرور قصيرة جداً. يجب أن تتكون من 8 خانات على الأقل.');
          } else if (passwordError.includes('common')) {
            setError('كلمة المرور شائعة جداً، يرجى اختيار كلمة مرور أصعب.');
          } else if (passwordError.includes('numeric')) {
            setError('كلمة المرور يجب ألا تكون رقمية بالكامل.');
          } else {
            setError(passwordError);
          }
        } else if (data.email) {
          const emailError = Array.isArray(data.email) ? data.email[0] : data.email;
          if (emailError.includes('unique')) {
            setError('البريد الإلكتروني مسجل مسبقاً.');
          } else {
            setError(emailError);
          }
        } else if (data.username) {
          setError(Array.isArray(data.username) ? data.username[0] : data.username)
        } else {
          setError(data.detail || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setError('حدث خطأ في الاتصال بالخادم.')
    }
  }

  return (
    <>
      <Header />
      <div style={{ marginTop: '100px', minHeight: 'calc(100vh - 200px)' }}>
        <div className="auth-container" style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(45, 90, 39, 0.15)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
            {formData.role === 'farmer' ? 'انضم كمزارع' : 'إنشاء حساب جديد'}
          </h2>
          {error && (
            <div style={{
              color: '#c0392b',
              backgroundColor: '#fadbd8',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '15px',
              borderRight: '4px solid #c0392b',
              textAlign: 'right',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>الاسم الكامل</label>
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
              <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>كلمة المرور</label>
              <input
                type="password"
                name="password"
                value={formData.password}
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
              <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>تأكيد كلمة المرور</label>
              <input
                type="password"
                name="password2"
                value={formData.password2}
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
              <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>نوع الحساب</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              >
                <option value="consumer">مشتري (مستهلك)</option>
                <option value="farmer">مزارع (بائع)</option>
              </select>
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
              إنشاء حساب
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '15px', textAlign: 'center' }}>
            <p>لديك حساب بالفعل؟ <Link to="/login" style={{ color: '#27ae60', textDecoration: 'none' }}>سجل الدخول</Link></p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default SignupPage

