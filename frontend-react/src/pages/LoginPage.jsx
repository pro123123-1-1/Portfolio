import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const navigate = useNavigate()

  const getErrorMessage = (data, statusCode) => {
    if (data.error) {
      if (data.error === 'Invalid credentials') {
        return 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.'
      }
      return data.error
    }

    if (data.detail) {
      return data.detail
    }

    if (data.email) {
      if (Array.isArray(data.email)) {
        return data.email[0]
      }
      return data.email
    }

    if (data.password) {
      if (Array.isArray(data.password)) {
        return data.password[0]
      }
      return data.password
    }

    if (data.non_field_errors) {
      if (Array.isArray(data.non_field_errors)) {
        return data.non_field_errors[0]
      }
      return data.non_field_errors
    }

    if (statusCode === 401) {
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.'
    }

    if (statusCode === 400) {
      return 'البيانات المدخلة غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.'
    }

    return 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setEmailError(false)
    setPasswordError(false)
    setError('')

    const emailValue = email.trim()
    const passwordValue = password

    if (!emailValue) {
      setError('يرجى إدخال البريد الإلكتروني.')
      setEmailError(true)
      return
    }

    if (!passwordValue) {
      setError('يرجى إدخال كلمة المرور.')
      setPasswordError(true)
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailValue, password: passwordValue })
      })

      const data = await response.json()

      if (response.ok) {
        if (data.tokens) {
          localStorage.setItem('access_token', data.tokens.access)
          localStorage.setItem('refresh_token', data.tokens.refresh)
        } else if (data.access && data.refresh) {
          localStorage.setItem('access_token', data.access)
          localStorage.setItem('refresh_token', data.refresh)
        }

        navigate('/')
      } else {
        const errorMessage = getErrorMessage(data, response.status)
        setError(errorMessage)
        setEmailError(true)
        setPasswordError(true)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('حدث خطأ في الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.')
    }
  }

  return (
    <>
      <Header />
      <div style={{ marginTop: '100px', minHeight: 'calc(100vh - 200px)' }}>
        <div className="auth-container" style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(45, 90, 39, 0.15)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>تسجيل الدخول</h2>
          {error && (
            <div className="error-msg show" style={{
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
              <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setEmailError(false)
                  setError('')
                }}
                className={emailError ? 'error' : ''}
                required
                placeholder="example@domain.com"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: emailError ? '2px solid #c0392b' : '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPasswordError(false)
                  setError('')
                }}
                className={passwordError ? 'error' : ''}
                required
                placeholder="********"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: passwordError ? '2px solid #c0392b' : '1px solid #ddd',
                  borderRadius: '4px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '16px' }}>
              دخول
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '15px', textAlign: 'center' }}>
            <p>ليس لديك حساب؟ <Link to="/signup" style={{ color: '#27ae60', textDecoration: 'none' }}>سجل الآن</Link></p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default LoginPage

