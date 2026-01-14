import { useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'

function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // هنا يمكن إضافة كود إرسال النموذج إلى الخادم
    try {
      const response = await fetch('http://127.0.0.1:8000/api/contact/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setSubmitted(true)
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
        alert('شكراً لك! تم استلام رسالتك وسنقوم بالرد عليك في أقرب وقت.')
      } else {
        throw new Error('فشل الإرسال')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.')
    }
  }

  return (
    <>
      <Header />
      
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '50vh',
        display: 'flex',
        alignItems: 'center',
        textAlign: 'center',
        color: 'white',
        marginTop: '70px'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>اتصل بنا</h1>
          <p style={{ fontSize: '1.2rem' }}>نحن هنا لمساعدتك ونجيب على استفساراتك</p>
        </div>
      </section>

      {/* Contact Content */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            marginTop: '40px'
          }}>
            {/* Contact Info */}
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <h2 className="section-title" style={{ textAlign: 'right', fontSize: '1.8rem' }}>معلومات التواصل</h2>
              
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '25px',
                gap: '15px'
              }}>
                <i className="fas fa-map-marker-alt" style={{ fontSize: '1.2rem', color: 'var(--primary-color)', marginTop: '5px' }}></i>
                <div>
                  <h4 style={{ marginBottom: '5px', color: 'var(--primary-color)' }}>العنوان</h4>
                  <p>الرياض، حي العليا<br />شارع الملك فهد، المملكة العربية السعودية</p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '25px',
                gap: '15px'
              }}>
                <i className="fas fa-phone" style={{ fontSize: '1.2rem', color: 'var(--primary-color)', marginTop: '5px' }}></i>
                <div>
                  <h4 style={{ marginBottom: '5px', color: 'var(--primary-color)' }}>الهاتف</h4>
                  <p>+966 55 123 4567<br />+966 11 234 5678</p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '25px',
                gap: '15px'
              }}>
                <i className="fas fa-envelope" style={{ fontSize: '1.2rem', color: 'var(--primary-color)', marginTop: '5px' }}></i>
                <div>
                  <h4 style={{ marginBottom: '5px', color: 'var(--primary-color)' }}>البريد الإلكتروني</h4>
                  <p>info@almazari.com<br />support@almazari.com</p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                marginBottom: '25px',
                gap: '15px'
              }}>
                <i className="fas fa-clock" style={{ fontSize: '1.2rem', color: 'var(--primary-color)', marginTop: '5px' }}></i>
                <div>
                  <h4 style={{ marginBottom: '5px', color: 'var(--primary-color)' }}>أوقات العمل</h4>
                  <p>الأحد - الخميس: 8:00 ص - 10:00 م<br />الجمعة - السبت: 4:00 م - 10:00 م</p>
                </div>
              </div>

              <div style={{ marginTop: '30px' }}>
                <h4 style={{ marginBottom: '15px' }}>تابعنا على</h4>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <a href="#" style={{
                    background: 'var(--primary-color)',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none'
                  }}>
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" style={{
                    background: 'var(--primary-color)',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none'
                  }}>
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" style={{
                    background: 'var(--primary-color)',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none'
                  }}>
                    <i className="fab fa-snapchat"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
              <h2 className="section-title" style={{ textAlign: 'right', fontSize: '1.8rem' }}>أرسل رسالة</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: 'var(--text-color)'
                  }}>
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: 'var(--text-color)'
                  }}>
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: 'var(--text-color)'
                  }}>
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: 'var(--text-color)'
                  }}>
                    الموضوع *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">اختر الموضوع</option>
                    <option value="general">استفسار عام</option>
                    <option value="products">استفسار عن المنتجات</option>
                    <option value="farmers">انضم كمزارع</option>
                    <option value="complaint">شكوى</option>
                    <option value="suggestion">اقتراح</option>
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontWeight: '500',
                    color: 'var(--text-color)'
                  }}>
                    الرسالة *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      fontSize: '16px',
                      transition: 'border-color 0.3s',
                      boxSizing: 'border-box',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ width: '100%', padding: '15px' }}
                >
                  <i className="fas fa-paper-plane"></i> إرسال الرسالة
                </button>
              </form>
            </div>
          </div>

          {/* Map Section */}
          <div style={{ marginTop: '60px' }}>
            <h2 className="section-title">موقعنا</h2>
            <div style={{
              height: '400px',
              background: '#f5f5f5',
              borderRadius: '10px',
              overflow: 'hidden',
              marginTop: '20px'
            }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3622.125599396885!2d46.67278231500058!3d24.81358458407573!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2ee3d9aeb5e2e5%3A0xe8a8b8b8b8b8b8b8b!2sRiyadh%2C%20Saudi%20Arabia!5e0!3m2!1sen!2ssa!4v1620000000000!5m2!1sen!2ssa"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="موقعنا"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export default ContactPage

